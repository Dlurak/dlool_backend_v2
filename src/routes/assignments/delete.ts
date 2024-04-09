import e from "@edgedb";
import { DATABASE_READ_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const deleteAssignment = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.delete("/:id", async ({ auth, set, httpStatus, params }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const query = e.delete(e.Assignment, (a) => ({
			filter_single: e.op(
				e.op(a.id, "=", e.cast(e.uuid, params.id)),
				"and",
				e.op(auth.username, "in", a.class.students.username),
			),
		}));
		const result = await promiseResult(() => query.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}
		if (!result.data) {
			// Either the user isn't in the class and/or the homework doesn't exist
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "Homework not found in any of your classes",
			});
		}

		return responseBuilder("success", {
			message: "Successfully deleted assignment",
			data: null,
		});
	});
