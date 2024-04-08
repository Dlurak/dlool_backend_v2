import e from "@edgedb";
import { DATABASE_DELETE_FAILED, UNAUTHORIZED } from "constants/responses";
import { Elysia } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const logoutRouter = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.delete("/all", async ({ auth, set, httpStatus }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}
		if (auth.createdBy !== "login") {
			set.status = httpStatus.HTTP_403_FORBIDDEN;
			return responseBuilder("error", {
				error:
					"Access token must be generated using log in and not a refresh token",
			});
		}

		const delQuery = e.count(
			e.delete(e.RefreshToken, (t) => ({
				filter: e.op(t["<tokens[is User]"].username, "=", auth.username),
			})),
		);

		const result = await promiseResult(() => delQuery.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}

		return responseBuilder("success", {
			message: "Logged out from all sessions",
			data: {
				sessionCount: result.data,
			},
		});
	})
	.delete("/:refreshToken", async ({ params, auth, set, httpStatus }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const delQuery = e.delete(e.RefreshToken, (t) => ({
			filter_single: e.op(
				e.op(t["<tokens[is User]"].username, "=", auth.username),
				"and",
				e.op(t.token, "=", params.refreshToken),
			),
		}));
		const result = await promiseResult(() => delQuery.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}

		if (!result.data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "Could not find that refresh token",
			});
		}

		return responseBuilder("success", {
			message: "Deleted one refresh token successfully",
			data: null,
		});
	});
