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

export const createTag = new Elysia()
	.use(auth)
	.use(HttpStatusCode())
	.post(
		"/",
		async ({ set, body, auth, httpStatus }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			const classQuery = e.select(e.Class, (c) => ({
				filter_single: e.op(
					e.op(auth.username, "in", c.students.username),
					"and",
					e.op(c.name, "=", body.class),
				),
			}));

			const tagsQuery = e.select(e.Tag, (t) => ({
				filter: e.op(
					e.op(e.str_lower(t.tag), "=", body.tag.toLowerCase()),
					"and",
					e.op(
						e.op(t.class.name, "=", body.class),
						"and",
						e.op(auth.username, "in", t.class.students.username),
					),
				),
			}));

			const vaidationlResult = await promiseResult(async () => {
				const [classes, tags] = await Promise.all([
					e.count(classQuery).run(client),
					e.count(tagsQuery).run(client),
				]);

				return { classes, tags };
			});
			if (vaidationlResult.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_READ_FAILED;
			}
			if (vaidationlResult.data.tags > 0) {
				set.status = httpStatus.HTTP_400_BAD_REQUEST;
				return responseBuilder("error", { error: "This tag already exists" });
			}
			if (vaidationlResult.data.classes === 0) {
				set.status = httpStatus.HTTP_404_NOT_FOUND;
				return responseBuilder("error", {
					error: "This class doesn't exist or you need to join it",
				});
			}

			const query = e.insert(e.Tag, {
				tag: body.tag,
				class: classQuery,
				color: body.color,
			});

			const result = await promiseResult(() => query.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			set.status = httpStatus.HTTP_201_CREATED;
			return responseBuilder("success", {
				message: "Created a new tag",
				data: null,
			});
		},
		{
			body: t.Object({
				tag: t.String({ minLength: 1 }),
				class: t.String({ minLength: 1 }),
				color: t.Optional(t.RegExp(/^#[0-9a-f]{3}([0-9a-f]{3})?$/)),
			}),
		},
	);
