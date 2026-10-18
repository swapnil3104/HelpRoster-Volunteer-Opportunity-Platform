import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(['volunteer', 'organization']).default('volunteer'),
    email: z.string().trim().toLowerCase().email('Invalid email address').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    first_name: z.string().trim().min(1, 'First name is required').max(100),
    last_name: z.string().trim().min(1, 'Last name is required').max(100),
    // Organization fields
    organization_name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(255).optional(),
    organization_description: z.string().trim().optional(),
    // Volunteer fields
    phone: z.string().trim().max(30).optional(),
    bio: z.string().trim().optional(),
    skills: z.string().trim().optional(),
    interests: z.string().trim().optional(),
    location: z.string().trim().max(255).optional(),
    availability: z.string().trim().max(100).optional()
  }).refine((data) => {
    if (data.role === 'organization' && !data.organization_name) {
      return false;
    }
    return true;
  }, {
    message: 'Organization name is required when registering as an organization',
    path: ['organization_name']
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});
