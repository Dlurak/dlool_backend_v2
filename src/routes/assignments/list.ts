import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { removeDuplicates } from "utils/arrays/duplicates";
import { filterTruthy } from "utils/arrays/filter";
import { areSameValue } from "utils/arrays/general";
import { merge } from "utils/arrays/merge";
import { normalDateToCustom } from "utils/dates/customAndNormal";
import { multipleClasses } from "utils/db/classes";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";
import { split } from "utils/strings/split";
import { z } from "zod";

const classesSchema = z.array(z.string().min(1)).nonempty();

export const listAssignments = new Elysia().use(HttpStatusCode()).get(
	"/",
	async ({ query, set, httpStatus }) => {
		const classesResult = classesSchema.safeParse(
			filterTruthy(split(query.classes)),
		);
		if (!classesResult.success) {
			set.status = httpStatus.HTTP_400_BAD_REQUEST;
			return responseBuilder("error", {
				error: "Classes must be an array of strings",
			});
		}
		const classNames = removeDuplicates(classesResult.data).sort();

		const assignmentsQuery = (limit: number, offset: number) =>
			e.select(e.Assignment, (a) => {
				const classMatches = e.op(a.class.name, "in", e.set(...classNames));
				const schoolMatches = e.op(a.class.school.name, "=", query.school);

				// -1 disables the limit
				const internalLimit = limit === -1 ? undefined : limit;

				return {
					filter: e.op(classMatches, "and", schoolMatches),
					limit: internalLimit,
					offset,

					subject: true,
					description: true,
					dueDate: true,
					fromDate: true,
					updates: true,
					updatedBy: () => ({ username: true }),
				};
			});

		const result = await promiseResult(() => {
			return client.transaction(async (tx) => {
				const assignments = await assignmentsQuery(
					query.limit,
					query.offset,
				).run(tx);
				const count = await e.count(assignmentsQuery(-1, 0)).run(tx);
				const classes = await multipleClasses({
					schoolName: query.school,
					classNames: classNames,
				})
					.run(tx)
					.then((c) => (c ? c.map((cl) => cl.name).sort() : []));

				return { assignments, count, classes };
			});
		});

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}

		if (!areSameValue(result.data.classes, classNames)) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "Not all of the specified classes exist",
			});
		}

		const formatted = result.data.assignments.map((assignment) => {
			const updates = merge(
				{
					key: "user",
					array: assignment.updatedBy.map((u) => u.username),
				},
				{
					key: "timestamp",
					array: assignment.updates.map((d) => d.getTime()),
				},
			);

			return {
				subject: assignment.subject,
				description: assignment.description,
				from: normalDateToCustom(assignment.fromDate),
				due: normalDateToCustom(assignment.dueDate),
				updates,
			};
		});

		return responseBuilder("success", {
			message: "Received data",
			data: {
				totalCount: result.data.count,
				assignments: formatted,
			},
		});
	},
	{
		query: t.Object({
			school: t.String({ minLength: 1 }),
			classes: t.String({ minLength: 1 }),
			limit: t.Numeric({ minimum: -1, default: 50 }),
			offset: t.Numeric({ minimum: 0, default: 0 }),
		}),
	},
);
