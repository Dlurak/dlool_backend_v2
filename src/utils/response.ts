const positiveResponse = <D>(message: string, data: D) => {
	return {
		status: "success",
		message,
		data,
	};
};

const negativeResponse = (error: string) => {
	return {
		status: "error",
		error,
	};
};

type PositiveResponseParams<D> = {
	message: string;
	data: D;
};

type NegativeResponseParams = {
	error: string;
};

type Status = "success" | "error";

type ResponseParams<T extends Status, D> = T extends "success"
	? PositiveResponseParams<D>
	: NegativeResponseParams;

type PositiveResponse<T> = {
	status: "success";
	message: string;
	data: T;
};
type NegativeResponse = {
	status: "error";
	error: string;
}

type Response<T extends Status, D> = T extends "success"
	? PositiveResponse<D>
	: NegativeResponse;

/**
 * Builds a response object based on the status and parameters
 * @param status The status of the response
 */
export const responseBuilder = <T extends Status, D>(
	status: T,
	params: ResponseParams<T, D>,
): Response<T, D> => {
	switch (status) {
		case "success": {
			const { message, data } = params as PositiveResponseParams<D>;
			return positiveResponse(message, data) as Response<T, D>;
		}
		case "error": {
			const { error } = params as NegativeResponseParams;
			return negativeResponse(error) as Response<T, D>;
		}
		default:
			throw new Error("Invalid status");
	}
};
