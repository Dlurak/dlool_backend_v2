import e from "@edgedb";
import { DATABASE_WRITE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { isIncreasing } from "utils/arrays/increasing";
import { promiseResult } from "utils/errors";
import { classBySchoolAndName } from "utils/queries/class";
import { responseBuilder } from "utils/response";
import { savePredicate } from "utils/undefined";

export const createCalendar = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.post(
		"/",
		async ({ body, auth, set, httpStatus }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			if (!isIncreasing([body.beginning, body.ending ?? Infinity]))	 {
				set.status = httpStatus.HTTP_422_UNPROCESSABLE_ENTITY;
				return responseBuilder("error", {
					error: "Ending must be later then beginning"
				})
			}

			const isUserInClassQuery = e.count(
				e.select(e.Class, (c) => ({
					filter_single: e.op(
						e.op(
							e.op(c.name, "=", body.class),
							"and",
							e.op(c.school.name, "=", body.school),
						),
						"and",
						e.op(auth.username, "in", c.students.username),
					),
				})),
			);

			const updateQuery = e.insert(e.Calendar, {
				title: body.title,
				summary: body.summary,
				class: classBySchoolAndName({
					className: body.class,
					schoolName: body.school,
				}),
				beginning: new Date(body.beginning),
				ending: savePredicate(body.ending, (ending) => new Date(ending)),
				updates: e.insert(e.Change, {
					user: e.select(e.User, (u) => ({
						filter_single: e.op(u.username, "=", auth.username),
					})),
				}),
				location: body.location,
				priority: body.priority,
			});

			const result = await promiseResult(() => {
				return client.transaction(async (tx) => {
					const isInClass = await isUserInClassQuery
						.run(tx)
						.then((c) => c === 1);
					if (!isInClass) return "NOT_IN_CLASS";

					return updateQuery.run(tx);
				});
			});

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			if (result.data === "NOT_IN_CLASS") {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error:
						"This class doesn't exist or you don't have rights to create data for it",
				});
			}

			set.status = httpStatus.HTTP_201_CREATED;
			return responseBuilder("success", {
				message: "Successfully created calendar event",
				data: result.data,
			});
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				school: t.String({ minLength: 1 }),
				class: t.String({ minLength: 1 }),
				beginning: t.Number({ minimum: 0 }),
				ending: t.Optional(t.Number({ minimum: 1 })),
				summary: t.Optional(t.String({ minLength: 1 })),
				location: t.Optional(t.String({ minLength: 1 })),
				priority: t.Optional(t.Union([
					t.Literal("Critical"),
					t.Literal("High"),
					t.Literal("Medium"),
					t.Literal("Low"),
				]))
			}),
		},
	);
