import e from "@edgedb";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { replaceDateWithTimestamp } from "utils/objects/transform";
import { responseBuilder } from "utils/response";
import { userOwnInfoRouter } from "./me";

export const userInfoRouter = new Elysia({ prefix: "/info" })
	.use(auth)
	.use(HttpStatusCode())
	.use(userOwnInfoRouter)
	.get(
		"/",
		async ({ auth, query, set, httpStatus }) => {
			const { username } = query;
			// The creation date is only returned when the user is requesting information about themselves
			const isThemself = auth.isAuthorized && username === auth.username;

			const dbQuery = e.select(e.User, (u) => ({
				username: true,
				displayname: true,
				created: isThemself,
				classes: isThemself
					? () => ({
							name: true,
							school: () => ({ name: true }),
						})
					: false,
				filter_single: e.op(u.username, "=", username),
			}));

			const result = await promiseResult(async () => dbQuery.run(client));

			if (result.status !== "success") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return responseBuilder("error", {
					error: "Internal server error",
				});
			}

			if (!result.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "User not found",
				});
			}

			return responseBuilder("success", {
				data: replaceDateWithTimestamp(result.data),
				message: "User information retrieved successfully",
			});
		},
		{
			query: t.Object({
				username: t.String({
					minLength: 1,
					description: "The username of the user to get information about",
				}),
			}),
			detail: {
				description:
					"Get information about a user. When authirzing and requesting oneself the creation date will also be received",
				tags: ["User"],
			},
		},
	);
