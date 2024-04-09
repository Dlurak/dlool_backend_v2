import Elysia from "elysia";
import { createCalendar } from "./create";

export const calendarRouter = new Elysia({ prefix: "/calendar" }).use(
	createCalendar,
);
