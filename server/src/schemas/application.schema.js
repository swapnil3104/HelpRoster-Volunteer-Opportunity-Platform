import { z } from 'zod';

export const submitApplicationSchema = z.object({
  body: z.object({
    opportunity_id: z.coerce.number().int().positive('Valid opportunity ID is required.'),
    message: z.string().trim().max(2000, 'Message cannot exceed 2000 characters.').nullable().optional().or(z.literal(''))
  })
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected'], {
      errorMap: () => ({ message: "Status must be 'accepted' or 'rejected'." })
    }),
    review_notes: z.string().trim().max(1000, 'Review notes cannot exceed 1000 characters.').nullable().optional().or(z.literal(''))
  })
});
