import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Password is required.").max(72),
});
