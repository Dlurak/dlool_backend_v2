import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { stringArraySchema } from "schemas/stringArray";
import { removeDuplicates } from "utils/arrays/duplicates";
import { filterTruthy } from "utils/arrays/filter";
import { normalDateToCustom } from "utils/dates/customAndNormal";
import { strToDir } from "utils/db/direction";
import { promiseResult } from "utils/errors";
import { replaceDateDeep } from "utils/objects/transform";
import { responseBuilder } from "utils/response";
import { split } from "utils/strings/split";
import { surround } from "utils/strings/surround";

export const listNotes = new Elysia()
	.use(HttpStatusCode())
	.use(auth)
	.get(
		"/",
		async ({ set, httpStatus, query, auth }) => {
			const classesResult = stringArraySchema.safeParse(
				filterTruthy(split(query.classes)),
			);
			if (!classesResult.success) {
				set.status = httpStatus.HTTP_400_BAD_REQUEST;
				return responseBuilder("error", {
					error: "Classes must be an array of strings",
				});
			}
			const classNames = removeDuplicates(classesResult.data).sort();

			const qFilter = query.filter?.query;

			const dbQuery = (limit: number, offset: number) =>
				e.select(e.Note, (n) => {
					const internalLimit = limit === -1 ? undefined : limit;

					const classMatches = e.op(
						e.op(n.class.name, "=", e.set(...classNames)),
						"and",
						e.op(n.class.school.name, "=", query.school),
					);

					const queryFilter = qFilter
						? e.op(
								e.op(n.title, "ilike", surround(qFilter, "%")),
								"or",
								e.op(n.summary, "ilike", surround(qFilter, "%")),
							)
						: e.bool(true);

					const orderExpression = {
						title: n.title,
						summary: n.summary,
						"last-update": e.max(n.updates.time),
						"first-update": e.min(n.updates.time),
					}[query.orderKey];

					return {
						filter: e.op(classMatches, "and", queryFilter),
						order_by: {
							expression: orderExpression,
							direction: strToDir(query.orderDirection),
							empty: e.EMPTY_LAST,
						},
						limit: internalLimit,
						offset,

						title: true,
						summary: true,
						tags: () => ({
							tag: true,
							color: true,
						}),
						editScope: auth.isAuthorized,
						priority: true,
						updates: () => ({
							user: () => ({ username: true, displayname: true }),
							time: true,
						}),
						id: true,
					};
				});
			const result = await promiseResult(() =>
				dbQuery(query.limit, query.offset).run(client),
			);

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}

			const formatted = result.data.map((i) =>
				replaceDateDeep(i, normalDateToCustom),
			);

			return responseBuilder("success", {
				message: "Successfully retrieved data",
				data: {
					notes: formatted,
				},
			});
		},
		{
			query: t.Object({
				school: t.String({ minLength: 1 }),
				classes: t.String({ minLength: 1 }),

				limit: t.Numeric({ minimum: -1, default: 15 }),
				offset: t.Numeric({ minimum: 0, default: 0 }),

				orderDirection: t.Union([t.Literal("asc"), t.Literal("desc")], {
					default: "desc",
				}),
				orderKey: t.Union(
					[
						t.Literal("title"),
						t.Literal("summary"),
						t.Literal("last-update"),
						t.Literal("first-update"),
					],
					{
						default: "last-update",
					},
				),
				filter: t.Optional(
					t.ObjectString({
						query: t.Optional(t.String()),
					}),
				),
			}),
		},
	);
