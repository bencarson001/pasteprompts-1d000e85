import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const SITE = "Paste Prompts";
const EFFECTIVE = "7 June 2026";

interface Section { h: string; p: string[] }
interface Doc { title: string; intro: string; sections: Section[] }

const DOCS: Record<string, Doc> = {
  terms: {
    title: "Terms of Service",
    intro: `These terms govern your use of ${SITE} ("we", "us"). By creating an account or using the marketplace you agree to them.`,
    sections: [
      { h: "1. Your account", p: ["You must be at least 16 to use the service. You are responsible for activity under your account and for keeping your credentials secure."] },
      { h: "2. Buying prompts", p: ["When you buy a prompt you receive a non-exclusive, perpetual licence to use it for personal and commercial projects. You may not resell, redistribute or relist a purchased prompt as your own."] },
      { h: "3. Selling prompts", p: ["Creators retain ownership of prompts they publish and grant us a licence to display and sell them. Every submission is reviewed before going live. We may remove content that breaches these terms.", "Creators receive their sale proceeds less a platform commission (currently 20%)."] },
      { h: "4. Acceptable use", p: ["You may not upload content that is illegal, infringing, hateful, or designed to deceive. We may suspend accounts that abuse the platform."] },
      { h: "5. Liability", p: ["The service is provided “as is”. To the fullest extent permitted by law we are not liable for indirect or consequential losses arising from use of the marketplace."] },
      { h: "6. Changes", p: ["We may update these terms; material changes will be notified in-app. Continued use constitutes acceptance."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: `This policy explains what data ${SITE} collects, how we use it, and the choices you have. We comply with UK GDPR and the EU GDPR. Effective ${EFFECTIVE}.`,
    sections: [
      { h: "1. Who we are", p: [`${SITE} is the data controller for personal data processed through pasteprompts.co.uk. You can reach us at any time via our contact page or at hello@pasteprompts.co.uk.`] },
      { h: "2. What we collect", p: ["Account data (email, display name, handle), content you publish, purchase and payout history, support messages, and basic usage analytics (pages viewed, device type, approximate country). Payment details are processed securely by Stripe — we never see or store full card numbers."] },
      { h: "3. How we use it", p: ["To operate the marketplace, process purchases, pay creators, prevent fraud, provide support, send service emails, and improve the product. Our lawful bases are contract (running your account and purchases), legitimate interests (security, analytics, product improvement) and consent (advertising and non-essential cookies)."] },
      { h: "4. Cookies we use", p: [
        "Essential cookies keep you signed in, remember your cookie choice and secure checkout. These cannot be switched off.",
        "Analytics cookies (Google Analytics 4) tell us anonymously which pages are useful. IP addresses are truncated and we do not use analytics data to identify individuals.",
        "Advertising cookies are only loaded on our long-form guide articles. You can accept or decline non-essential cookies using the banner shown on your first visit, and change your mind at any time by clearing site data in your browser.",
      ] },
      { h: "5. Third-party advertising (Google AdSense)", p: [
        "We may display third-party adverts supplied by Google. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this and other websites.",
        "Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the internet.",
        "Users may opt out of personalised advertising by visiting Google Ads Settings (https://adssettings.google.com), or opt out of third-party vendor cookies for personalised advertising at https://aboutads.info/choices. You can review how Google uses data at https://policies.google.com/technologies/partner-sites.",
      ] },
      { h: "6. Sharing", p: ["We share data only with processors that help us run the service — hosting and database (Lovable Cloud/Supabase), payments (Stripe), analytics (Google Analytics) and advertising (Google AdSense) — under appropriate data-processing agreements. We never sell your personal data. Some providers are outside the UK/EEA; transfers rely on Standard Contractual Clauses or an adequacy decision."] },
      { h: "7. Your rights", p: ["You can access, correct, export, restrict or delete your data, withdraw consent, and object to certain processing. Contact us to exercise these rights; we respond within one month. You also have the right to complain to the UK Information Commissioner's Office (https://ico.org.uk)."] },
      { h: "8. Retention", p: ["We keep account data while your account is active, and transaction records for six years to meet legal and accounting obligations. Analytics data is retained for 14 months."] },
      { h: "9. Children", p: ["The service is not intended for anyone under 16 and we do not knowingly collect data from children."] },
      { h: "10. Changes", p: ["We update this policy when our processing changes. Material changes are notified in-app; the effective date above always reflects the current version."] },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    intro: `The information published on ${SITE} — including guides, glossary entries and prompt descriptions — is provided for general information and educational purposes only.`,
    sections: [
      { h: "1. No professional advice", p: ["Nothing on this site constitutes legal, financial, medical or other professional advice. AI models can produce inaccurate or outdated output, so always review anything generated from a prompt before relying on it, and seek qualified advice where the stakes matter."] },
      { h: "2. No guaranteed results", p: ["Prompts are creative tools. Results vary by model, model version, wording and context, and we make no guarantee about the quality, accuracy or commercial performance of any output. Any earnings figures mentioned for creators are illustrative, not a promise of income."] },
      { h: "3. Third-party products", p: ["ChatGPT, Claude, Gemini, Midjourney, DALL·E and Sora are products of their respective owners. We are not affiliated with, endorsed by, or sponsored by OpenAI, Anthropic, Google or Midjourney. Trademarks are used descriptively to indicate compatibility."] },
      { h: "4. External links", p: ["We link to external sites we believe are useful, but we do not control them and are not responsible for their content, accuracy or privacy practices."] },
      { h: "5. Advertising", p: ["Some pages display third-party adverts. Adverts are clearly labelled and their presence is not an endorsement of the advertised product or service."] },
      { h: "6. Limitation", p: ["To the fullest extent permitted by law we accept no liability for any loss arising from use of, or reliance on, information published on this site."] },
    ],
  },
  refunds: {
    title: "Refund Policy",
    intro: `Because prompts are digital products delivered instantly, our refund policy is designed to be fair to both buyers and creators.`,
    sections: [
      { h: "1. Digital delivery", p: ["Prompt content is revealed immediately after purchase, so purchases are generally final."] },
      { h: "2. When we refund", p: ["We issue refunds if a prompt is materially not as described, is broken, or was charged in error. Contact us within 14 days of purchase."] },
      { h: "3. How to request", p: ["Email our support with your order details and the reason at hello@pasteprompts.co.uk. We aim to respond within 3 business days."] },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    intro: `This Cookie Policy explains how ${SITE} uses cookies and similar tracking technologies when you visit our website pasteprompts.co.uk in accordance with UK and EU GDPR requirements. Effective ${EFFECTIVE}.`,
    sections: [
      { h: "1. What are cookies?", p: ["Cookies are small text files placed on your computer or mobile device when you access websites. They are widely used to make websites work efficiently and provide usage information to site operators."] },
      { h: "2. Essential cookies", p: ["These cookies are strictly necessary for the marketplace to function. They enable core features such as user authentication, session security, fraud prevention, and shopping cart persistence. Essential cookies cannot be turned off in our systems."] },
      { h: "3. Analytics cookies", p: ["We use Google Analytics (GA4) with IP anonymization to understand aggregated visitor trends, traffic sources, popular prompts, and page performance. These cookies help us improve site navigation and content quality without identifying individuals."] },
      { h: "4. Advertising cookies & Google AdSense", p: ["We display third-party advertisements served by Google AdSense on eligible content pages. Google and its ad partners use cookies to serve personalized or contextual advertisements based on your visits to this and other websites across the internet.", "You can manage personalized advertising preferences anytime at Google Ads Settings (https://adssettings.google.com) or through https://aboutads.info/choices."] },
      { h: "5. Managing cookie preferences", p: ["You can accept or decline non-essential cookies using the Cookie Consent banner displayed on your visit, or by adjusting your browser cookie settings. If you block all cookies, some features of the marketplace may not function properly."] },
    ],
  },
  creators: {
    title: "Creator Agreement",
    intro: `This agreement applies to anyone publishing prompts for sale on ${SITE}.`,
    sections: [
      { h: "1. Ownership & originality", p: ["You confirm every prompt you publish is your own original work and does not infringe anyone’s rights."] },
      { h: "2. Commission & payouts", p: ["We retain a platform commission on each sale (up to 90% paid to verified creators). Your earnings accrue to your account and are paid out automatically via Stripe Connect."] },
      { h: "3. Review & moderation", p: ["All submissions are reviewed before going live. We may reject or remove prompts that breach our policies or quality bar."] },
      { h: "4. Conduct", p: ["No spam, plagiarism, misleading claims, or attempts to manipulate ratings. Violations may result in removal and account suspension."] },
    ],
  },
  "content-policy": {
    title: "Content & Editorial Policy",
    intro: `Our editorial standards and acceptable content guidelines ensure Paste Prompts remains a trusted, high-utility marketplace and educational resource.`,
    sections: [
      { h: "1. Editorial integrity & originality", p: ["All guides, tutorials, and educational content on Paste Prompts are crafted by verified subject matter experts. We do not publish auto-generated thin articles or duplicate content. Every guide includes tested prompt examples, step-by-step instructions, and actionable takeaways."] },
      { h: "2. Prohibited prompt categories", p: ["We enforce a strict zero-tolerance policy against malicious, deceptive, or harmful prompt submissions. Prohibited categories include malware/exploit generation, phishing/fraud templates, explicit adult content, hate speech, harassment, academic dishonesty, and unlicensed copyrighted works."] },
      { h: "3. High-stakes topics & YMYL compliance", p: ["Prompts and content related to Your Money or Your Life (finance, medical diagnoses, legal proceedings) must clearly state their illustrative nature. We prohibit prompts that claim to replace qualified financial, medical, or legal professionals."] },
      { h: "4. Moderation & takedown requests", p: ["Every marketplace submission is screened prior to public listing. If you identify content that violates copyright or our editorial guidelines, submit a takedown notice to hello@pasteprompts.co.uk and our team will investigate within 24 hours."] },
    ],
  },
};

const SLUG_ALIASES: Record<string, string> = {
  "privacy-policy": "privacy",
  "privacy": "privacy",
  "terms-of-service": "terms",
  "terms-and-conditions": "terms",
  "terms": "terms",
  "cookie-policy": "cookies",
  "cookies": "cookies",
  "disclaimer": "disclaimer",
  "refund-policy": "refunds",
  "refunds": "refunds",
  "creator-agreement": "creators",
  "creators": "creators",
  "content-policy": "content-policy",
  "editorial-policy": "content-policy",
  "editorial-standards": "content-policy",
};

export default function Legal({ docType }: { docType?: string }) {
  const { slug: rawSlug } = useParams();
  const targetKey = docType || rawSlug || "terms";
  const normalizedKey = SLUG_ALIASES[targetKey.toLowerCase()] || targetKey;
  const doc = DOCS[normalizedKey];
  if (!doc) return <Navigate to="/legal/terms" replace />;

  return (
    <Layout>
      <SEO
        title={doc.title}
        description={`${doc.title} for ${SITE} — ${doc.intro}`.slice(0, 155)}
        canonical={docType ? `/${docType}` : `/legal/${normalizedKey}`}
      />
      <div className="container-tight py-12">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Legal & Policies", to: "/legal/terms" },
            { name: doc.title },
          ]}
        />

        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          {Object.entries(DOCS).map(([key, d]) => (
            <Link
              key={key}
              to={`/legal/${key}`}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                key === normalizedKey
                  ? "bg-gradient-primary text-primary-foreground font-medium"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.title}
            </Link>
          ))}
        </nav>

        <article className="prose-invert max-w-none">
          <h1 className="font-display text-4xl font-bold">{doc.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {EFFECTIVE}</p>
          <p className="mt-6 text-lg text-muted-foreground">{doc.intro}</p>

          <div className="mt-8 space-y-8">
            {doc.sections.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-xl font-bold">{s.h}</h2>
                {s.p.map((para, i) => (
                  <p key={i} className="mt-2 leading-relaxed text-muted-foreground">
                    {para.startsWith("http") || para.includes("https://") ? (
                      para.split(/(https:\/\/[^\s)]+)/g).map((part, pIdx) =>
                        part.startsWith("https://") ? (
                          <a
                            key={pIdx}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-glow underline hover:opacity-80"
                          >
                            {part}
                          </a>
                        ) : (
                          part
                        )
                      )
                    ) : (
                      para
                    )}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <p className="mt-12 rounded-2xl glass p-5 text-sm text-muted-foreground">
            Questions about this document? <Link to="/contact" className="text-primary-glow underline">Get in touch with our team</Link>.
          </p>
        </article>
      </div>
    </Layout>
  );
}
