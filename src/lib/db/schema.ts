import {
  pgTable,
  varchar,
  text,
  integer,
  real,
  timestamp,
  boolean,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const tierEnum = pgEnum('tier', ['none', 'basic', 'pro', 'vip']);
export const roleEnum = pgEnum('role', ['user', 'artist', 'admin']);
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'past_due',
  'incomplete',
]);
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'completed',
  'failed',
  'refunded',
]);
export const beatStatusEnum = pgEnum('beat_status', ['draft', 'published', 'archived']);
export const uploadStatusEnum = pgEnum('upload_status', ['pending', 'fulfilled', 'rejected']);

// Users Table
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    discordId: varchar('discord_id', { length: 255 }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    currentTier: tierEnum('current_tier').default('none').notNull(),
    role: roleEnum('role').default('user').notNull(),
    referralCode: varchar('referral_code', { length: 255 }).unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    clerkIdIdx: index('clerk_id_idx').on(table.clerkId),
    emailIdx: index('email_idx').on(table.email),
    tierIdx: index('tier_idx').on(table.currentTier),
  })
);

// Beats Table
export const beats = pgTable(
  'beats',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    genre: varchar('genre', { length: 100 }),
    bpm: integer('bpm'),
    leasePrice: real('lease_price').notNull().default(24.99),
    exclusivePrice: real('exclusive_price').notNull().default(99.99),
    previewUrl: varchar('preview_url', { length: 1024 }),
    previewR2Key: varchar('preview_r2_key', { length: 1024 }),
    fullR2Key: varchar('full_r2_key', { length: 1024 }),
    status: beatStatusEnum('status').default('draft').notNull(),
    tags: text('tags'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('beat_status_idx').on(table.status),
    genreIdx: index('beat_genre_idx').on(table.genre),
  })
);

// Orders/Purchases Table
export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    beatId: varchar('beat_id', { length: 255 }).references(() => beats.id),
    stripeSessionId: varchar('stripe_session_id', { length: 255 }).unique(),
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
    type: varchar('type', { length: 50 }).notNull(),
    tier: tierEnum('tier'),
    amount: real('amount').notNull(),
    currency: varchar('currency', { length: 10 }).default('usd'),
    status: orderStatusEnum('status').default('pending').notNull(),
    metadata: text('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('order_user_id_idx').on(table.userId),
    statusIdx: index('order_status_idx').on(table.status),
  })
);

// Subscriptions Table
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeSubscriptionId: varchar('stripe_subscription_id', {
      length: 255,
    }).unique(),
    tier: tierEnum('tier').notNull(),
    status: subscriptionStatusEnum('status').default('active').notNull(),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('sub_user_id_idx').on(table.userId),
    statusIdx: index('sub_status_idx').on(table.status),
  })
);

// Artist Uploads Table
export const artistUploads = pgTable(
  'artist_uploads',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    r2Key: varchar('r2_key', { length: 1024 }).notNull(),
    metadata: text('metadata'),
    status: uploadStatusEnum('status').default('pending').notNull(),
    fulfilledAt: timestamp('fulfilled_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('upload_user_id_idx').on(table.userId),
    statusIdx: index('upload_status_idx').on(table.status),
  })
);

// Car Posts Table
export const carPosts = pgTable(
  'car_posts',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    mediaKeys: text('media_keys'),
    tags: text('tags'),
    publishedAt: timestamp('published_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    publishedIdx: index('car_published_idx').on(table.publishedAt),
  })
);

// Referrals Table
export const referrals = pgTable(
  'referrals',
  {
    id: varchar('id', { length: 255 }).primaryKey().notNull(),
    referralCode: varchar('referral_code', { length: 255 }).notNull().unique(),
    referrerId: varchar('referrer_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    referredUserId: varchar('referred_user_id', { length: 255 }).references(
      () => users.id,
      { onDelete: 'set null' }
    ),
    discountPercent: integer('discount_percent').default(10),
    used: boolean('used').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index('referral_code_idx').on(table.referralCode),
    referrerIdx: index('referral_referrer_idx').on(table.referrerId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  subscriptions: many(subscriptions),
  uploads: many(artistUploads),
  referrals: many(referrals),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  beat: one(beats, { fields: [orders.beatId], references: [beats.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const artistUploadsRelations = relations(artistUploads, ({ one }) => ({
  user: one(users, { fields: [artistUploads.userId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id] }),
  referredUser: one(users, { fields: [referrals.referredUserId], references: [users.id] }),
}));
