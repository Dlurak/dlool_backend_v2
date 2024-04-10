import Elysia from "elysia";
import { createCalendar } from "./create";
import { deleteCalendar } from "./delete";
import { listCalendar } from "./list";

export const calendarRouter = new Elysia({ prefix: "/calendar" })
	.use(createCalendar)
	.use(listCalendar)
	.use(deleteCalendar);
