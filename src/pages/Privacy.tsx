import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="Privacy Policy - Veadicastro"
        description="Veadicastro Privacy Policy. Learn how we collect, use, share, and protect your information when you use our services."
        keywords={["privacy policy", "data protection", "veadicastro privacy", "astrology privacy"]}
        url="https://veadicastro.in/privacy"
      />

      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2, 2026</p>
          <div className="h-px w-full bg-border" />
        </header>

        <article className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          <p>
            This Privacy Policy explains how Veadicastro collects, uses, shares, and
            protects information when you access our website, products, and related
            services.
          </p>

          <h2>1. Scope</h2>
          <p>
            This policy applies to information collected through our platform and related
            communications. Where required by law, additional notices may apply.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following categories of information:</p>
          <ul>
            <li>
              Account information (name, email address, profile details, authentication
              identifiers).
            </li>
            <li>
              Birth and member details (date, time, and place of birth) that you provide
              for chart generation and personalization.
            </li>
            <li>
              Usage information (features used, interactions, pages viewed, and
              approximate session metadata).
            </li>
            <li>
              Device and connection information (IP address, browser type, device
              identifiers, and operating system).
            </li>
            <li>
              Payment information (transaction identifiers and subscription status).
              Payment card details are handled by payment processors.
            </li>
          </ul>

          <h2>3. How We Use Information</h2>
          <p>We use information to:</p>
          <ul>
            <li>Provide and personalize features such as readings, charts, and reports.</li>
            <li>Maintain accounts, authentication, and subscription access.</li>
            <li>Deliver customer support and respond to requests.</li>
            <li>Monitor and improve performance, reliability, and safety.</li>
            <li>Prevent abuse, fraud, and security incidents.</li>
            <li>Comply with applicable laws and enforce our terms.</li>
          </ul>

          <h2>4. Sharing of Information</h2>
          <p>We may share information in limited situations, including:</p>
          <ul>
            <li>
              Service providers that help us operate the service (hosting, analytics,
              customer support tooling, and payment processing).
            </li>
            <li>
              Legal and safety reasons (to comply with law, protect rights, prevent
              fraud, or respond to lawful requests).
            </li>
            <li>
              Business transfers (such as a merger, acquisition, or asset sale).
            </li>
          </ul>
          <p>
            We do not sell your personal information and we do not share it for
            third-party marketing.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain information for as long as needed to provide the service, comply
            with legal obligations, resolve disputes, and enforce agreements. You may
            request deletion of your account; certain records may be retained where
            required by law or for legitimate business purposes.
          </p>

          <h2>6. Security</h2>
          <p>
            We use safeguards designed to protect information. No method of transmission
            or storage is 100 percent secure; you are responsible for maintaining the
            confidentiality of your credentials.
          </p>

          <h2>7. Your Choices and Rights</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul>
            <li>Access and obtain a copy of your information.</li>
            <li>Correct inaccurate information.</li>
            <li>Delete information, subject to certain exceptions.</li>
            <li>Object to or restrict certain processing.</li>
          </ul>
          <p>
            To exercise these rights, contact our support team through the contact page
            with a verifiable request.
          </p>

          <h2>8. Cookies and Similar Technologies</h2>
          <p>
            We may use cookies and similar technologies to keep you signed in, remember
            preferences, and understand product usage. You can control cookies through
            your browser settings.
          </p>

          <h2>9. Third-Party Advertising</h2>
          <p>
            We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to this website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings at <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.google.com/settings/ads</a>.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your
            information, contact our support team at <strong>support@veadicastro.in</strong> or through the <a href="/contact" className="text-blue-600 hover:underline">contact page</a>.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Privacy;
