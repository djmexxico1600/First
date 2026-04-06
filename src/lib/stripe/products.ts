export const STRIPE_PRODUCTS = {
  beats: {
    lease: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_BEAT_LEASE_PRICE_ID || '',
      name: 'Beat Lease (Lease Rights)',
      amount: 2499,
    },
    exclusive: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_BEAT_EXCLUSIVE_PRICE_ID || '',
      name: 'Beat Exclusive (Full Rights)',
      amount: 9999,
    },
  },
  subscriptions: {
    basic: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_SUB_BASIC_PRICE_ID || '',
      name: 'Management Basic',
      tier: 'basic',
      amount: 2999,
    },
    pro: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_SUB_PRO_PRICE_ID || '',
      name: 'Management Pro',
      tier: 'pro',
      amount: 7999,
    },
    vip: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_SUB_VIP_PRICE_ID || '',
      name: 'Management VIP',
      tier: 'vip',
      amount: 19999,
    },
  },
};
