import e from "@edgedb";
import {
	DATABASE_DELETE_FAILED,
	MUST_BE_GENERATED_BY_LOGIN_NOT_REFRESH,
	UNAUTHORIZED,
} from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const deleteUser = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.delete("/", async ({ auth, httpStatus, set }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}
		if (auth.createdBy !== "login") {
			set.status = httpStatus.HTTP_403_FORBIDDEN;
			return MUST_BE_GENERATED_BY_LOGIN_NOT_REFRESH;
		}

		const query = e.delete(e.User, (u) => ({
			filter_single: e.op(u.username, "=", auth.username),
		}));

		const result = await promiseResult(() => query.run(client));

		if (result.isError || !result.data) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}

		return responseBuilder("success", {
			message: "Successfully deleted user",
			data: null,
		});
	});
