import { z } from "zod";

/**
 * An nonempty array with nonempty strings
 */
export const stringArraySchema = z.array(z.string().min(1)).nonempty();
