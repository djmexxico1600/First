// Analytics tracking for PostHog, Mixpanel, Plausible, or custom backend
// This is framework-agnostic and can be used in Server Actions and Client Components

type EventProperties = Record<string, string | number | boolean>;

class Analytics {
  private endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/events';
  private enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

  async track(event: string, properties?: EventProperties) {
    if (!this.enabled) return;

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  // Common events
  trackPageView(path: string, title?: string) {
    return this.track('page_view', { path, title });
  }

  trackBeatPlay(beatId: string, beatTitle: string) {
    return this.track('beat_play', { beatId, beatTitle });
  }

  trackBeatPurchase(beatId: string, licenseType: 'lease' | 'exclusive', amount: number) {
    return this.track('beat_purchase', { beatId, licenseType, amount });
  }

  trackSubscriptionView(tier: 'basic' | 'pro' | 'vip') {
    return this.track('subscription_view', { tier });
  }

  trackSubscriptionPurchase(tier: 'basic' | 'pro' | 'vip', amount: number) {
    return this.track('subscription_purchase', { tier, amount });
  }

  trackUpload(title: string, genre?: string) {
    return this.track('artist_upload', { title, genre });
  }

  trackError(error: string, context?: string) {
    return this.track('error', { error, context });
  }

  trackSignup(method: 'email' | 'google' | 'discord') {
    return this.track('signup', { method });
  }

  trackConversion(type: 'beat_purchase' | 'subscription' | 'upload', value: number) {
    return this.track('conversion', { type, value });
  }
}

export const analytics = new Analytics();
