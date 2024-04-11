import e from "@edgedb";
import { DATABASE_DELETE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const deleteNote = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.delete("/:id", async ({ auth, set, httpStatus, params }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const deletionQuery = e.delete(e.Note, (n) => {
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

			return { filter_single: e.op(editScopeFilter, "and", idFilter) };
		});
		const result = await promiseResult(() => deletionQuery.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}
		if (!result.data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "This note doesn't exist or you don't have rights to delete it",
			});
		}

		return responseBuilder("success", {
			message: "Successfully deleted note",
			data: null,
		});
	});
