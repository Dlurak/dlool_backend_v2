import e from "@edgedb";
import { DATABASE_READ_FAILED, UNAUTHORIZED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { replaceDateWithTimestamp } from "utils/objects/transform";
import { responseBuilder } from "utils/response";

export const listJoinRequests = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.get("/", async ({ set, auth, httpStatus }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const joinRequestsQuery = e.select(e.JoinRequest, (jr) => {
			const classMatches = e.op(
				jr.wantsToJoin.students.username,
				"=",
				auth.username,
			);

			return {
				filter: classMatches,

				user: () => ({
					username: true,
					displayname: true,
					created: true,
					classes: () => ({
						name: true,
						school: () => ({ name: true }),
					}),
				}),
				wantsToJoin: () => ({
					name: true,
					school: () => ({ name: true }),
				}),
				status: true,
				created: true,
				reviewedAt: true,
				reviewedBy: () => ({
					username: true,
					displayname: true,
				}),
				id: true,
			};
		});
		const joinRequests = await promiseResult(() =>
			joinRequestsQuery.run(client),
		);

		if (joinRequests.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}

		const responseData = joinRequests.data.map(replaceDateWithTimestamp);
		return responseBuilder("success", {
			message: `Successfully retrieved join requests ${auth.username} can review`,
			data: responseData,
		});
	});
