import { z } from 'zod';

/**
 * Validation schema for contact submissions using Zod.
 */
export const contactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
    subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(255),
    message: z.string().trim().min(10, 'Message must be at least 10 characters long').max(3000)
  })
});
