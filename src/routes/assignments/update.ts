import e from "@edgedb";
import { DATABASE_WRITE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { atLeastOneTruthy } from "utils/arrays/truthy";
import { customDateToNormal } from "utils/dates/customAndNormal";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";
import { savePredicate } from "utils/undefined";

const successResponse = responseBuilder("success", {
	message: "Successfully updated assignment",
	data: null,
});

export const updateAssignment = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.patch(
		"/:id",
		async ({ httpStatus, set, auth, params, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const due = savePredicate(body.dueDate, customDateToNormal);
			const from = savePredicate(body.fromDate, customDateToNormal);
			const { subject, description } = body;

			const atLeastOneTruthyInput = atLeastOneTruthy([
				due,
				from,
				subject,
				description,
			]);
			if (!atLeastOneTruthyInput) {
				return successResponse;
			}

			const query = e.update(e.Assignment, (a) => ({
				filter_single: e.op(
					e.op(a.id, "=", e.cast(e.uuid, params.id)),
					"and",
					e.op(auth.username, "in", a.class.students.username),
				),
				set: {
					updates: {
						"+=": e.insert(e.Change, {
							user: e.select(e.User, (u) => ({
								filter_single: e.op(u.username, "=", auth.username),
							})),
						}),
					},
					subject: subject ?? a.subject,
					description: description ?? a.description,
					dueDate: due ?? a.dueDate,
					fromDate: from ?? a.fromDate,
				},
			}));
			const result = await promiseResult(() => query.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}
			if (!result.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "Homework not found in any of your classes",
				});
			}

			return successResponse;
		},
		{
			body: t.Object({
				subject: t.Optional(
					t.String({
						minLength: 1,
						examples: ["Computer Science", "English"],
					}),
				),
				description: t.Optional(
					t.String({
						minLength: 1,
					}),
				),
				dueDate: t.Optional(
					t.Object({
						day: t.Number({ minimum: 1, maximum: 31 }),
						month: t.Number({ minimum: 1, maximum: 12 }),
						year: t.Number({ minimum: 1970 }),
					}),
				),
				fromDate: t.Optional(
					t.Object({
						day: t.Number({ minimum: 1, maximum: 31 }),
						month: t.Number({ minimum: 1, maximum: 12 }),
						year: t.Number({ minimum: 1970 }),
					}),
				),
			}),
		},
	);
