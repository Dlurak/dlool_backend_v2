import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { promiseResult } from "utils/errors";
import { replaceDateWithTimestamp } from "utils/objects/transform";
import { responseBuilder } from "utils/response";

export const getClass = new Elysia().use(HttpStatusCode()).get(
	"/",
	async ({ query, set, httpStatus }) => {
		const classesQuery = e.select(e.School, (s) => ({
			filter_single: e.op(s.name, "=", query.school),
			classes: (c) => ({
				limit: query.limit,
				offset: query.offset,
				filter: query.query
					? e.op(c.name, "like", `%${query.query}%`)
					: undefined,

				name: true,
				created: true,
			}),
		}));
		const result = await promiseResult(() => classesQuery.run(client));

		if (result.status === "error") {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}
		const { data } = result;
		if (!data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: `The school ${query.school} doesn't exist`,
			});
		}

		return responseBuilder("success", {
			message: "Successfully retrieved classes",
			data: data.classes.map(replaceDateWithTimestamp),
		});
	},
	{
		query: t.Object({
			school: t.String({
				minLength: 1,
				description: "The name of the school to get the classes from",
			}),
			limit: t.Numeric({
				minimum: 1,
				maximum: 100,
				default: 20,
				description: "The maximum number of classes to retrieve",
			}),
			offset: t.Numeric({
				minimum: 0,
				default: 0,
				description: "The number of classes to skip",
			}),
			query: t.Optional(
				t.String({
					minLength: 1,
					description: "A query to search for classes",
				}),
			),
		}),
	},
);
