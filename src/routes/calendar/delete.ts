import e from "@edgedb";
import { DATABASE_DELETE_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const deleteCalendar = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.delete("/:id", async ({ set, httpStatus, auth, params }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const query = e.delete(e.Calendar, (c) => ({
			filter_single: e.op(
				e.op(c.id, "=", e.cast(e.uuid, params.id)),
				"and",
				e.op(auth.username, "in", c.class.students.username),
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
				error: "Calendar event not found in any of your classes",
			});
		}

		return responseBuilder("success", {
			message: "Successfully deleted calendar event",
			data: null,
		});
	});
