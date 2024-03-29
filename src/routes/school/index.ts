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

export const schoolRouter = new Elysia({ prefix: "/school" })
	.use(auth)
	.use(HttpStatusCode())
	.post(
		"/",
		async ({ auth, body, set, httpStatus }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const countQuery = e.count(
				e.select(e.School, (s) => ({
					filter: e.op(s.name, "=", body.name),
				})),
			);
			const count = await promiseResult(() => countQuery.run(client));

			if (count.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (count.data >= 1) {
				set.status = httpStatus.HTTP_400_BAD_REQUEST;
				return responseBuilder("error", {
					error: `A school with the name ${body.name} already exists`,
				});
			}

			const createSchoolQuery = e.insert(e.School, {
				name: body.name,
				description: body.description,
			});
			const result = await promiseResult(() => createSchoolQuery.run(client));

			if (result.status === "error") {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			set.status = httpStatus.HTTP_201_CREATED;
			return responseBuilder("success", {
				message: `Successfully created school ${body.name}`,
				data: null,
			});
		},
		{
			body: t.Object({
				name: t.String({
					minLength: 1,
					description: "The name of the school",
					examples: ["Dlool High School", "Humboldt Gymnasium", "Hogwarts"],
				}),
				description: t.String({
					minLength: 1,
					description:
						"A description of the school, this is only so other users can distinguish between schools with similar names",
					examples: [
						"The Dlool High School in Chicago",
						"Das Humboldt Gymnasium in Köln",
						"Hogwarts straight out of the Harry Potter books",
					],
				}),
			}),
			detail: {
				description:
					"Create a new school, this requires the user to be authenthicated",
				tags: ["school"],
			},
		},
	);
