import { UNAUTHORIZED } from "constants/responses";
import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { auth } from "plugins/auth";

export const userOwnInfoRouter = new Elysia({ prefix: "/me" })
	.use(auth)
	.use(HttpStatusCode())
	.get(
		"/",
		({ auth, set, httpStatus }) => {
			if (!auth.isAuthorized) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return UNAUTHORIZED;
			}

			// An authorized request to that endpoint will give a lot of info
			set.redirect = `/user/info?username=${auth.username}`;
		},
		{
			detail: {
				description:
					"Get information about yourself. For this the user needs to authenthicated",
				tags: ["User"],
			},
		},
	);
