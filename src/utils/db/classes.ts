import e from "@edgedb";
import { client } from "index";
import { promiseResult } from "utils/errors";

interface ClassIdentifier {
	className: string;
	schoolName: string;
}

/**
 * Get the amount of members in a class
 * This only gives the accepted members - requests are ignored
 * It doesn't modify the database but reads from it
 * @throws Error if the database query fails
 */
export async function getAmountOfMembersOfClass(props: ClassIdentifier) {
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

	if (result.isError) {
		throw new Error("Failed to get amount of class members");
	}

	return result.data;
}

/**
 * Find out if a class exists
 * It doesn't modify the database but reads from it
 * @throws Error if the query fails
 * @readonly
 */
export async function doesClassExist(props: ClassIdentifier) {
	const query = e.select(e.Class, (c) => {
		const nameMatches = e.op(c.name, "=", props.className);
		const schoolMatches = e.op(c.school.name, "=", props.schoolName);
		return {
			filter_single: e.op(nameMatches, "and", schoolMatches),
		};
	});
	const result = await promiseResult(() => query.run(client));

	if (result.isError) {
		throw new Error("Failed to get class");
	}

	return !!result.data;
}

export const multipleClasses = (props: {
	schoolName: string;
	classNames: string[];
}) => {
	return e.select(e.Class, (c) => {
		const nameMatches = e.op(c.name, "in", e.set(...props.classNames));
		const schoolMatches = e.op(c.school.name, "=", props.schoolName);

		return {
			filter: e.op(nameMatches, "and", schoolMatches),
			name: true,
		};
	});
};
