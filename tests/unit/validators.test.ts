/**
 * Unit Tests: Validators
 * Tests input validation (Zod schemas) for all user-facing forms
 * These tests run in-memory and are fast (< 100ms each)
 */

import { describe, it, expect } from 'vitest';
import {
  beatPurchaseSchema,
  subscriptionSchema,
  artistUploadSchema,
  carPostSchema,
  newsletterSchema,
} from '@/lib/validators';

describe('Validators', () => {
  describe('beatPurchaseSchema', () => {
    it('should accept valid beat purchase', () => {
      const input = {
        beatId: 'beat_123',
        licenseType: 'lease' as const,
      };

      const result = beatPurchaseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.beatId).toBe('beat_123');
        expect(result.data.licenseType).toBe('lease');
      }
    });

    it('should accept exclusive license type', () => {
      const input = {
        beatId: 'beat_456',
        licenseType: 'exclusive' as const,
      };

      const result = beatPurchaseSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject missing beatId', () => {
      const input = {
        licenseType: 'lease' as const,
      };

      const result = beatPurchaseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty beatId', () => {
      const input = {
        beatId: '',
        licenseType: 'lease' as const,
      };

      const result = beatPurchaseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid license type', () => {
      const input = {
        beatId: 'beat_123',
        licenseType: 'invalid',
      };

      const result = beatPurchaseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('subscriptionSchema', () => {
    it('should accept valid subscription tiers', () => {
      const tiers = ['basic', 'pro', 'vip'] as const;

      tiers.forEach((tier) => {
        const result = subscriptionSchema.safeParse({ tier });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid tier', () => {
      const result = subscriptionSchema.safeParse({ tier: 'platinum' });
      expect(result.success).toBe(false);
    });
  });

  describe('artistUploadSchema', () => {
    it('should accept valid artist upload', () => {
      const input = {
        title: 'My Awesome Track',
        artist: 'DJMEXXICO',
        genre: 'Hip-Hop',
        fileName: 'track.mp3',
        fileType: 'audio/mpeg',
      };

      const result = artistUploadSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const input = {
        artist: 'DJMEXXICO',
        // missing title and fileName
      };

      const result = artistUploadSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject non-audio file types', () => {
      const input = {
        title: 'Test',
        artist: 'Artist',
        fileName: 'image.jpg',
        fileType: 'image/jpeg', // Wrong type
      };

      const result = artistUploadSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept audio/* file types', () => {
      const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac'];

      audioTypes.forEach((fileType) => {
        const result = artistUploadSchema.safeParse({
          title: 'Test',
          artist: 'Artist',
          fileName: 'test.mp3',
          fileType,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject title > 255 chars', () => {
      const longTitle = 'a'.repeat(256);
      const result = artistUploadSchema.safeParse({
        title: longTitle,
        artist: 'Artist',
        fileName: 'test.mp3',
        fileType: 'audio/mpeg',
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional UPC', () => {
      const input = {
        title: 'Test Track',
        artist: 'Artist',
        fileName: 'track.mp3',
        fileType: 'audio/mpeg',
        upc: '123456789012',
      };

      const result = artistUploadSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('carPostSchema', () => {
    it('should accept valid car post', () => {
      const input = {
        title: '2010 Cadillac CTS Build',
        description: 'Documenting my Cadillac CTS build journey...',
      };

      const result = carPostSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject short description', () => {
      const input = {
        title: 'Build',
        description: 'Short', // < 10 chars
      };

      const result = carPostSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept tags', () => {
      const input = {
        title: '2010 Cadillac CTS Build',
        description: 'Documenting my Cadillac CTS build journey...',
        tags: ['cadillac', 'cts', 'build', 'customization'],
      };

      const result = carPostSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject description > 2000 chars', () => {
      const longDescription = 'a'.repeat(2001);
      const result = carPostSchema.safeParse({
        title: 'Test',
        description: longDescription,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('newsletterSchema', () => {
    it('should accept valid email', () => {
      const result = newsletterSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept various email formats', () => {
      const emails = [
        'user@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user123@sub.example.com',
      ];

      emails.forEach((email) => {
        const result = newsletterSchema.safeParse({ email });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = newsletterSchema.safeParse({ email });
        expect(result.success).toBe(false);
      });
    });
  });
});
