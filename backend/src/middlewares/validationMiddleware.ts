import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Password complexity pattern: At least one letter, one number, and one special character
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one letter, one number, and one special character (@$!%*#?&)'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be under 50 characters'),
  usageType: z.enum(['OWN', 'TEAM'], {
    errorMap: () => ({ message: 'Usage type must be OWN (individual) or TEAM (collaborative)' }),
  }),
  currentManagementMethod: z.enum(['PAPER', 'APP'], {
    errorMap: () => ({ message: 'Current management method must be PAPER or APP' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const socialLoginSchema = z.object({
  provider: z.enum(['GOOGLE', 'FACEBOOK'], {
    errorMap: () => ({ message: 'Provider must be GOOGLE or FACEBOOK' }),
  }),
  token: z.string().min(1, 'OAuth token is required'),
  name: z.string().min(1, 'User name from social profile is required'),
  email: z.string().email('Invalid email address').optional(),
  usageType: z.enum(['OWN', 'TEAM']).optional(),
  currentManagementMethod: z.enum(['PAPER', 'APP']).optional(),
});

/**
 * Higher-order middleware function to validate Request Body using Zod schemas
 * @param schema ZodSchema to validate against
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: issues,
        });
        return;
      }
      next(error);
    }
  };
};
