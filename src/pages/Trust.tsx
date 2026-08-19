import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

const SITE = "Paste Prompts";

export default function Trust() {
  return (
    <Layout>
      <SEO
        title="Trust & Security"
        description={`Security, privacy, and reliability information for ${SITE}.`}
        canonical="/trust"
      />
      <div className="container-tight py-12">
        <article className="prose-invert max-w-none">
          <h1 className="font-display text-4xl font-bold">Trust &amp; Security</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is maintained by {SITE} to answer common security and privacy questions.
          </p>

          <div className="mt-8 space-y-10">
            <section>
              <h2 className="font-display text-xl font-bold">Account security</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Accounts are secured with email-based authentication and session management. We recommend using a strong, unique password and keeping your sign-in credentials private.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Data collection and use</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                We collect only the data needed to operate the marketplace — account details, published content, purchase history, and basic usage analytics. Payment details are handled by our payment provider; we do not store full card numbers. For full details, see our{" "}
                <Link to="/legal/privacy" className="text-primary-glow underline">Privacy Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Platform and hosting</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {SITE} is built on a managed cloud platform that handles infrastructure, database hosting, and authentication services. The platform provider manages underlying security patches, network isolation, and availability. {SITE} is responsible for application-level controls, access policies, and how user data is used within the product.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Content and marketplace safety</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                All prompts submitted for sale are reviewed before going live. We remove content that breaches our{" "}
                <Link to="/legal/terms" className="text-primary-glow underline">Terms of Service</Link>{" "}
                or quality standards. If you encounter infringing or harmful content, you can report it via our takedown process.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Cookies and analytics</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                We use cookies for authentication and analytics. Third-party advertising (including Google AdSense) may also use cookies to serve relevant ads. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Data retention and deletion</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                We keep data for as long as your account is active or as needed for legal and accounting obligations. You can request deletion of your account and associated data by contacting us.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold">Security contact</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                If you have a security concern or vulnerability to report, please get in touch through the contact channels on our website. We review reports and aim to respond promptly.
              </p>
            </section>
          </div>

          <p className="mt-12 rounded-2xl glass p-5 text-sm text-muted-foreground">
            This page is app-owned content and is not an independent certification or audit of {SITE}. Platform capabilities described above reflect the features we currently use, not a guarantee of future availability.
          </p>
        </article>
      </div>
    </Layout>
  );
}
