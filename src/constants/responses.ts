import { responseBuilder } from "utils/response";

/**
 * A response indicating that the user is not authorized to access the resource
 * Use with `401 Unauthorized`
 */
export const UNAUTHORIZED = responseBuilder("error", {
	error: "Unauthorized",
});

/**
 * A response indicating that an error occurred while writing to the database
 * Use with `500 Internal Server Error`
 */
export const DATABASE_WRITE_FAILED = responseBuilder("error", {
	error: "An error occurred while writing to the database",
});

/**
 * A response indicating that an error occurred while reading from the database
 * Use with `500 Internal Server Error`
 */
export const DATABASE_READ_FAILED = responseBuilder("error", {
	error: "An error occurred while reading from the database",
});

/**
 * A response indicating that an error occurred while deleting from the database
 * Use with `500 Internal Server Error`
 */
export const DATABASE_DELETE_FAILED = responseBuilder("error", {
	error: "An error occurred while deleting from the database",
});

/**
 * A response indicating that the user does not have permission to access the resource
 * Use with `403 Forbidden`
 */
export const FORBIDDEN = responseBuilder("error", {
	error: "Forbidden",
});

/**
 * A response indicating that the access token was generated by a refresh token but it
 * should be generated by logging in
 * Use with `403 Forbidden`
 */
export const MUST_BE_GENERATED_BY_LOGIN_NOT_REFRESH = responseBuilder("error", {
	error: "Access token must be generated using log in and not a refresh token",
});
