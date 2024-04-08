import e from "@edgedb";
import { PASSWORD_DESCRIPTION } from "constants/descriptions";
import { PASSWORD } from "constants/regex";
import {
	DATABASE_WRITE_FAILED,
	MUST_BE_GENERATED_BY_LOGIN_NOT_REFRESH,
	UNAUTHORIZED,
} from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const changeUserDetailsRouter = new Elysia()
	.use(HttpStatusCode)
	.use(auth)
	.put(
		"/",
		async ({ set, httpStatus, auth, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}
			if (auth.createdBy !== "login") {
				set.status = httpStatus.HTTP_403_FORBIDDEN;
				return MUST_BE_GENERATED_BY_LOGIN_NOT_REFRESH;
			}

			const hashed = body.password
				? await Bun.password.hash(body.password)
				: undefined;
			const updateQuery = e.update(e.User, (u) => ({
				filter_single: e.op(u.username, "=", auth.username),
				set: {
					password: hashed ?? u.password,
					displayname: body.displayname ?? u.displayname,
				},
			}));
			const res = await promiseResult(() => updateQuery.run(client));

			if (res.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}
			if (!res.data) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			return responseBuilder("success", {
				message: "Successfully updated user details",
				data: null,
			});
		},
		{
			body: t.Object({
				displayname: t.Optional(
					t.String({
						minLength: 1,
					}),
				),
				password: t.Optional(
					t.RegExp(PASSWORD, {
						description: PASSWORD_DESCRIPTION,
					}),
				),
			}),
		},
	);
