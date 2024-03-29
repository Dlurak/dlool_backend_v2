import type { ElysiaSwaggerConfig } from "@elysiajs/swagger/dist/types";
import { VERSION } from "./general";

/**
 * The options for the swagger plugin
 * It can't be a standalone module, but this is possible
 */
export const DOCUMENTATION_OPTIONS = {
	documentation: {
		info: {
			title: "Dlool API",
			license: {
				name: "GPL-3.0",
				url: "https://www.gnu.org/licenses/gpl-3.0.html",
			},
			version: VERSION,
		},
		externalDocs: {
			description:
				"The Dlool documentation for general information and usage of the frontend.",
			url: "https://dlool.me/documentation",
		},
		tags: [
			{ name: "App", description: "General app information" },
			{ name: "Auth", description: "Authentication endpoints" },
			{ name: "User", description: "User information endpoints" },
		],
	},
} satisfies ElysiaSwaggerConfig<"/swagger">;
