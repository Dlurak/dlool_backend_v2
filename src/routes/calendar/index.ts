import Elysia from "elysia";
import { createCalendar } from "./create";
import { listCalendar } from "./list";

export const calendarRouter = new Elysia({ prefix: "/calendar" })
	.use(createCalendar)
	.use(listCalendar);
