import e from "@edgedb";
import {
	DATABASE_READ_FAILED,
	DATABASE_WRITE_FAILED,
} from "constants/responses";
import { Elysia, t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { createToken } from "utils/auth/jwt";
import { promiseResult } from "utils/errors";
import { randomNumber } from "utils/random";
import { responseBuilder } from "utils/response";
import { wait } from "utils/time";
import { logoutRouter } from "./logout";

export const refreshTokenRouter = new Elysia({ prefix: "/refresh-token" })
	.use(HttpStatusCode())
	.use(auth)
	.use(logoutRouter)
	.post(
		"/password",
		async ({ body, set, httpStatus }) => {
			const notMatchingReturn = responseBuilder("error", {
				error: "Username or password is incorrect",
			});

			const selectQuery = e.select(e.User, (u) => ({
				password: true,
				filter_single: e.op(u.username, "=", body.username),
			}));
			const selectResult = await promiseResult(() => selectQuery.run(client));

			if (selectResult.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (!selectResult.data) {
				// to prevent timing attacks, we wait a random amount of time
				await wait(randomNumber(90, 130));
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return notMatchingReturn;
			}

			const isPasswordCorrect = await Bun.password.verify(
				body.password,
				selectResult.data.password,
			);

			if (!isPasswordCorrect) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return notMatchingReturn;
			}

			const { token: tokenRefresh, expiresIn: expiresInRefresh } = createToken({
				username: body.username,
				type: "refresh",
			});

			const query = e.update(e.User, (u) => ({
				filter_single: e.op(u.username, "=", body.username),
				set: {
					tokens: {
						"+=": e.insert(e.RefreshToken, { token: tokenRefresh }),
					},
				},
			}));

			const result = await promiseResult(() => query.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			const { token: tokenAccess, expiresIn: expiresInAccess } = createToken({
				username: body.username,
				type: "access",
				createdBy: "login",
			});

			return responseBuilder("success", {
				message: "Token generated successfully",
				data: {
					refreshToken: { token: tokenRefresh, expiresIn: expiresInRefresh },
					accessToken: { token: tokenAccess, expiresIn: expiresInAccess },
				},
			});
		},
		{
			body: t.Object({
				username: t.String({ minLength: 1 }),
				password: t.String({ minLength: 1 }),
			}),
			detail: { tags: ["Auth"] },
		},
	);
