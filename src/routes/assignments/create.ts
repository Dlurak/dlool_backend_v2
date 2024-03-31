import e from "@edgedb";
import {
	DATABASE_READ_FAILED,
	DATABASE_WRITE_FAILED,
	FORBIDDEN,
	UNAUTHORIZED,
} from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { customDateToNormal } from "utils/dates/customAndNormal";
import { doesClassExist } from "utils/db/classes";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const createAssignment = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.post(
		"/",
		async ({ auth, set, httpStatus, body }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const from = customDateToNormal(body.from)
			const due = customDateToNormal(body.due)
			if (due < from) {
				set.status = httpStatus.HTTP_400_BAD_REQUEST;
				return responseBuilder('error', { error: "Due must not be earlier then from" });
			}
			

			const classExists = await promiseResult(() => doesClassExist({
				schoolName: body.school,
				className: body.class
			}))
			if (classExists.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR
				return DATABASE_READ_FAILED
			}
			if (!classExists.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder('error', {
					error: "Can't find that school or class"
				})
			}
			

			const isUserInClassQuery = e.count(
				e.select(e.Class, (c) => {
					const classNameMatches = e.op(c.name, "=", body.class);
					const schoolMatches = e.op(
						classNameMatches,
						"and",
						e.op(c.school.name, "=", body.school),
					);
					const userMatches = e.op(c.students.username, "=", auth.username);

					return { filter_single: e.op(schoolMatches, "and", userMatches) };
				}),
			);
			const isUserInClassResult = await promiseResult(() =>
				isUserInClassQuery.run(client),
			);
			if (isUserInClassResult.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (isUserInClassResult.data === 0) {
				set.status = httpStatus.HTTP_403_FORBIDDEN;
				return FORBIDDEN;
			}

			const insertQuery = e.insert(e.Assignment, {
				subject: body.subject,
				description: body.description,
				fromDate: from,
				dueDate: due,
				class: e.select(e.Class, (c) => {
					const classNameMatches = e.op(c.name, "=", body.class);
					const schoolMatches = e.op(c.school.name, "=", body.school);
					return {
						filter_single: e.op(classNameMatches, "and", schoolMatches),
					};
				}),
				updatedBy: e.select(e.User, (u) => ({
					filter_single: e.op(u.username, "=", auth.username),
				})),
			});
			const insertResult = await promiseResult(() => insertQuery.run(client));
			if (insertResult.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			set.status = httpStatus.HTTP_201_CREATED;
			return responseBuilder("success", {
				message: "Successfully created assignment",
				data: insertResult.data
			});
		},
		{
			body: t.Object({
				school: t.String({ minLength: 1 }),
				class: t.String({ minLength: 1 }),

				subject: t.String({ minLength: 1 }),
				description: t.String({ minLength: 1 }),
				from: t.Object( {
					day: t.Number({ minimum: 1, maximum: 31 }),
					month: t.Number({ minimum: 1, maximum: 12 }),
					year: t.Number({ minimum: 1970 }),
				}),
				due: t.Object({
					day: t.Number({ minimum: 1, maximum: 31 }),
					month: t.Number({ minimum: 1, maximum: 12 }),
					year: t.Number({ minimum: 1970 }),
				}),
			}),
		},
	);
