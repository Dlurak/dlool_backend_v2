import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";

export const getSchools = new Elysia().use(HttpStatusCode()).get(
	"/",
	async ({ query: { limit, offset, query }, set, httpStatus }) => {
		const schoolsQuery = e.select(e.School, (s) => {
			const isLikeName = e.op(
				e.str_lower(s.name),
				"like",
				`%${query?.toLowerCase()}%`,
			);
			const isLikeDescription = e.op(s.description, "like", `%${query}%`);

			const useFilter = !!query;

			return {
				limit,
				offset,
				name: true,
				description: true,
				filter: useFilter
					? e.op(isLikeName, "or", isLikeDescription)
					: undefined,
			};
		});

		const result = await promiseResult(() => schoolsQuery.run(client));
		if (result.status === "error") {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}

		return responseBuilder("success", {
			data: result.data,
			message: "Successfully retrieved schools",
		});
	},
	{
		query: t.Object({
			offset: t.Numeric({
				minimum: 0,
				default: 0,
				description: "The number of schools to skip",
			}),
			limit: t.Numeric({
				minimum: 1,
				maximum: 100,
				default: 20,
				description: "The maximum number of schools to retrieve",
			}),
			query: t.Optional(
				t.String({
					minLength: 1,
					description: "A query to search for schools",
				}),
			),
		}),
		detail: {
			description: "Get the schools in a paginated manner",
			tags: ["school"],
		},
	},
);
