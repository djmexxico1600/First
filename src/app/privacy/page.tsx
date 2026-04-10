import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – DJMEXXICO',
  description: 'Privacy policy for the DJMEXXICO beats marketplace and artist management platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-cyan">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-10">Last updated: April 10, 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>
              <strong className="text-white">Account data</strong> — Email address, name, and profile info provided
              during sign-up via Clerk.
            </li>
            <li>
              <strong className="text-white">Purchase data</strong> — Order history and subscription status stored in
              our database. Card details are handled exclusively by Stripe and are never stored on our servers.
            </li>
            <li>
              <strong className="text-white">Uploaded files</strong> — Audio files and artwork you upload are stored
              in Cloudflare R2. You retain full ownership.
            </li>
            <li>
              <strong className="text-white">Usage data</strong> — Anonymous page-view and interaction analytics via
              Plausible Analytics (no cookies, no cross-site tracking, GDPR-compliant by design).
            </li>
            <li>
              <strong className="text-white">Server logs</strong> — Request logs retained for 30 days for debugging
              and security monitoring.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>To fulfil beat purchases and deliver download links.</li>
            <li>To manage your artist management subscription and tier access.</li>
            <li>To submit your music for distribution via DistroKid on your request.</li>
            <li>To send transactional emails (order confirmations, upload status updates).</li>
            <li>To detect and prevent fraud, abuse, and security threats.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
          <p className="text-slate-300 mb-4">We share data with the following trusted processors:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-white">Service</th>
                  <th className="text-left py-2 text-white">Purpose</th>
                  <th className="text-left py-2 text-white">Data Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2">Clerk</td>
                  <td className="py-2">Authentication</td>
                  <td className="py-2">Email, name</td>
                </tr>
                <tr>
                  <td className="py-2">Stripe</td>
                  <td className="py-2">Payments</td>
                  <td className="py-2">Email, order amount</td>
                </tr>
                <tr>
                  <td className="py-2">Cloudflare</td>
                  <td className="py-2">Hosting &amp; CDN</td>
                  <td className="py-2">IP address, request logs</td>
                </tr>
                <tr>
                  <td className="py-2">Resend</td>
                  <td className="py-2">Transactional email</td>
                  <td className="py-2">Email address</td>
                </tr>
                <tr>
                  <td className="py-2">DistroKid</td>
                  <td className="py-2">Music distribution (on request)</td>
                  <td className="py-2">Artist name, track metadata</td>
                </tr>
                <tr>
                  <td className="py-2">Neon</td>
                  <td className="py-2">Database hosting</td>
                  <td className="py-2">All structured data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
          <p className="text-slate-300">
            Account data is retained while your account is active. Purchase records are retained for 7 years for
            accounting purposes. Uploaded files are retained until you request deletion. Server logs are deleted after
            30 days.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights (GDPR / CCPA)</h2>
          <p className="text-slate-300 mb-4">You have the right to:</p>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>Access a copy of all data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Export your data in a machine-readable format.</li>
            <li>Opt out of any marketing communications at any time.</li>
          </ul>
          <p className="text-slate-400 mt-4 text-sm">
            Submit requests to{' '}
            <a href="mailto:privacy@djmexxico.com" className="text-cyan-400 hover:text-cyan-300">
              privacy@djmexxico.com
            </a>
            . We respond within 30 days. For data export, use the &ldquo;Export my data&rdquo; option in your dashboard
            settings.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
          <p className="text-slate-300">
            We use Cloudflare WAF, Row-Level Security on our Neon Postgres database, HTTPS everywhere, and
            encrypted secrets management. In the event of a data breach we will notify affected users within 72 hours
            as required by GDPR.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
          <p className="text-slate-300">
            We use strictly necessary session cookies for authentication (managed by Clerk). We do not use tracking
            cookies. Our analytics (Plausible) are cookieless.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p className="text-slate-300">
            Privacy inquiries:{' '}
            <a href="mailto:privacy@djmexxico.com" className="text-cyan-400 hover:text-cyan-300">
              privacy@djmexxico.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
