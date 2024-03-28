import { z } from "zod";

const schema = z.object({
	JWT_SECRET: z.string(),
});
type Env = z.infer<typeof schema>;

/**
 * This is a dump for all env variables to we only need to read them once
 */
let envDump: null | Env = null;

export const envVars = () => {
	if (envDump) return envDump;

	envDump = schema.parse(process.env);
	return envDump;
};
