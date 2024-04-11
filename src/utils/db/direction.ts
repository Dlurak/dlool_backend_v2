import e from "@edgedb";

export const strToDir = (dir: "asc" | "desc") =>
	dir === "asc" ? e.ASC : e.DESC;
