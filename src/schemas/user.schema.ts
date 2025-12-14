import { z } from "zod";

export const UserSchema = z.object({
  fullname: z.string(),
  username: z.string(),
  password: z.string(),
});

export type User = z.infer<typeof UserSchema>;
