import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Event Lounge',
  description: 'How Event Lounge collects, uses, and protects your personal data.',
};

const LAST_UPDATED = 'July 29, 2026';
const CONTACT_EMAIL = 'support@eventlounge.app';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="text-xl font-bold text-dark-gray dark:text-gray-100">{title}</h2>
    <div className="mt-3 space-y-3 text-medium-gray dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  </section>
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl font-extrabold text-dark-gray dark:text-gray-100 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-medium-gray dark:text-gray-400">
            Last updated {LAST_UPDATED}
          </p>

          <p className="mt-6 text-medium-gray dark:text-gray-400 leading-relaxed">
            Event Lounge is an event discovery and ticket booking platform. This policy explains what
            personal data we collect when you use it, why we collect it, and what control you have
            over it.
          </p>

          <Section title="Information we collect">
            <p>When you create an account we store your full name, email address, and a hashed
              version of your password. We never store your password in readable form.</p>
            <p>When you book an event we store the event, the number of seats, the amount paid, and
              the payment status so we can show you your bookings and confirm your seats.</p>
            <p>If you request a password reset, we store a short-lived reset code and its expiry
              time. The code stops working once it expires or once you use it.</p>
          </Section>

          <Section title="Payments">
            <p>Card payments are processed by Stripe. Your card number, expiry date, and security
              code are entered on Stripe&apos;s own checkout page and are never sent to or stored on
              our servers. We keep only the Stripe session reference and the amount paid, so we can
              match a payment to your booking.</p>
            <p>Stripe processes this data as an independent controller under its own privacy policy.</p>
          </Section>

          <Section title="Email">
            <p>We send transactional email only: booking confirmations and password reset codes. We
              do not sell your address and we do not send marketing email you did not ask for.</p>
          </Section>

          <Section title="How we use your data">
            <p>We use your data to authenticate you, show your bookings, process payments, send
              transactional email, and let event organisers see how many seats are booked. We do not
              sell your personal data to anyone.</p>
          </Section>

          <Section title="Cookies and local storage">
            <p>After you sign in, we store a JSON Web Token in your browser&apos;s local storage to
              keep you signed in. Clearing your browser storage or signing out removes it. We also
              store your light or dark theme preference. We do not use third-party advertising or
              tracking cookies.</p>
          </Section>

          <Section title="Data retention">
            <p>We keep your account and booking history while your account is active. Password reset
              codes are discarded once used or expired. If you delete your account, your bookings are
              deleted along with it.</p>
          </Section>

          <Section title="Your rights">
            <p>You can ask us to show you the personal data we hold about you, correct it, or delete
              your account and its data. Email us and we will action the request.</p>
          </Section>

          <Section title="Security">
            <p>Passwords are hashed with bcrypt. API access is authenticated with signed JSON Web
              Tokens, and traffic between your browser and our servers is encrypted with HTTPS. No
              system is perfectly secure, so please use a strong, unique password.</p>
          </Section>

          <Section title="Children">
            <p>Event Lounge is not intended for children under 13, and we do not knowingly collect
              their personal data.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>If we change this policy we will update the date at the top of this page.</p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy or your data? Email{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary-blue font-medium hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <div className="mt-12 pt-8 border-t border-light-gray dark:border-gray-800">
            <Link
              href="/"
              className="text-sm font-semibold text-primary-blue hover:underline"
            >
              &larr; Back to events
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
