import e from "@edgedb";
import { DATABASE_DELETE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const deleteTag = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.delete("/:id", async ({ set, httpStatus, auth, params }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const query = e.delete(e.Tag, (t) => ({
			filter_single: e.op(
				e.op(t.id, "=", e.cast(e.uuid, params.id)),
				"and",
				e.op(auth.username, "in", t.class.students.username),
			),
		}));
		const result = await promiseResult(() => query.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}
		if (!result.data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "This tag doesn't exist or you don't have rights to delete it",
			});
		}

		return responseBuilder("success", {
			data: null,
			message: "Successfully deleted tag",
		});
	});
