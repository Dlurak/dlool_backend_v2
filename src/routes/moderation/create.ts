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
import { getAmountOfMembersOfClass } from "utils/db/classes";
import { doesRequestAlreadyExist } from "utils/db/requests";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const createJoinRequest = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.post(
		"/",
		async ({ auth, body, httpStatus, set }) => {
			if (!auth.isAuthorized) {
				return UNAUTHORIZED;
			}

			const countResult = await promiseResult(() =>
				getAmountOfMembersOfClass({
					className: body.class,
					schoolName: body.school,
				}),
			);
			if (countResult.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}

			if (countResult.data === 0) {
				const joinClassquery = e.update(e.Class, (c) => {
					const classNameMatches = e.op(c.name, "=", body.class);
					const schoolNameMatches = e.op(c.school.name, "=", body.school);

					return {
						filter_single: e.op(classNameMatches, "and", schoolNameMatches),
						set: {
							students: {
								"+=": e.select(e.User, (u) => ({
									filter_single: e.op(u.username, "=", auth.username),
								})),
							},
						},
					};
				});
				const joinResult = await promiseResult(() =>
					joinClassquery.run(client),
				);
				if (joinResult.status === "error") {
					set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
					return DATABASE_WRITE_FAILED;
				}
				if (!joinResult.data) {
					set.status = httpStatus.HTTP_404_NOT_FOUND;
					return responseBuilder("error", {
						error: "Class or school not found",
					});
				}

				return responseBuilder("success", {
					message: "Joined class successfully!",
					data: null,
				});
			}

			const isUserAlreadyInClassQuery = e.count(
				e.select(e.Class, (c) => {
					const classNameMatches = e.op(c.name, "=", body.class);
					const schoolNameMatches = e.op(c.school.name, "=", body.school);
					const userMatches = e.op(c.students.username, "=", auth.username);

					return {
						filter_single: e.op(
							e.op(classNameMatches, "and", schoolNameMatches),
							"and",
							userMatches,
						),
					};
				}),
			);
			const isUserAlreadyInClassResult = await promiseResult(() =>
				isUserAlreadyInClassQuery.run(client),
			);
			if (isUserAlreadyInClassResult.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (isUserAlreadyInClassResult.data > 0) {
				set.status = httpStatus.HTTP_400_BAD_REQUEST;
				return responseBuilder("error", {
					error: "User is already in class",
				});
			}

			const doesReqAlreadyExistResult = await promiseResult(() =>
				doesRequestAlreadyExist({
					username: auth.username,
					class: body.class,
					school: body.school,
				}),
			);
			if (doesReqAlreadyExistResult.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (doesReqAlreadyExistResult.data) {
				return responseBuilder("error", {
					error: "Request already exists",
				});
			}

			const joinRequestQuery = e.insert(e.JoinRequest, {
				user: e.select(e.User, (u) => ({
					filter_single: e.op(u.username, "=", auth.username),
				})),
				wantsToJoin: e.select(e.Class, (c) => {
					const classNameMatches = e.op(c.name, "=", body.class);
					const schoolNameMatches = e.op(c.school.name, "=", body.school);
					return {
						filter_single: e.op(classNameMatches, "and", schoolNameMatches),
					};
				}),
			});
			const joinRequestResult = await promiseResult(() =>
				joinRequestQuery.run(client),
			);
			if (joinRequestResult.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			return responseBuilder("success", {
				message: "Join request created successfully!",
				data: null,
			});
		},
		{
			body: t.Object({
				school: t.String({
					minLength: 1,
					description: "The name of the school to join",
				}),
				class: t.String({
					minLength: 1,
					description: "The name of the class to join",
				}),
			}),
		},
	);
