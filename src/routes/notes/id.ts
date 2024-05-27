import e from "@edgedb";
import { DATABASE_READ_FAILED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { promiseResult } from "utils/errors";
import { replaceDateWithTimestamp } from "utils/objects/transform";
import { responseBuilder } from "utils/response";

export const specificNote = new Elysia()
	.use(HttpStatusCode())
	.get("/:id", async ({ params, set, httpStatus }) => {
		const query = e.select(e.Note, (n) => ({
			filter_single: e.op(n.id, "=", e.uuid(params.id)),

			title: true,
			summary: true,
			tags: () => ({
				tag: true,
				color: true,
			}),
			class: () => ({ name: true, school: () => ({ name: true }) }),
			creator: () => ({ username: true }),
			editScope: true,
			priority: true,
			updates: () => ({
				user: () => ({ username: true, displayname: true }),
				time: true,
			}),
		}));

		const result = await promiseResult(async () => query.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_400_BAD_REQUEST;
			return DATABASE_READ_FAILED;
		}

		if (!result.data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "Note not found",
			});
		}

		return responseBuilder("success", {
			message: "Successfully retrieved note",
			data: replaceDateWithTimestamp(result.data),
		});
	});
