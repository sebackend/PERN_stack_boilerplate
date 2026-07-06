import cors from "cors";
import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin: env.API_CORS_ORIGIN,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
