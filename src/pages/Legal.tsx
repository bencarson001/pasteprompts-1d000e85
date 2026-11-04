import { useParams, Link, Navigate } from "@/lib/router-compat";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { openConsentSettings } from "@/lib/consent";
import { resolveStaticMeta } from "../../seo-meta";

const SITE = "Paste Prompts";
const EFFECTIVE = "7 June 2026";

interface Section { h: string; p: string[] }
interface Doc { title: string; intro: string; sections: Section[]; updated?: string }

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
    updated: "4 November 2026",
    intro: `This policy explains how ${SITE} handles account and website information, including our use of Google Analytics and Google AdSense, and how you can manage your cookie choices.`,
    sections: [
      { h: "1. Who we are", p: [`${SITE} is the data controller for personal data processed through pasteprompts.co.uk. You can reach us at any time via our contact page or at hello@pasteprompts.co.uk.`] },
      { h: "2. What we collect", p: ["Account data (email, display name, handle), content you publish, purchase and payout history, support messages, and basic usage analytics (pages viewed, device type, approximate country). Payment details are processed securely by Stripe — we never see or store full card numbers."] },
      { h: "3. How we use it", p: ["To operate the marketplace, process purchases, pay creators, prevent fraud, provide support, send service emails, and improve the product. Account and purchase information supports the services you request; security information helps protect the service. We ask for consent before loading Google Analytics and Google AdSense."] },
      { h: "4. Cookies we use", p: [
        "Essential cookies keep you signed in, remember your cookie choice and secure checkout. These cannot be switched off.",
        "Before you choose, and when you choose Essential only, our Google Analytics and Google AdSense scripts do not load. Accept all allows Google Analytics and, on eligible guide pages, Google AdSense to load.",
        "You can reopen Cookie settings in the footer or below to change your choice. Withdrawing consent stops future loading; if these scripts have already loaded, the page reloads. It does not erase information already sent to Google. You can remove existing cookies using your browser settings.",
        "Your choice and the time it was made are stored in this browser. A different browser or cleared site data may require a new choice.",
      ] },
      { h: "5. Google Analytics", p: [
        "We use Google Analytics 4 to understand visits, traffic sources and page use. When you accept non-essential cookies, its tags can collect information such as pages visited, browser and device information, referral information and cookie or device identifiers, and send it to Google. Reports help us understand how the site is used; this does not mean all information collected is anonymous.",
        "Read how Google uses information from sites that use its services: https://policies.google.com/technologies/partner-sites",
        "Google's Privacy Policy explains its processing: https://policies.google.com/privacy",
        "Google also provides an Analytics opt-out browser add-on: https://tools.google.com/dlpage/gaoptout",
      ] },
      { h: "6. Google AdSense advertising", p: [
        "We may display third-party adverts supplied by Google. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this and other websites.",
        "Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the internet.",
        "When advertising tags load, Google and its advertising partners may receive information including IP address, browser and device information, page activity and cookie identifiers to deliver and measure advertising. Non-personalised ads may also use cookies; they are not the same as cookie-free advertising.",
        "You can manage personalised advertising through Google My Ad Center: https://myadcenter.google.com",
        "You can review participating third-party advertising opt-outs at https://www.aboutads.info/choices",
        "Google's advertising cookie information is available at https://policies.google.com/technologies/ads",
      ] },
      { h: "7. Service providers", p: ["Services involved in operating the site include Lovable Cloud for hosting and account services, Stripe for payments, Google Analytics for visitor measurement and Google AdSense for advertising. Google and other providers may process information outside the UK or EEA; their policies explain their processing and transfer arrangements."] },
      { h: "8. Privacy requests", p: ["Contact us through our contact page about access, correction, deletion or other privacy requests. You can withdraw non-essential cookie consent in Cookie settings. Depending on the applicable law, you may also have rights to object to or restrict processing and request portability. You can raise concerns with the UK Information Commissioner's Office: https://ico.org.uk"] },
      { h: "9. Retention", p: ["Contact us for the retention periods applicable to account, purchase and support records. Google Analytics retention depends on the account settings; we do not state a fixed period here without verification. Google explains its retention approach at https://policies.google.com/technologies/retention"] },
      { h: "10. Children", p: ["The service is intended for people aged 16 or over."] },
      { h: "11. Changes", p: ["We may update this policy as the service and its providers change. The date above identifies this version."] },
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
  const metadata = resolveStaticMeta(`/legal/${normalizedKey}`);

  return (
    <Layout>
      <SEO
        title={doc.title}
        description={metadata?.description ?? `${doc.title} for ${SITE} — ${doc.intro}`.slice(0, 155)}
        canonical={normalizedKey === "privacy" ? "/privacy" : docType ? `/${docType}` : `/legal/${normalizedKey}`}
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

        <article className="prose-invert max-w-none break-words">
          <h1 className="font-display text-4xl font-bold">{doc.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {doc.updated ?? EFFECTIVE}</p>
          <p className="mt-6 text-lg text-muted-foreground">{doc.intro}</p>
          {normalizedKey === "privacy" && (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button variant="outline" onClick={openConsentSettings}>Cookie settings</Button>
              <Link to="/cookies" className="text-sm text-primary-glow underline">Cookie Policy</Link>
            </div>
          )}

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
