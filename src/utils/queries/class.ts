import e from "@edgedb";

interface ClassBySchoolAndNameProps {
	schoolName: string;
	className: string;
}

type UsersClassBySchoolAndNameProps = ClassBySchoolAndNameProps & {
	username: string;
};

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

export const usersClassBySchoolAndName = (
	props: UsersClassBySchoolAndNameProps,
) => {
	return e.select(e.Class, (c) => ({
		filter_single: e.op(
			e.op(
				e.op(c.name, "=", props.className),
				"and",
				e.op(c.school.name, "=", props.schoolName),
			),
			"and",
			e.op(props.username, "in", c.students.username),
		),
	}));
};
