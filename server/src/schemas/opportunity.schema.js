import { z } from 'zod';

export const createOpportunitySchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(255),
    category_id: z.coerce.number().int().positive().nullable().optional(),
    description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
    requirements: z.string().trim().nullable().optional(),
    responsibilities: z.string().trim().nullable().optional(),
    location_type: z.enum(['on_site', 'remote', 'hybrid']).default('on_site'),
    location: z.string().trim().min(2, 'Location must be at least 2 characters.').max(255),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format.'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format.').nullable().optional().or(z.literal('')),
    application_deadline: z.string().min(1, 'Application deadline is required.'),
    commitment_hours: z.coerce.number().int().min(1).max(500).nullable().optional(),
    capacity: z.coerce.number().int().min(1).default(1),
    status: z.enum(['draft', 'published']).default('draft'),
    skills: z.array(z.string().trim().min(1).max(100)).optional().default([])
  })
});

export const updateOpportunitySchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(255).optional(),
    category_id: z.coerce.number().int().positive().nullable().optional(),
    description: z.string().trim().min(10).optional(),
    requirements: z.string().trim().nullable().optional(),
    responsibilities: z.string().trim().nullable().optional(),
    location_type: z.enum(['on_site', 'remote', 'hybrid']).optional(),
    location: z.string().trim().min(2).max(255).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().or(z.literal('')),
    application_deadline: z.string().optional(),
    commitment_hours: z.coerce.number().int().min(1).max(500).nullable().optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
    skills: z.array(z.string().trim().min(1).max(100)).optional()
  })
});

export const updateOpportunityStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'published', 'closed', 'archived'], {
      errorMap: () => ({ message: "Status must be 'draft', 'published', 'closed', or 'archived'." })
    })
  })
});
