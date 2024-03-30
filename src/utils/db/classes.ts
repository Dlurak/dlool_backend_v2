import e from "@edgedb";
import { client } from "index";
import { promiseResult } from "utils/errors";

/**
 * Get the amount of members in a class
 * This only gives the accepted members - requests are ignored
 * It doesn't modify the database but reads from it
 * @throws Error if the database query fails
 */
export async function getAmountOfMembersOfClass(props: {
	className: string;
	schoolName: string;
}) {
	const selectClassMembersQuery = e.select(e.User, (u) => {
		const classNameMatches = e.op(
			u["<students[is Class]"].name,
			"=",
			props.className,
		);
		const schoolNameMatches = e.op(
			u["<students[is Class]"].school.name,
			"=",
			props.schoolName,
		);

		return {
			filter: e.op(classNameMatches, "and", schoolNameMatches),
		};
	});
	const countClassMembersQuery = e.count(selectClassMembersQuery);
	const result = await promiseResult(() => countClassMembersQuery.run(client));

	if (result.status === "error") {
		throw new Error("Failed to get amount of class members");
	}

	return result.data;
}
