import e from "@edgedb";

interface ClassBySchoolAndNameProps {
	schoolName: string;
	className: string;
}

export const classBySchoolAndName = ({
	schoolName,
	className,
}: ClassBySchoolAndNameProps) => {
	return e.select(e.Class, (c) => ({
		filter_single: e.op(
			e.op(c.name, "=", className),
			"and",
			e.op(c.school.name, "=", schoolName),
		),
	}));
};
