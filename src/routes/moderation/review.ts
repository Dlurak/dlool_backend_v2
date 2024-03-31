import e from "@edgedb";
import {
	DATABASE_READ_FAILED,
	DATABASE_WRITE_FAILED,
	UNAUTHORIZED,
} from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const reviewJoinRequest = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.patch(
		"/:id",
		async ({ auth, httpStatus, set, params, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const idAsId = e.cast(e.uuid, params.id);

			const currentStatusQuery = e.select(e.JoinRequest, (jr) => {
				const idMatches = e.op(jr.id, "=", idAsId);
				return {
					filter_single: idMatches,
					status: true,
					user: () => ({ username: true }),
					wantsToJoin: () => ({ id: true }),
				};
			});
			const currentStatusResult = await promiseResult(() =>
				currentStatusQuery.run(client),
			);
			if (currentStatusResult.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (!currentStatusResult.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "This request doesn't exist",
				});
			}
			if (currentStatusResult.data.status !== "Pending") {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "This request is already proccessed",
				});
			}

			const updateQuery = e.update(e.JoinRequest, (jr) => {
				const idMatches = e.op(jr.id, "=", idAsId);
				const userIsPriviliged = e.op(
					jr.wantsToJoin.students.username,
					"=",
					auth.username,
				);

				return {
					filter_single: e.op(idMatches, "and", userIsPriviliged),
					set: {
						status: body.status,
						reviewedAt: new Date(),
						reviewedBy: e.select(e.User, (u) => ({
							filter_single: e.op(u.username, "=", auth.username),
						})),
					},
				};
			});
			const result = await promiseResult(() => updateQuery.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}
			if (!result.data) {
				set.status = httpStatus.HTTP_403_FORBIDDEN;
				return responseBuilder("error", {
					error: "You don't have the rights to review this request",
				});
			}

			const isAccepted = body.status === "Accepted";
			if (!isAccepted) {
				return responseBuilder("success", {
					message: "Sucessfully rejected",
					data: null,
				});
			}

			// TODO: Put this into one transaction together with `updateQuery`
			const updateClassQuery = e.update(e.Class, (c) => {
				const classIdAsId = e.cast(
					e.uuid,
					currentStatusResult.data?.wantsToJoin.id || "",
				);
				const studentName = currentStatusResult.data?.user.username || "";

				return {
					filter_single: e.op(c.id, "=", classIdAsId),
					set: {
						students: {
							"+=": e.select(e.User, (u) => ({
								filter_single: e.op(u.username, "=", studentName),
							})),
						},
					},
				};
			});
			const updateClassResult = await promiseResult(() =>
				updateClassQuery.run(client),
			);
			if (updateClassResult.isError) {
				// In this case the status is already changed but the user isn't a student of the class :/
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			return responseBuilder("success", {
				message: "Successfully accepted",
				data: null,
			});
		},
		{
			body: t.Object({
				status: t.Union([t.Literal("Accepted"), t.Literal("Rejected")]),
			}),
		},
	);
