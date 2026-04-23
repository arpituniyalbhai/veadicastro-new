import { Helmet } from "react-helmet-async";

type SEOProps = {
  title: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  schema?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
};

const SITE_URL = "https://veadicastro.in";
const DEFAULT_IMAGE = `${SITE_URL}/optimized/social-sharing.webp`;

export const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = "website",
  schema,
  noindex = false,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription
}: SEOProps) => {
  const keywordString = Array.isArray(keywords) ? keywords.join(", ") : keywords;
  const canonicalUrl = url || (typeof window !== "undefined" ? window.location.href : SITE_URL);
  const ogImage = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE;
  const finalOgDescription = ogDescription || description || "Personalized astrological guidance from Veadicastro - AI-powered Vedic astrology platform.";
  const fullTitle = title.includes("Veadicastro") ? title : `${title} | Veadicastro`;
  const finalOgTitle = ogTitle || fullTitle;
  const finalTwitterTitle = twitterTitle || fullTitle;
  const finalTwitterDescription = twitterDescription || finalOgDescription;

  // Default schema for AI Astrology Tool
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Veadicastro",
    "applicationCategory": "AstrologyApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "149",
      "priceCurrency": "INR"
    }
  };

  // Handle both single schema and array of schemas
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [defaultSchema];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywordString && <meta name="keywords" content={keywordString} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0a0a0f" />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Veadicastro" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@veadicastro" />

      {/* Mobile-Friendly Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Veadicastro" />

      {/* Schema.org JSON-LD - Support multiple schemas */}
      {schemas.map((schemaObj, index) => (
        <script 
          key={index}
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObj) }} 
        />
      ))}
    </Helmet>
  );
};

// Helper function to generate FAQ structured data
export const generateFAQSchema = (faqs: Array<{q: string; a: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
};

export default SEO;
