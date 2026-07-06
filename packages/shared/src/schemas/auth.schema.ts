import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type Tokens = z.infer<typeof TokensSchema>;

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken requerido"),
});

export type RefreshInput = z.infer<typeof RefreshSchema>;

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
