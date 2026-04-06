import { z } from 'zod';
import { ErrorFactory } from './error-handler';

export const beatPurchaseSchema = z.object({
  beatId: z.string().min(1, 'Beat ID is required'),
  licenseType: z.enum(['lease', 'exclusive']),
});

export const subscriptionSchema = z.object({
  tier: z.enum(['basic', 'pro', 'vip']),
});

export const artistUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  artist: z.string().min(1, 'Artist name is required').max(255),
  genre: z.string().max(100).optional(),
  upc: z.string().max(50).optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().regex(/^audio\//, 'File must be an audio file'),
});

export const carPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  tags: z.array(z.string()).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Validate request data against schema
 */
export function validateInput<T>(schema: z.ZodSchema, data: unknown): T {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      
      throw ErrorFactory.invalidInput('Validation failed', { fieldErrors });
    }
    throw error;
  }
}

/**
 * Validate ID format
 */
export function validateId(id: string | undefined, idName = 'ID'): string {
  if (!id) {
    throw ErrorFactory.missingRequired(idName);
  }
  if (typeof id !== 'string' || id.length === 0) {
    throw ErrorFactory.invalidInput(`Invalid ${idName} format`);
  }
  return id;
}

/**
 * Sanitize string input
 */
export function sanitizeString(value: string | undefined, maxLength = 1000): string {
  if (!value) {
    return '';
  }
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic HTML tag removal
}

export type BeatPurchaseInput = z.infer<typeof beatPurchaseSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type ArtistUploadInput = z.infer<typeof artistUploadSchema>;
export type CarPostInput = z.infer<typeof carPostSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
