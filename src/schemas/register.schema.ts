import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const RegisterBodySchema = z.object({
  fullname: z.string().openapi({ example: "skyes crawford" }),
  username: z.string().openapi({ example: "skyes07" }),
  password: z.string().openapi({ example: "password123" }),
});

type RegisterBody = z.infer<typeof RegisterBodySchema>;

export const RegisterResponseSchema = z.object({
  access_token: z.string().openapi({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
  }),
});
