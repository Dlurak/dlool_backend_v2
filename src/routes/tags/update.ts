import e from "@edgedb";
import { COLOR } from "constants/regex";
import { DATABASE_WRITE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const updateTag = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.patch(
		"/:id",
		async ({ set, httpStatus, auth, params, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const query = e.update(e.Tag, (t) => ({
				filter_single: e.op(
					e.op(t.id, "=", e.uuid(params.id)),
					"and",
					e.op(auth.username, "in", t.class.students.username),
				),
				set: {
					tag: body.tag ?? t.tag,
					color: body.color ?? t.color,
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
					error: "Tag doesn't exist or you don't have rights to edit it",
				});
			}

			return responseBuilder("success", {
				data: null,
				message: "Successfully updated tag",
			});
		},
		{
			body: t.Object({
				tag: t.Optional(t.String({ minLength: 1 })),
				color: t.Optional(t.RegExp(COLOR)),
			}),
		},
	);
