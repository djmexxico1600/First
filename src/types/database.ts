import * as schema from '@/lib/db/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// User types
export type User = InferSelectModel<typeof schema.users>;
export type InsertUser = InferInsertModel<typeof schema.users>;

// Beat types
export type Beat = InferSelectModel<typeof schema.beats>;
export type InsertBeat = InferInsertModel<typeof schema.beats>;

// Order types
export type Order = InferSelectModel<typeof schema.orders>;
export type InsertOrder = InferInsertModel<typeof schema.orders>;

// Subscription types
export type Subscription = InferSelectModel<typeof schema.subscriptions>;
export type InsertSubscription = InferInsertModel<typeof schema.subscriptions>;

// Artist Upload types
export type ArtistUpload = InferSelectModel<typeof schema.artistUploads>;
export type InsertArtistUpload = InferInsertModel<typeof schema.artistUploads>;

// Car Post types
export type CarPost = InferSelectModel<typeof schema.carPosts>;
export type InsertCarPost = InferInsertModel<typeof schema.carPosts>;

// Referral types
export type Referral = InferSelectModel<typeof schema.referrals>;
export type InsertReferral = InferInsertModel<typeof schema.referrals>;

// Enum types (for frontend use)
export type Tier = 'none' | 'basic' | 'pro' | 'vip';
export type Role = 'user' | 'artist' | 'admin';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BeatStatus = 'draft' | 'published' | 'archived';
export type UploadStatus = 'pending' | 'fulfilled' | 'rejected';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'incomplete';
