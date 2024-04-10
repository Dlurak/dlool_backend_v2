import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { promiseResult } from "utils/errors";
import { responseBuilder } from "utils/response";
import { surround } from "utils/strings/surround";

export const listTags = new Elysia().use(HttpStatusCode()).get(
	"/",
	async ({ set, httpStatus, query }) => {
		const dbQuery = e.select(e.Tag, (t) => {
			const queryFilter = query.query
				? e.op(t.tag, "ilike", surround(query.query, "%"))
				: e.bool(true);

			const classFilter = e.op(
				e.op(t.class.name, "=", query.class),
				"and",
				e.op(t.class.school.name, "=", query.school),
			);

			return {
				filter: e.op(queryFilter, "and", classFilter),
				offset: query.offset,
				limit: query.limit === -1 ? undefined : query.limit,

				tag: true,
				color: true,
			};
		});

		const result = await promiseResult(() => dbQuery.run(client));
		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}

		return responseBuilder("success", {
			message: "Successfully retrieved tags",
			data: result.data,
		});
	},
	{
		query: t.Object({
			class: t.String(),
			school: t.String(),
			query: t.Optional(t.String()),
			limit: t.Numeric({ minimum: 0, default: 50 }),
			offset: t.Numeric({ minimum: 0, default: 0 }),
		}),
	},
);
