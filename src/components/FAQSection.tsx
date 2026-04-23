import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Which is the best Vedic Astrology AI tool in India?",
    a: "Veadicastro is India's most accurate Vedic Astrology AI platform. It uses the Lahiri sidereal system to calculate your exact Sun sign, Moon sign, Lagna, and Nakshatra from your date of birth — then lets you chat with an AI astrologer with plans starting from ₹149/month.",
  },
  {
    q: "What are the pricing plans for AI astrology on Veadicastro?",
    a: "Veadicastro offers AI astrology plans starting from ₹149/month. Enter your date of birth, time, and place to generate your Kundli and ask questions — signup required to access premium features.",
  },
  {
    q: "How accurate is AI powered astrology?",
    a: "Veadicastro's AI powered astrology uses real-time ephemeris data with arc-second precision for planetary calculations — making it more accurate than many traditional methods. It strictly follows the Vedic sidereal system, not Western tropical astrology.",
  },
  {
    q: "What is the most accurate AI astrology website in India?",
    a: "Veadicastro is rated the most accurate AI astrology website in India. It calculates your complete Vedic birth chart and provides personalized predictions through conversational AI — available in Hindi and English with plans from ₹149/month.",
  },
  {
    q: "Can I use AI astrology chat in Hindi?",
    a: "Yes. Veadicastro's AI astrology chat works in both Hindi and English. Select your language preference before generating your Kundli and the AI astrologer Vedika will respond in your chosen language.",
  },
  {
    q: "Is Veadicastro free?",
    a: "We offer daily, monthly, and weekly predictions free along with 2 free AI chat questions. We charge for additional questions and detailed reports. Reports start from 199 and 5 questions pack costs 149.",
  },
  {
    q: "How accurate are the readings?",
    a: "Veadicastro combines classical Vedic astrology with high-precision ephemeris data and AI-powered analysis. Our accuracy comes from cross-checking multiple signals: birth chart (D1), divisional charts (D9, D10), Mahadasha periods, and current transits. We validate insights across all these layers before presenting them. Accuracy improves significantly with precise birth details (exact time, date, and place). Even without exact birth time, we can provide meaningful guidance using alternative methods.",
  },
  {
    q: "Do I need my exact birth time?",
    a: "Exact birth time is highly recommended for the most accurate Lagna (Ascendant) and house placements, which are crucial for personalized readings. If you don't have your exact time, we offer several alternatives: sunrise charts, rectification hints based on life events, or generalized guidance using your date and place. Many users find value even with approximate times, though precision always yields better results.",
  },
  {
    q: "Is this suitable for business or personal guidance?",
    a: "Absolutely. Veadicastro serves both personal and professional needs. For personal life, you can explore relationships, health, spiritual growth, and life direction. For business, you can analyze timing for launches, partnerships, investments, and career moves. Our system tailors insights to your specific questions and life context, making it versatile for any area of your life.",
  },
  {
    q: "Can I get compatibility insights?",
    a: "Yes. Our compatibility feature lets you compare two birth charts to understand relationship dynamics. We analyze synastry (how planets interact between charts), composite charts, and dasha compatibility. You'll see strengths, challenges, and timing windows for key relationship milestones. This works for romantic partners, business partners, family members, or any meaningful relationship.",
  },
  {
    q: "What is a Mahadasha and why does it matter?",
    a: "Mahadasha is a major planetary period in Vedic astrology that lasts 6–20 years depending on the planet. Each Mahadasha brings distinct themes and opportunities. Understanding your current and upcoming Mahadashas helps you anticipate life phases, make informed decisions, and align with cosmic timing. Veadicastro maps your entire Mahadasha timeline so you can plan ahead.",
  },
  // NEW 10 STRATEGIC QUESTIONS
  {
    q: "What is today's horoscope and how to read it?",
    a: "Today's horoscope is a daily prediction based on current planetary transits and your rashi (zodiac sign). At Veadicastro, we provide AI-powered daily horoscopes for all 12 rashis with insights for career, love, health, and wealth. Simply find your rashi and read the guidance for the day. Our predictions are updated every morning at 12 AM IST using real-time astronomical data.",
  },
  {
    q: "How to get daily horoscope predictions?",
    a: "Getting daily horoscope predictions is easy at Veadicastro. Visit our horoscope page, select your rashi from the 12 zodiac signs, and read your personalized prediction. Plans start from ₹149/month for premium features. We also provide Hindi horoscopes (राशिफल) for Indian users. Each prediction includes specific guidance for different life areas and is updated daily based on Vedic astrology principles.",
  },
  {
    q: "Can AI astrologer predict my future accurately?",
    a: "Our AI astrologer combines traditional Vedic astrology with advanced machine learning to provide highly accurate predictions. The system analyzes your birth chart, current planetary positions, and historical patterns to generate insights. While no prediction system is 100% accurate, our users report high satisfaction rates. The accuracy improves with precise birth details and specific questions.",
  },
  {
    q: "What is the difference between Vedic and Western astrology?",
    a: "Vedic astrology (Jyotish) uses the sidereal zodiac, which accounts for Earth's precession, while Western astrology uses the tropical zodiac. Vedic astrology is considered more precise for predictions and includes detailed systems like Dashas and Nakshatras. Veadicastro follows authentic Vedic principles with Lahiri ayanamsa for accurate calculations.",
  },
  {
    q: "How to generate my Kundli online?",
    a: "Generate your Kundli online at Veadicastro by entering your birth date, time, and location. Our system calculates your complete Vedic birth chart including Lagna, Moon sign, Nakshatra, and planetary positions. The process takes seconds and provides detailed insights about your personality, life patterns, and future predictions. Premium plans start from ₹149/month.",
  },
  {
    q: "What are the 12 Rashis in Vedic astrology?",
    a: "The 12 Rashis (zodiac signs) in Vedic astrology are: Mesha (Aries), Vrishabh (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrishchika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), and Meena (Pisces). Each rashi has unique characteristics and is ruled by specific planets.",
  },
  {
    q: "Can I chat with AI astrologer for marriage predictions?",
    a: "Yes, you can chat with our AI astrologer for detailed marriage predictions. Generate your Kundli and ask about marriage timing, compatibility with partner, favorable periods for wedding, and relationship guidance. The AI analyzes both charts for comprehensive insights including Guna Milan, Manglik dosha, and long-term compatibility factors.",
  },
  {
    q: "How accurate are online horoscope predictions?",
    a: "Online horoscope predictions at Veadicastro are highly accurate because we use real-time astronomical data and authentic Vedic calculations. Our system processes multiple astrological parameters including planetary positions, aspects, and transits. Accuracy depends on birth data precision - exact time, date, and location yield the most reliable predictions.",
  },
  {
    q: "What is Nakshatra and why is it important?",
    a: "Nakshatra is a lunar mansion in Vedic astrology, representing the Moon's position in 27 sections of the zodiac. Each Nakshatra has unique characteristics and influences personality traits, life events, and compatibility. Understanding your Nakshatra provides deeper insights into your nature, career path, and relationships. Veadicastro calculates your birth Nakshatra automatically.",
  },
  {
    q: "Can I get career guidance from AI astrology?",
    a: "Absolutely! Our AI astrologer provides detailed career guidance based on your birth chart. Ask about suitable career paths, job changes, business startups, promotion timing, and professional growth. The system analyzes your 10th house, planetary periods, and current transits to give personalized career recommendations aligned with your cosmic blueprint.",
  },
];

const FAQSection = () => {
  return (
    <section
      id="faq"
      className="relative py-20 px-4"
    >
      <div className="container mx-auto">
        <div className="grid gap-10 lg:grid-cols-12">

          {/* Left big title — unchanged */}
          <div className="lg:col-span-5">
            <h2 className="font-sans text-4xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-normal">
              <span className="block">Frequently</span>
              <span className="block md:inline bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent"> Asked Questions</span>
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md">
              Answers to common questions about Veadicastro's features, guidance, and reports.
            </p>
          </div>

          {/* Right list — with schema markup */}
          <div className="lg:col-span-7">
            <div itemScope itemType="https://schema.org/FAQPage">
              <Accordion type="multiple" defaultValue={["item-0", "item-1", "item-2"]} className="divide-y divide-border/60 rounded-xl bg-card/30 backdrop-blur-sm border border-border/60">
                {faqs.map((item, idx) => (
                  <div key={idx} itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
                    <AccordionItem
                      value={`item-${idx}`}
                      className="px-4 md:px-6"
                    >
                      <AccordionTrigger
                        className="py-5 text-left text-base md:text-lg no-underline hover:no-underline"
                        itemProp="name"
                      >
                        {item.q}
                      </AccordionTrigger>

                      <AccordionContent
                        className="text-muted-foreground md:text-base"
                      >
                        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                          <span itemProp="text">{item.a}</span>
                        </div>
                      </AccordionContent>

                    </AccordionItem>
                  </div>
                ))}
              </Accordion>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQSection;