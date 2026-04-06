import { createSubscriptionCheckoutSession } from '@/lib/stripe/actions';

const tiers = [
  {
    name: 'Basic',
    id: 'basic',
    price: 29.99,
    description: 'Perfect for emerging artists',
    features: [
      '1 SoundCloud repost/month',
      '2 Instagram promo posts/month',
      'Priority email support',
      'Artist dashboard access',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    price: 79.99,
    description: 'For serious musicians',
    features: [
      'Unlimited SoundCloud reposts',
      '4 Instagram promo posts/month',
      'Priority support',
      'Full artist dashboard',
      'Advanced analytics',
      'Playlist placement network',
      'Monthly strategy call',
    ],
    popular: true,
  },
  {
    name: 'VIP',
    id: 'vip',
    price: 199.99,
    description: 'Full management experience',
    features: [
      'Unlimited SoundCloud reposts',
      'Daily Instagram collaboration posts',
      '24/7 priority support',
      'Dedicated account manager',
      'Full analytics & reporting',
      'Playlist placement priority',
      'Weekly strategy calls',
      'DistroKid distribution queue',
      'Exclusive networking access',
    ],
  },
];

export default function ManagementPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Artist Management Tiers</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the perfect management tier to grow your music career with dedicated support, placements, and promotion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative p-8 rounded-lg transition ${
                tier.popular
                  ? 'border-2 border-cyan-400 bg-gradient-to-b from-slate-900 to-cyan-950/20 scale-105'
                  : 'border border-slate-800 bg-slate-900/50 hover:border-cyan-400/50'
              }`}
            >
              {tier.popular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-cyan-500 text-slate-950 text-sm font-bold">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{tier.description}</p>

              <div className="mb-6">
                <p className="text-4xl font-bold text-cyan-400">
                  ${tier.price.toFixed(2)}
                </p>
                <p className="text-sm text-slate-400 mt-1">/month</p>
              </div>

              <form action={createSubscriptionCheckoutSession} className="mb-8">
                <input type="hidden" name="tier" value={tier.id} />
                <button
                  type="submit"
                  className={`w-full px-4 py-3 rounded font-bold transition ${
                    tier.popular
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : 'border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10'
                  }`}
                >
                  Get Started
                </button>
              </form>

              <ul className="space-y-3">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-cyan-400 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-lg border border-slate-800 bg-slate-900/50">
          <h2 className="text-2xl font-bold mb-4">Why Choose DJMEXXICO Management?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">✓ Proven Track Record</h3>
              <p className="text-slate-400">230K+ all-time SoundCloud plays, 37K Instagram followers</p>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">✓ Direct Network Access</h3>
              <p className="text-slate-400">Connected with major playlist curators and influencers</p>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">✓ Transparent Process</h3>
              <p className="text-slate-400">Real-time analytics and monthly strategy reviews</p>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">✓ Artist-First Approach</h3>
              <p className="text-slate-400">Your success is our success — we grow together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
