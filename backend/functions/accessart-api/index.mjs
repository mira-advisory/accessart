// Single entry point for the accessart-api Lambda.
// All HTTP traffic arrives via one API Gateway catch-all route (ANY /{proxy+}).
import { handleHttp } from "./app.mjs";

export const handler = async (event) => handleHttp(event);
