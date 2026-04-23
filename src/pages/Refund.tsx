import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";

const Refund = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="Refund Policy - Veadicastro"
        description="Veadicastro Refund Policy. Learn about eligibility, exclusions, timelines, and the refund request process."
        keywords={["refund policy", "astrology refund", "veadicastro refund", "money back"]}
        url="https://veadicastro.in/refund"
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2, 2026</p>
          <div className="h-px w-full bg-border" />
        </header>

        <article className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          <p>
            This Refund Policy explains when refunds may be issued and how to request a
            refund for purchases made on Veadicastro.
          </p>

          <h2>1. Eligibility</h2>
          <p>A refund may be considered if:</p>
          <ul>
            <li>The request is submitted within the applicable window shown at purchase.</li>
            <li>A billing error occurred, such as duplicate or incorrect charges.</li>
            <li>A verified technical issue prevented reasonable access to a paid feature.</li>
          </ul>

          <h2>2. Non-Refundable Items</h2>
          <p>Unless required by law, refunds are generally not provided for:</p>
          <ul>
            <li>Personalized readings, generated reports, or delivered digital content.</li>
            <li>Consumed credits, tokens, or usage-based entitlements.</li>
            <li>Partial subscription periods after access has been provided.</li>
          </ul>

          <h2>3. Subscriptions and Cancellations</h2>
          <p>
            You can cancel a subscription at any time. Cancellation takes effect at the
            end of the current billing period. Access typically remains available until
            the end of the paid term.
          </p>

          <h2>4. How to Request a Refund</h2>
          <p>To request a refund, contact support and include:</p>
          <ul>
            <li>Your account email and order or transaction identifier.</li>
            <li>A clear description of the issue and when it occurred.</li>
            <li>Any relevant screenshots or error messages, if applicable.</li>
          </ul>

          <h2>5. Review and Processing</h2>
          <p>
            If approved, refunds are issued to the original payment method. Processing
            times vary by payment provider and may take several business days.
          </p>

          <h2>6. Contact</h2>
          <p>
            For refund questions or requests, contact our support team at <strong>support@veadicastro.in</strong> or through the <a href="/contact" className="text-blue-600 hover:underline">contact page</a>.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Refund;
