import e from "@edgedb";
import {
	DATABASE_READ_FAILED,
	DATABASE_WRITE_FAILED,
	UNAUTHORIZED,
} from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { isIncreasing } from "utils/arrays/increasing";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";
import { savePredicate } from "utils/undefined";

export const updateCalendar = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.patch(
		"/:id",
		async ({ auth, set, httpStatus, body, params }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const selectQuery = e.select(e.Calendar, (c) => ({
				filter_single: e.op(c.id, "=", e.cast(e.uuid, params.id)),
				beginning: true,
				ending: true,
			}));
			const selectResult = await promiseResult(() => selectQuery.run(client));
			if (selectResult.isError) {
				console.log(selectResult.error);
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (!selectResult.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "Could not find calendar event",
				});
			}

			const prevBeginning = selectResult.data.beginning.getTime();
			const prevEnding = selectResult.data.ending?.getTime();

			const validTimes = !isIncreasing([
				body.beginning ?? prevBeginning,
				(body.ending ?? prevEnding ?? Number.POSITIVE_INFINITY) - 1,
			]);
			if (validTimes) {
				set.status = httpStatus.HTTP_422_UNPROCESSABLE_ENTITY;
				return responseBuilder("error", {
					error: "Ending must be later then beginning",
				});
			}

			const query = e.update(e.Calendar, (c) => ({
				filter_single: e.op(
					e.op(c.id, "=", e.cast(e.uuid, params.id)),
					"and",
					e.op(auth.username, "in", c.class.students.username),
				),
				set: {
					updates: {
						"+=": e.insert(e.Change, {
							user: e.select(e.User, (u) => ({
								filter_single: e.op(u.username, "=", auth.username),
							})),
						}),
					},

					title: body.title ?? c.title,
					summary: body.summary ?? c.summary,
					beginning:
						savePredicate(body.beginning, (d) => new Date(d)) ?? c.beginning,
					ending: savePredicate(body.ending, (d) => new Date(d)) ?? c.ending,
					location: body.location ?? c.location,
					priority: body.priority ?? c.priority,
				},
			}));

			const result = await promiseResult(() => query.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}
			if (!result.data) {
				set.status = httpStatus.HTTP_403_FORBIDDEN;
				return responseBuilder("error", {
					error: "You aren't in the correct class",
				});
			}

			return responseBuilder("success", {
				data: null,
				message: "Successfully updated calendar event",
			});
		},
		{
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1 })),
				summary: t.Optional(t.String({ minLength: 1 })),
				beginning: t.Optional(t.Number({ minimum: 0 })),
				ending: t.Optional(t.Number({ minimum: 1 })),
				location: t.Optional(t.String({ minLength: 1 })),
				priority: t.Optional(
					t.Union([
						t.Literal("Critical"),
						t.Literal("High"),
						t.Literal("Medium"),
						t.Literal("Low"),
						t.Literal("Minimal"),
					]),
				),
			}),
		},
	);
