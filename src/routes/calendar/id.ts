import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { normalDateToCustomDateTime } from "utils/dates/customAndNormal";
import { promiseResult } from "utils/errors";
import {
	replaceDateDeep,
	replaceDateWithTimestamp,
} from "utils/objects/transform";
import { responseBuilder } from "utils/response";

export const specificCalendar = new Elysia()
	.use(HttpStatusCode())
	.get("/:id", async ({ params, set, httpStatus }) => {
		const query = e.select(e.Calendar, (c) => ({
			filter_single: e.op(c.id, "=", e.uuid(params.id)),

			title: true,
			beginning: true,
			ending: true,
			location: true,
			priority: true,
			summary: true,
			class: () => ({
				name: true,
				school: () => ({ name: true }),
			}),
			updates: () => ({
				user: () => ({ username: true, displayname: true }),
				time: true,
			}),
			tags: () => ({
				tag: true,
				color: true,
			}),
			id: true,
		}));

		const result = await promiseResult(async () => query.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_400_BAD_REQUEST;
			return DATABASE_READ_FAILED;
		}

		if (!result.data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "Calendar event not found",
			});
		}

		return responseBuilder("success", {
			message: "Successfully retrieved calendar event",
			data: {
				...replaceDateDeep(result.data, normalDateToCustomDateTime),
				updates: result.data.updates.map(replaceDateWithTimestamp),
			},
		});
	});
