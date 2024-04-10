import e from "@edgedb";
import { DATE } from "constants/regex";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia, { t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { stringArraySchema } from "schemas/stringArray";
import { removeDuplicates } from "utils/arrays/duplicates";
import { filterTruthy } from "utils/arrays/filter";
import {
	normalDateToCustom,
	stringToNormal,
} from "utils/dates/customAndNormal";
import { promiseResult } from "utils/errors";
import { replaceDateDeep } from "utils/objects/transform";
import { responseBuilder } from "utils/response";
import { split } from "utils/strings/split";
import { surround } from "utils/strings/surround";
import { savePredicate } from "utils/undefined";

export const listCalendar = new Elysia().use(HttpStatusCode()).get(
	"/",
	async ({ set, httpStatus, query }) => {
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

		const isDescending = query.orderDirection === "desc";

		const latestStart = savePredicate(
			query.filter?.start?.latest,
			stringToNormal,
		);
		const earliesStart = savePredicate(
			query.filter?.start?.earliest,
			stringToNormal,
		);

		const titleQuery = query.filter?.title;
		const summaryQuery = query.filter?.summary;

		const calQuery = (limit: number, offset: number) =>
			e.select(e.Calendar, (c) => {
				const orderExpression = c[query.orderKey];
				const internalLimit = limit === -1 ? undefined : limit;

				const classMatches = e.op(c.class.name, "in", e.set(...classNames));
				const schoolMatches = e.op(c.class.school.name, "=", query.school);

				const earliesStartFilter = earliesStart
					? e.op(c.beginning, ">=", earliesStart)
					: e.bool(true);
				const latestStartFilter = latestStart
					? e.op(c.beginning, "<=", latestStart)
					: e.bool(true);

				const titleFilter = titleQuery
					? titleQuery.exact
						? e.op(c.title, "=", titleQuery.query)
						: e.op(c.title, "ilike", surround(titleQuery.query, "%"))
					: e.bool(true);

				const summaryFilter = summaryQuery
					? summaryQuery.exact
						? e.op(c.summary, "=", summaryQuery.query)
						: e.op(c.summary, "ilike", surround(summaryQuery.query, "%"))
					: e.bool(true);

				const generalFilter = e.op(classMatches, "and", schoolMatches);
				const dateFilter = e.op(earliesStartFilter, "and", latestStartFilter);
				const specificFilter = e.op(titleFilter, "and", summaryFilter);

				return {
					filter: e.op(
						generalFilter,
						"and",
						e.op(specificFilter, "and", dateFilter),
					),
					order_by: {
						expression: orderExpression,
						direction: isDescending ? e.DESC : e.ASC,
						empty: e.EMPTY_LAST,
					},
					limit: internalLimit,
					offset,

					title: true,
					beginning: true,
					ending: true,
					location: true,
					priority: true,
					updates: () => ({
						user: () => ({ username: true, displayname: true }),
						time: true,
					}),
					tags: () => ({
						tag: true,
						color: true,
					}),
					id: true,
				};
			});

		const result = await promiseResult(async () => {
			const [count, calendar] = await Promise.all([
				e.count(calQuery(-1, 0)).run(client),
				calQuery(query.limit, query.offset).run(client),
			]);
			return {
				count,
				calendar,
			};
		});

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_READ_FAILED;
		}

		// the type is incorrect ending is `CustomDate | null` not `Date | null`
		// Not in the mood to fix it rn
		const formatted = result.data.calendar.map((c) => ({
			...replaceDateDeep(c, normalDateToCustom),
			tags: c.tags,
			updates: c.updates.map((u) => replaceDateDeep(u, (d) => d.getTime())),
		}));

		return responseBuilder("success", {
			message: "Received data",
			data: {
				totalCount: result.data.count,
				calendar: formatted,
			},
		});
	},
	{
		query: t.Object({
			school: t.String({ minLength: 1 }),
			classes: t.String({ minLength: 1 }),
			limit: t.Numeric({ minimum: -1, default: 50 }),
			offset: t.Numeric({ minimum: 0, default: 0 }),
			orderDirection: t.Union([t.Literal("asc"), t.Literal("desc")], {
				default: "desc",
			}),
			orderKey: t.Union([t.Literal("beginning"), t.Literal("location")], {
				default: "beginning",
			}),
			filter: t.Optional(
				t.ObjectString({
					start: t.Optional(
						t.Object({
							earliest: t.Optional(t.RegExp(DATE)),
							latest: t.Optional(t.RegExp(DATE)),
						}),
					),
					title: t.Optional(
						t.Object({
							query: t.String({ minLength: 1 }),
							exact: t.Boolean({ default: false }),
						}),
					),
					summary: t.Optional(
						t.Object({
							query: t.String({ minLength: 1 }),
							exact: t.Boolean({ default: false }),
						}),
					),
				}),
			),
		}),
	},
);
