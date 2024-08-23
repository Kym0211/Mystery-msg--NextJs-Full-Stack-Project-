import { z } from 'zod';

export const verifySchema = z.object({
    code: z.string().min(6, "Verification code must be atleast 6 characters").max(6, "Verification code must be atmost 6 characters"),
})