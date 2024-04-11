import e from "@edgedb";
import {
	DATABASE_DELETE_FAILED,
	DATABASE_WRITE_FAILED,
	UNAUTHORIZED,
} from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { fallback } from "utils/arrays/fallback";
import { promiseResult } from "utils/errors";
import { userByUsername } from "utils/queries/user";
import { responseBuilder } from "utils/response";

export const updateNote = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.patch(
		"/:id",
		async ({ auth, set, httpStatus, params, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const updateQuery = e.update(e.Note, (n) => {
				const selfFilter = e.op(
					e.op(n.editScope, "=", e.cast(e.EditScope, "Self")),
					"and",
					e.op(n.creator.username, "=", auth.username),
				);
				const classFilter = e.op(
					e.op(n.editScope, "=", e.cast(e.EditScope, "Class")),
					"and",
					e.op(auth.username, "in", n.class.students.username),
				);
				const schoolFilter = e.op(
					e.op(n.editScope, "=", e.cast(e.EditScope, "School")),
					"and",
					e.op(auth.username, "in", n.class.school.classes.students.username),
				);

				const editScopeFilter = e.op(
					e.op(selfFilter, "or", classFilter),
					"or",
					schoolFilter,
				);

				const paramId = e.cast(e.uuid, params.id);
				const idFilter = e.op(n.id, "=", paramId);
				const tags = body.tags
					? e.select(e.Tag, (t) => ({
							filter: e.op(
								e.op(t.class.id, "=", n.class.id),
								"and",
								e.op(t.tag, "in", e.set(...fallback(body.tags || [], [""]))),
							),
						}))
					: n.tags;

				return {
					filter_single: e.op(editScopeFilter, "and", idFilter),
					set: {
						title: body.title ?? n.title,
						summary: body.summary ?? n.summary,
						priority: body.priority ?? n.priority,
						editScope: body.editScope ?? n.editScope,
						tags,

						updates: {
							"+=": e.insert(e.Change, {
								user: userByUsername(auth.username),
							}),
						},
					},
				};
			});

			const result = await promiseResult(() => updateQuery.run(client));
			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}
			if (!result.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "Note doesn't exist or you don't have rights to edit it",
				});
			}

			return responseBuilder("success", {
				message: "Successfully updated note",
				data: null,
			});
		},
		{
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1 })),
				summary: t.Optional(t.String({ minLength: 1 })),
				priority: t.Optional(
					t.Union([
						t.Literal("Critical"),
						t.Literal("High"),
						t.Literal("Medium"),
						t.Literal("Low"),
						t.Literal("Minimal"),
					]),
				),
				tags: t.Optional(t.Array(t.String({ minLength: 1 }))),
				editScope: t.Optional(
					t.Union([t.Literal("Self"), t.Literal("Class"), t.Literal("School")]),
				),
			}),
		},
	);
