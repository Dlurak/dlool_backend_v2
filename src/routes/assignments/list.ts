import e from "@edgedb";
import { DATE } from "constants/regex";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { removeDuplicates } from "utils/arrays/duplicates";
import { filterTruthy } from "utils/arrays/filter";
import { areSameValue } from "utils/arrays/general";
import {
	normalDateToCustom,
	stringToNormal,
} from "utils/dates/customAndNormal";
import { multipleClasses } from "utils/db/classes";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";
import { split } from "utils/strings/split";
import { surround } from "utils/strings/surround";
import { savePredicate } from "utils/undefined";
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

		const isDescending = query.orderDirection === "desc";

		const descFilter = query.filter?.description;
		const subjFilter = query.filter?.subject;

		const earliestFrom = savePredicate(
			query.filter?.from?.earliest,
			stringToNormal,
		);
		const latestFrom = savePredicate(
			query.filter?.from?.latest,
			stringToNormal,
		);

		const earliestDue = savePredicate(
			query.filter?.due?.earliest,
			stringToNormal,
		);
		const latestDue = savePredicate(query.filter?.due?.latest, stringToNormal);

		const assignmentsQuery = (limit: number, offset: number) =>
			e.select(e.Assignment, (a) => {
				const classMatches = e.op(a.class.name, "in", e.set(...classNames));
				const schoolMatches = e.op(a.class.school.name, "=", query.school);

				// I know that the `?? false` is unnecessary, but i want it to show the default value
				const descFilterEdge = descFilter
					? descFilter.exact ?? false
						? e.op(a.description, "=", descFilter.query)
						: e.op(a.description, "ilike", surround(descFilter.query, "%"))
					: e.cast(e.bool, true);

				const subjFilterEdge = subjFilter
					? subjFilter.exact ?? false
						? e.op(a.subject, "=", subjFilter.query)
						: e.op(a.subject, "ilike", surround(subjFilter.query, "%"))
					: e.cast(e.bool, true);

				const earliestFromFilter = earliestFrom
					? e.op(a.fromDate, ">=", earliestFrom)
					: e.bool(true);
				const latestFromFilter = latestFrom
					? e.op(a.fromDate, "<=", latestFrom)
					: e.bool(true);
				const fromFilter = e.op(earliestFromFilter, "and", latestFromFilter);

				const earliestDueFilter = earliestDue
					? e.op(a.dueDate, ">=", earliestDue)
					: e.bool(true);
				const latestDueFilter = latestDue
					? e.op(a.dueDate, "<=", latestDue)
					: e.bool(true);
				const dueFilter = e.op(earliestDueFilter, "and", latestDueFilter);

				const generalFilter = e.op(classMatches, "and", schoolMatches);
				const specificFilter = e.op(subjFilterEdge, "and", descFilterEdge);
				const dateFilter = e.op(dueFilter, "and", fromFilter);

				// -1 disables the limit
				const internalLimit = limit === -1 ? undefined : limit;

				const orderExpression = {
					due: a.dueDate,
					from: a.fromDate,
					subject: a.subject,
					description: a.description,
					versionsCount: e.count(a.updates),
				}[query.orderKey];

				return {
					filter: e.op(
						generalFilter,
						"and",
						e.op(specificFilter, "and", dateFilter),
					),
					limit: internalLimit,
					offset,
					order_by: {
						expression: orderExpression,
						direction: isDescending ? e.DESC : e.ASC,
						empty: e.EMPTY_FIRST,
					},

					subject: true,
					description: true,
					dueDate: true,
					fromDate: true,
					updates: () => ({
						user: () => ({ username: true, displayname: true }),
						time: true,
					}),
					id: true,
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

		const formatted = result.data.assignments.map((assignment) => ({
			subject: assignment.subject,
			description: assignment.description,
			from: normalDateToCustom(assignment.fromDate),
			due: normalDateToCustom(assignment.dueDate),
			updates: assignment.updates.map((upd) => ({
				user: upd.user,
				time: upd.time.getTime(),
			})),
			id: assignment.id,
		}));

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
			orderDirection: t.Union([t.Literal("asc"), t.Literal("desc")], {
				default: "desc",
			}),
			orderKey: t.Union(
				[
					t.Literal("due"),
					t.Literal("from"),
					t.Literal("subject"),
					t.Literal("description"),
					t.Literal("versionsCount"),
				],
				{ default: "due" },
			),
			filter: t.Optional(
				t.ObjectString({
					from: t.Optional(
						t.Object({
							earliest: t.Optional(t.RegExp(DATE)),
							latest: t.Optional(t.RegExp(DATE)),
						}),
					),
					due: t.Optional(
						t.Object({
							earliest: t.Optional(t.RegExp(DATE)),
							latest: t.Optional(t.RegExp(DATE)),
						}),
					),
					subject: t.Optional(
						t.Object({
							query: t.String({ minLength: 1 }),
							exact: t.Optional(t.Boolean()),
						}),
					),
					description: t.Optional(
						t.Object({
							query: t.String({ minLength: 1 }),
							exact: t.Optional(t.Boolean()),
						}),
					),
				}),
			),
		}),
	},
);
