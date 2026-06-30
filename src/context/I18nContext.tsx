import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, Record<Lang, string>>;

const dict: Dict = {
  you: { en: "You", hi: "आप" },
  activity: { en: "ACTIVITY", hi: "गतिविधि" },
  more: { en: "MORE", hi: "और" },
  profile: { en: "Profile", hi: "प्रोफाइल" },
  talkToAstrologer: { en: "Talk to Astrologer", hi: "ज्योतिषी से बात करें" },
  lifeInstruction: { en: "Instruction for 2026", hi: "2026 के लिए निर्देश" },
  yourFuture: { en: "2026 Future", hi: "2026 भविष्य" },
  reportMenu: { en: "Report", hi: "रिपोर्ट" },
  referEarn: { en: "Refer & Earn", hi: "रेफ़र करें और कमाएँ" },
  questionsHistory: { en: "Questions History", hi: "प्रश्न इतिहास" },
  availableReports: { en: "Available Reports", hi: "उपलब्ध रिपोर्ट" },
  credits: { en: "credits", hi: "क्रेडिट्स" },
  open: { en: "Open", hi: "खोलें" },
  reportsHistory: { en: "Reports History", hi: "रिपोर्ट इतिहास" },
    invoice: { en: "Invoice", hi: "इनवॉइस" },
  pricing: { en: "Pricing", hi: "मूल्य" },
  switchLanguage: { en: "Switch Language", hi: "भाषा बदलें" },
  notificationSettings: { en: "Notification Settings", hi: "सूचना सेटिंग्स" },
  rateApp: { en: "Rate Veadicastro", hi: "रेट करें" },
  languageSettings: { en: "Language Settings", hi: "भाषा सेटिंग्स" },
  english: { en: "English", hi: "अंग्रेज़ी" },
  hindi: { en: "Hindi", hi: "हिंदी" },
  otherLanguages: { en: "Other Languages", hi: "अन्य भाषाएँ" },
  save: { en: "Save", hi: "सहेजें" },
  copied: { en: "Copied", hi: "कॉपी हो गया" },
  referralTitle: { en: "Refer & Earn", hi: "रेफ़र करें और कमाएँ" },
  yourLink: { en: "Your Referral Link", hi: "आपका रेफ़रल लिंक" },
  copyLink: { en: "Copy Link", hi: "लिंक कॉपी करें" },
  referralInfo: { en: "Share this link with friends to earn rewards.", hi: "पुरस्कार पाने के लिए इस लिंक को दोस्तों के साथ साझा करें।" },
  questionsEmpty: { en: "Your history is empty", hi: "आपका इतिहास खाली है" },
  askNewQuestion: { en: "Ask a new question", hi: "नया प्रश्न पूछें" },
  reportsTitle: { en: "Detailed Report", hi: "विस्तृत रिपोर्ट" },
  dateRange: { en: "Date Range", hi: "तिथि सीमा" },
  reportType: { en: "Report Type", hi: "रिपोर्ट प्रकार" },
  generateReport: { en: "Generate Detailed Report", hi: "विस्तृत रिपोर्ट बनाएं" },
  buy: { en: "Buy", hi: "खरीदें" },
  askTitle: { en: "Ask your questions to Vedika AI", hi: "अपने प्रश्न वेदिका एआई से पूछें" },
  askPlaceholder: { en: "Ask your question to Vedika...", hi: "अपना प्रश्न वेदिका से पूछें..." },
  promoCheckNow: { en: "Check Now", hi: "अभी देखें" },
  luckyColour: { en: "Lucky Colour", hi: "शुभ रंग" },
  luckyNumber: { en: "Lucky Number", hi: "शुभ अंक" },
  today: { en: "Today", hi: "आज" },
  tomorrow: { en: "Tomorrow", hi: "कल" },
  love: { en: "Love", hi: "प्रेम" },
  self: { en: "Self", hi: "स्व" },
  wealth: { en: "Wealth", hi: "धन" },
  monthlyPredictions: { en: "Monthly Predictions", hi: "मासिक भविष्यवाणी" },
  available: { en: "available", hi: "उपलब्ध" },
  yourReportReady: { en: "A Big Change is Coming in the Next 30 Days...", hi: "अगले 30 दिनों में आपके जीवन में एक बड़ा बदलाव आने वाला है..." },
  promoParagraph: { en: "This is not a normal report - it shows a specific change coming in your life that could be life-altering.", hi: "यह एक सामान्य रिपोर्ट नहीं है - यह आपके जीवन में आने वाले एक विशिष्ट परिवर्तन को दर्शाता है जो जीवन बदलने वाला हो सकता है।" },
  reportWarning: { en: "If this is ignored, it could affect your decisions", hi: "अगर इसे नजरअंदाज किया जाए, तो यह आपके फैसलों को प्रभावित कर सकता है" },
  upgradeTitle: { en: "Want to see more? ✨", hi: "और देखना चाहते हैं? ✨" },
  upgradeDesc: { en: "Unlock Vedika 2.0, just upgrade to any plan and ask what you want!", hi: "वेदिका 2.0 अनलॉक करें, बस कोई भी प्लान अपग्रेड करें और पूछो जो आप चाहते हैं!" },
  novemberLabel: { en: "November 2025", hi: "नवंबर 2025" },
  decemberLabel: { en: "December 2025", hi: "दिसंबर 2025" },
  footerText: { en: " Veadicastro", hi: " वेआडिकास्टरो" },
  reviewsHeading: { en: "What Our Users Say (World-Wide)", hi: "हमारे उपयोगकर्ताओं की राय (दुनिया भर से)" },
  review1: { en: "Veadicastro has been incredibly accurate with my daily predictions. Highly recommended!", hi: "वेआडिकास्टरो की दैनिक भविष्यवाणियाँ बेहद सटीक हैं। अत्यधिक अनुशंसित!" },
  review2: { en: "The AI responses are thoughtful and insightful. Best astrology app I've used.", hi: "एआई के उत्तर विचारशील और ज्ञानवर्धक होते हैं। यह अब तक का सबसे अच्छा ज्योतिष ऐप है।" },
  review3: { en: "Love the detailed monthly predictions. Helps me plan my life better.", hi: "विस्तृत मासिक भविष्यवाणियाँ बहुत पसंद हैं। इससे जीवन की योजना बेहतर बनती है।" },
  review4: { en: "The interface is beautiful and easy to use. Great experience overall!", hi: "इंटरफ़ेस सुंदर और उपयोग में आसान है। समग्र अनुभव शानदार!" },
  sugg1: { en: "Will I overcome self-doubt in my life?", hi: "क्या मैं अपने जीवन में आत्म-संदेह पर विजय पा सकूँगा?" },
  sugg2: { en: "Is this a good time for a job change?", hi: "क्या यह नौकरी बदलने का सही समय है?" },
  sugg3: { en: "How will my finances look this month?", hi: "इस महीने मेरी आर्थिक स्थिति कैसी रहेगी?" },
  sugg4: { en: "What should I focus on for personal growth?", hi: "व्यक्तिगत विकास के लिए मुझे किस पर ध्यान देना चाहिए?" },
  luckyPurple: { en: "Purple", hi: "बैंगनी" },
  luckyGold: { en: "Gold", hi: "स्वर्ण" },
  luckyBlue: { en: "Blue", hi: "नीला" },
  luckySilver: { en: "Silver", hi: "चाँदी" },
  luckyEmerald: { en: "Emerald", hi: "पन्ना" },
  chooseLanguage: { en: "Choose Language", hi: "भाषा चुनें" },
  languageSelectionTitle: { en: "Hey {name}, before going forward please choose language", hi: "हे {name}, आगे बढ़ने से पहले कृपया भाषा चुनें" },
  selectLanguage: { en: "Select your preferred language", hi: "अपनी पसंदीदा भाषा चुनें" },
  continueInLanguage: { en: "Continue in {language}", hi: "{language} में जारी रखें" },
  onboardingTitle: { en: "Create Your Birth Chart", hi: "ऑनबोर्डिंग" },
  onboardingSubtitle: { en: "Just a few quick steps to personalize your experience.", hi: "अपने अनुभव को व्यक्तिगत बनाने के लिए कुछ त्वरित चरण।" },
  birthDetails: { en: "Birth details", hi: "जन्म विवरण" },
  dateOfBirth: { en: "Date of birth", hi: "जन्म तिथि" },
  timeOfBirth: { en: "Time of birth", hi: "जन्म समय" },
  placeOfBirth: { en: "Place of birth", hi: "जन्म स्थान" },
  gender: { en: "Gender", hi: "लिंग" },
  next: { en: "Next", hi: "अगला" },
  back: { en: "Back", hi: "पीछे" },
  welcomeMessage: { en: "Perfect, {name}!", hi: "फिर से हाय, {name}!" },
  onboardingComplete: { en: "Looks like you completed your onboarding. You're just one click away from knowing what the universe has planned for your career, love, health, and finances.", hi: "ऐसा लगता है कि आपने अपना ऑनबोर्डिंग पूरा कर लिया है। आप ब्रह्मांड ने आपके करियर, प्रेम, स्वास्थ्य और वित्त के लिए क्या योजना बनाई है, यह जानने से केवल एक क्लिक दूर हैं।" },
  readMyStars: { en: "Yes, Read My Stars ✨", hi: "हाँ, मेरे तारे पढ़ें ✨" },
  specialOfferExpires: { en: "🛍️ Veadicastro Store launching in", hi: "🛍️ Veadicastro Store launching in" },
  getQuestionsFor: { en: "— 80% OFF on Launch Day  ", hi: "— Launch Day पर 80% OFF · सीमित स्टॉक" },
  vedikaHasMore: { en: "You have used your all questions", hi: "⚠️ you have used your all questions" },
  usedAllFreeQuestions: { en: "We found an important sign in your horoscope", hi: "We Found Something Important in Your Chart" },
  readingNotComplete: { en: "Your reading contains important insights about your life path.\n\nComplete details are available when you upgrade.", hi: "Your reading contains important insights about your life path.\n\nComplete details are available when you upgrade." },
  socialProofCount: { en: "537+ people unlocked their insights in last 24 hours", hi: "537+ people unlocked their insights in last 24 hours" },
  importantSignFound: { en: "We found an important sign in your horoscope", hi: "We Found Something Important in Your Chart" },
  bigChangeComing: { en: "Important insights about your future are ready to view.", hi: "Important insights about your future are ready to view." },
  ignoreWarning: { en: "If you ignore this, you could miss an important opportunity or decision.", hi: "but the full details are hidden in your chart" },
  infoLocked: { en: "Complete information is currently locked", hi: "Complete information is currently locked" },
  offerAvailable: { en: "This offer is only available for the next 10 minutes", hi: "This offer is only available for the next 10 minutes" },
  unlock5Questions: { en: "Unlock 15 Questions - Only 399", hi: "Unlock 15 Questions - Only 99" },
  seeFullTruth: { en: "See the complete truth now", hi: "See the complete truth now" },
  get5MoreQuestions: { en: "You've unlocked 1 insight — the next ones reveal what's actually coming", hi: "You've unlocked 1 insight — the next ones reveal what's actually coming" },
  lessThanChai: { en: "🔒 These insights are locked to protect accuracy", hi: "🔒 These insights are locked to protect accuracy" },
  continueMyReading: { en: "Continue My Reading - Only ₹99", hi: "Continue My Reading - Only 99" },
  maybeLater: { en: "Maybe Later", hi: "Maybe Later" },
  unlockOffer: { en: "Unlock 15 More Questions - Only ₹399", hi: "Unlock 15 More Questions - Only 399" },
  psychoTrigger: { en: "Most users unlock this to understand what's coming next", hi: "Most users unlock this to understand what's coming next" },
  luckyCoral: { en: "Coral", hi: "मूँगा" },
  luckyRose: { en: "Rose", hi: "गुलाबी" },
  luckyAmber: { en: "Amber", hi: "ऐंबर" },
  luckyJade: { en: "Jade", hi: "जेड" },
  luckySapphire: { en: "Sapphire", hi: "नीलम" },
  luckyTurquoise: { en: "Turquoise", hi: "फ़िरोज़ा" },
  luckyIndigo: { en: "Indigo", hi: "जामुनी" },
  pred_today_love: { en: "Surprise your partner...", hi: "अपने साथी को किसी प्यारे इशारे से खुश करें। ईमानदारी से बातचीत आपके रिश्ते को मजबूत करेगी। अविवाहित हैं तो समान मूल्यों वाले नए संबंधों के लिए खुले रहें।" },
  pred_today_self: { en: "Take time for self-care...", hi: "स्व-देखभाल को प्राथमिकता दें। ध्यान, हल्की कसरत और सीखना आपके लिए लाभदायक रहेगा। अंतर्ज्ञान पर भरोसा करें और छोटे लक्ष्यों से शुरुआत करें।" },
  pred_today_wealth: { en: "Investments made today...", hi: "आज किए गए विवेकपूर्ण निर्णय भविष्य में लाभ देंगे। आवेग में खर्च से बचें, आवश्यकताओं को प्राथमिकता दें और सलाहकार से परामर्श करें।" },
  pred_tomorrow_love: { en: "Express your emotions...", hi: "अपनी भावनाएँ खुलकर व्यक्त करें। परिवार और प्रियजनों के साथ बिताया समय संबंधों को गहरा करेगा।" },
  pred_tomorrow_self: { en: "Channel your energy...", hi: "आत्मविश्वास उच्च रहेगा। चुनौतियों को अवसर मानकर आगे बढ़ें और सरल दिनचर्या बनाए रखें।" },
  pred_tomorrow_wealth: { en: "Financial stability is on the horizon...", hi: "वित्तीय स्थिरता की संभावना है। अनावश्यक खर्चों की समीक्षा करें और आय बढ़ाने के लिए सीखने में निवेश करें।" },
  monthly_nov_text: {
    en: "This month brings transformation and growth. Focus on career advancement and personal development. Relationships will flourish with open communication. Financial gains are indicated through strategic planning. Expect chances to collaborate with influential people. Carve out time for skill-building—consistency beats intensity. Prioritize rest to avoid burnout and fortify immunity against seasonal shifts.",
    hi: "यह महीना परिवर्तन और प्रगति लेकर आएगा। करियर उन्नति और व्यक्तिगत विकास पर ध्यान दें। खुली बातचीत से रिश्ते मजबूत होंगे। रणनीतिक योजना से आर्थिक लाभ संभव हैं। मार्गदर्शकों के साथ सहयोग के मौके मिलेंगे। निरंतर अभ्यास से कौशल बढ़ाएँ और थकान से बचने के लिए विश्राम को प्राथमिकता दें।"
  },
  monthly_dec_text: {
    en: "End the year on a high note with celebrations and achievements. Family bonds strengthen, and new opportunities emerge. Stay grounded while pursuing ambitious goals. Prosperity and joy await you. Close pending tasks with grace. Express gratitude to mentors and loved ones. Set clear intentions for the coming year—your clarity becomes your compass.",
    hi: "वर्ष का समापन उत्सव और उपलब्धियों के साथ करें। परिवारिक संबंध मजबूत होंगे और नए अवसर मिलेंगे। बड़े लक्ष्यों के साथ भी संतुलित रहें। समृद्धि और खुशियाँ आपका इंतज़ार कर रही हैं। लंबित कार्यों को शांति से पूरा करें और मार्गदर्शकों व प्रियजनों के प्रति आभार व्यक्त करें। आने वाले वर्ष के लिए स्पष्ट संकल्प तय करें—आपकी स्पष्टता ही आपकी दिशा होगी।"
  },
  astroDetails: { en: "Astro Details", hi: "ज्योतिष विवरण" },
  yourVedicSign: { en: "Your Vedic Sign", hi: "आपका वैदिक राशि" },
  date: { en: "Date", hi: "तारीख" },
  time: { en: "Time", hi: "समय" },
  place: { en: "Place", hi: "स्थान" },
  basedOnAscendant: { en: "Based on your ascendant / lagna", hi: "आपके लग्न / उदय के आधार पर" },
  sunSign: { en: "Sun Sign", hi: "सूर्य राशि" },
  moonSign: { en: "Moon Sign", hi: "चंद्र राशि" },
  venusSign: { en: "Venus Sign", hi: "शुक्र राशि" },
  marsSign: { en: "Mars Sign", hi: "मंगल राशि" },
  ascendant: { en: "Ascendant", hi: "लग्न" },
  insightsUpdated: { en: "Insights are updated daily using your saved details.", hi: "आपके सहेजे गए विवरणों का उपयोग करके अंतर्दृष्टि दैनिक अपडेट की जाती है।" },
};

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    return (stored as Lang) || "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback((key: keyof typeof dict) => dict[key]?.[lang] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
