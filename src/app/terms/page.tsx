import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service – DJMEXXICO',
  description: 'Terms of service for the DJMEXXICO beats marketplace and artist management platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-cyan">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-slate-400 mb-10">Last updated: April 10, 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-300">
            By accessing or using djmexxico.com (&ldquo;Platform&rdquo;) you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
            from using or accessing this site.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">2. Beat Licenses</h2>
          <p className="text-slate-300 mb-4">
            All beats sold on this Platform are licensed, not sold. By purchasing a beat you receive one of the
            following license types:
          </p>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>
              <strong className="text-white">Lease License</strong> — Non-exclusive right to use the beat for
              commercial recordings up to 10,000 streams/sales. Credit required: &ldquo;Prod. by DJMEXXICO&rdquo;.
            </li>
            <li>
              <strong className="text-white">Exclusive License</strong> — Exclusive ownership transferred upon
              purchase confirmation. Beat is removed from the store. Credit required.
            </li>
          </ul>
          <p className="text-slate-400 mt-4 text-sm">
            Licenses do not transfer copyright of the underlying composition to the buyer. Full stems are provided
            with exclusive licenses only.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">3. Artist Upload &amp; Distribution Service</h2>
          <p className="text-slate-300 mb-4">
            Artists who submit music for distribution agree to the following:
          </p>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>You own or control all rights to the submitted content.</li>
            <li>
              You grant DJMEXXICO a limited, non-exclusive license to review, transcode, and submit your music to
              DistroKid on your behalf.
            </li>
            <li>
              You accept DistroKid&rsquo;s terms of service as a condition of distribution. DJMEXXICO is not
              responsible for DistroKid&rsquo;s service availability.
            </li>
            <li>Royalties are paid directly to you via DistroKid. DJMEXXICO collects a service fee only.</li>
            <li>
              You are solely responsible for ensuring your submission does not infringe third-party copyrights.
              You indemnify DJMEXXICO against all claims arising from copyright infringement.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">4. Management Subscriptions</h2>
          <p className="text-slate-300">
            Subscriptions are billed monthly via Stripe. You may cancel at any time; cancellation takes effect at the
            end of the current billing period. No refunds are issued for partial months. DJMEXXICO reserves the right
            to modify tier features with 30 days notice.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>Uploading content you do not own or have rights to distribute.</li>
            <li>Reverse-engineering, scraping, or automated access without permission.</li>
            <li>Attempting to bypass security controls (Turnstile, rate limits, auth).</li>
            <li>Reselling, sublicensing, or redistributing beats beyond the granted license scope.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">6. DMCA &amp; Copyright Takedowns</h2>
          <p className="text-slate-300">
            DJMEXXICO respects intellectual property rights. To submit a DMCA takedown notice, send the required
            information to <a href="mailto:dmca@djmexxico.com" className="text-cyan-400 hover:text-cyan-300">dmca@djmexxico.com</a>.
            We will respond within 3 business days.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="text-slate-300">
            To the maximum extent permitted by law, DJMEXXICO shall not be liable for any indirect, incidental,
            special, or consequential damages arising from your use of the Platform.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p className="text-slate-300">
            These terms are governed by the laws of the United States. Disputes shall be resolved by binding
            arbitration in accordance with the American Arbitration Association rules.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
          <p className="text-slate-300">
            Questions? Contact us at{' '}
            <a href="mailto:legal@djmexxico.com" className="text-cyan-400 hover:text-cyan-300">
              legal@djmexxico.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
