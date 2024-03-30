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
import { z } from "zod";

const classesSchema = z.object({
	classes: z
		.array(
			z.object({
				id: z.string(),
			}),
		)
		.max(1)
		.min(1),
});

export const createClass = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.post(
		"/",
		async ({ body, auth, set, httpStatus }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const classesQuery = e.select(e.School, (s) => ({
				filter_single: e.op(s.name, "=", body.school),
				classes: (c) => ({
					filter_single: e.op(c.name, "=", body.name),
				}),
			}));
			const result = await promiseResult(() => classesQuery.run(client));
			if (result.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			const classNameIsInUse = classesSchema.safeParse(result.data).success;
			if (classNameIsInUse) {
				set.status = httpStatus.HTTP_400_BAD_REQUEST;
				return responseBuilder("error", {
					error: `A class with the name ${body.name} already exists in the school ${body.school}`,
				});
			}

			const createClassQuery = e.update(e.School, (s) => ({
				filter_single: e.op(s.name, "=", body.school),
				set: {
					classes: { "+=": e.insert(e.Class, { name: body.name }) },
				},
			}));
			const createResult = await promiseResult(() =>
				createClassQuery.run(client),
			);
			if (createResult.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}
			if (!createResult.data) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "School not found",
				});
			}

			set.status = httpStatus.HTTP_201_CREATED;
			return responseBuilder("success", {
				message: `Successfully created class ${body.name}`,
				data: null,
			});
		},
		{
			body: t.Object({
				name: t.String({
					minLength: 1,
					description: "The name of the class",
					examples: ["10a", "Dolphins", "Mathe LK", "Latein GK"],
				}),
				school: t.String({
					minLength: 1,
					description: "The name of the school the class belongs to",
				}),
			}),
		},
	);
