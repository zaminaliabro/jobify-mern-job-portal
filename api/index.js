// Vercel serverless entry. Every /api/* request is routed here by vercel.json
// and handled by the same Express app that runs locally.
//
// No explicit connect step: Prisma opens its connection lazily on the first
// query, which is what you want when the function may be cold-started.
import app from "../server/app.js";

export default app;
