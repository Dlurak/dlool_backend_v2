import e from "@edgedb";
import { DATABASE_WRITE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { fallback } from "utils/arrays/fallback";
import { promiseResult } from "utils/errors";
import { usersClassBySchoolAndName } from "utils/queries/class";
import { userByUsername } from "utils/queries/user";
import { responseBuilder } from "utils/response";

export const createNote = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.post(
		"/",
		async ({ set, httpStatus, auth, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const query = e.insert(e.Note, {
				title: body.title,
				class: usersClassBySchoolAndName({
					schoolName: body.school,
					className: body.class,
					username: auth.username,
				}),

				summary: body.summary,
				priority: body.priority,
				tags: e.select(e.Tag, (t) => ({
					filter: e.op(
						e.op(
							e.op(t.class.name, "=", body.class),
							"and",
							e.op(t.class.school.name, "=", body.school),
						),
						"and",
						e.op(t.tag, "in", e.set(...fallback(body.tags || [], [""]))),
					),
				})),
				editScope: body.editScope,

				creator: userByUsername(auth.username),
				updates: e.insert(e.Change, { user: userByUsername(auth.username) }),
			});
			const result = await promiseResult(() => query.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			set.status = httpStatus.HTTP_201_CREATED;
			return responseBuilder("success", {
				message: "Successfully created note",
				data: null,
			});
		},
		{
			body: t.Object({
				class: t.String({ minLength: 1 }),
				school: t.String({ minLength: 1 }),
				title: t.String({ minLength: 1 }),
				summary: t.Optional(t.String({ minLength: 1 })),
				tags: t.Optional(t.Array(t.String({ minLength: 1 }))),
				priority: t.Optional(
					t.Union([
						t.Literal("Critical"),
						t.Literal("High"),
						t.Literal("Medium"),
						t.Literal("Low"),
						t.Literal("Minimal"),
					]),
				),
				editScope: t.Optional(
					t.Union([t.Literal("Self"), t.Literal("Class"), t.Literal("School")]),
				),
			}),
		},
	);
