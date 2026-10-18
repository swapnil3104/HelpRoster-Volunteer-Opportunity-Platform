import { z } from 'zod';

export const updateVolunteerProfileSchema = z.object({
  body: z.object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
    phone: z.string().trim().max(30).nullable().optional(),
    bio: z.string().trim().nullable().optional(),
    skills: z.string().trim().nullable().optional(),
    interests: z.string().trim().nullable().optional(),
    location: z.string().trim().max(255).nullable().optional(),
    availability: z.string().trim().max(100).nullable().optional(),
    avatar_url: z.string().trim().url().nullable().optional().or(z.literal('')),
    is_public: z.boolean().optional()
  })
});

export const updateOrganizationProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().min(10).optional(),
    mission: z.string().trim().nullable().optional(),
    logo_url: z.string().trim().url().nullable().optional().or(z.literal('')),
    website: z.string().trim().url().nullable().optional().or(z.literal('')),
    phone: z.string().trim().max(30).nullable().optional(),
    address: z.string().trim().max(255).nullable().optional(),
    city: z.string().trim().max(100).nullable().optional(),
    state: z.string().trim().max(100).nullable().optional(),
    country: z.string().trim().max(100).optional(),
    postal_code: z.string().trim().max(20).nullable().optional()
  })
});
