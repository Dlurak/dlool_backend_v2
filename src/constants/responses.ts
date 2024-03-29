import { responseBuilder } from "utils/response";

export const UNAUTHORIZED = responseBuilder("error", {
	error: "Unauthorized",
});
