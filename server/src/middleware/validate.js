import { sendError } from '../utils/apiResponse.js';

/**
 * Higher-order middleware to validate incoming request data using Zod schemas.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema (object with optional body, query, params)
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/', validate(createOpportunitySchema), opportunityController.create);
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Assign parsed/sanitized data back to request
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      return next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const details = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
          location: err.path[0] || 'body'
        }));

        return sendError(
          res,
          'Validation failed for provided request data.',
          400,
          'VALIDATION_ERROR',
          details
        );
      }

      return next(error);
    }
  };
}
