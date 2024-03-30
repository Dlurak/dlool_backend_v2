import e from "@edgedb";
import { DATABASE_READ_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { replaceDateWithTimestamp } from "utils/objects/transform";
import { responseBuilder } from "utils/response";

export const ownJoinRequest = (path: string) =>
	new Elysia()
		.use(auth)
		.use(HttpStatusCode())
		.get(path, async ({ auth, httpStatus, set }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const joinRequestQuery = e.select(e.JoinRequest, (jr) => ({
				filter: e.op(jr.user.username, "=", auth.username),

				status: true,
				created: true,
				reviewedAt: true,
				reviewedBy: () => ({
					username: true,
					displayname: true,
				}),
				wantsToJoin: () => ({
					name: true,
					school: () => ({ name: true }),
				}),
			}));

			const joinRequest = await promiseResult(() =>
				joinRequestQuery.run(client),
			);

			if (joinRequest.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (!joinRequest.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: `No join request found for user ${auth.username}`,
				});
			}

			const responseData = joinRequest.data.map(replaceDateWithTimestamp);
			return responseBuilder("success", {
				message: `Successfully retrieved join request for ${auth.username}`,
				data: responseData,
			});
		});
