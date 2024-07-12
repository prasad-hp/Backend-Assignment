import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email().nullable(),
  phoneNumber: z.string().nullable()
});

export default contactSchema;
