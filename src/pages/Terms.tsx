import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="Terms & Conditions - Veadicastro"
        description="Read Veadicastro's Terms & Conditions. Learn about account rules, acceptable use, subscriptions, intellectual property, and limitations."
        keywords={["terms and conditions", "veadicastro terms", "astrology terms", "service terms"]}
        url="https://veadicastro.in/terms"
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: April 2, 2026</p>
          <div className="h-px w-full bg-border" />
        </header>

        <article className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          <p>
            These Terms and Conditions govern your access to and use of the Veadicastro
            platform, including our website, products, and related services. By using the
            service, you agree to these terms.
          </p>

          <h2>1. Eligibility and Account Registration</h2>
          <p>
            You must provide accurate information when creating an account and keep your
            account details up to date. You are responsible for maintaining the
            confidentiality of your credentials and for activity under your account.
          </p>

          <h2>2. Acceptable Use</h2>
          <p>You agree not to misuse the service. This includes:</p>
          <ul>
            <li>Attempting to gain unauthorized access to systems or data.</li>
            <li>Interfering with the availability, security, or performance of the service.</li>
            <li>Uploading or distributing malicious code.</li>
            <li>Using the service in violation of applicable law.</li>
          </ul>

          <h2>3. Service Nature and Disclaimers</h2>
          <p>
            The service provides astrology-related content and tools. Results may vary
            depending on the data you provide and other factors. The service is provided
            on an "as is" and "as available" basis.
          </p>

          <h2>4. Subscriptions, Billing, and Refunds</h2>
          <p>
            Paid plans may renew automatically unless canceled before the renewal date.
            Fees, billing cycles, and plan features are presented at checkout. Refunds
            are governed by our Refund Policy.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The platform, including its design, software, content, and trademarks, is
            owned by Veadicastro or its licensors and is protected by applicable laws.
            You may not copy, modify, distribute, or reverse engineer the service except
            as permitted by law.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Veadicastro will not be liable for
            indirect, incidental, special, consequential, or punitive damages, or any
            loss of profits or revenues.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may suspend or terminate access if you violate these terms or if required
            to protect the service, users, or third parties.
          </p>

          <h2>8. Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service
            after changes become effective constitutes acceptance of the updated terms.
          </p>

          <h2>9. Contact</h2>
          <p>
            If you have questions about these terms, contact our support team at <strong>support@veadicastro.in</strong> or through the <a href="/contact" className="text-blue-600 hover:underline">contact page</a>.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Terms;
