import Elysia from "elysia";
import { createJoinRequest } from "./create";
import { listJoinRequests } from "./list";
import { ownJoinRequest } from "./own";
import { reviewJoinRequest } from "./review";

export const moderationRouter = new Elysia({ prefix: "/mod" })
	.use(ownJoinRequest("/own"))
	.use(createJoinRequest)
	.use(listJoinRequests)
	.use(reviewJoinRequest);
