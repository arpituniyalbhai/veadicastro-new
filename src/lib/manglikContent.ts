export const MANGLIK_TITLE = 'Manglik Dosha Calculator — Free Mangal Dosha Check Online | Veadicastro';
export const MANGLIK_DESCRIPTION = 'Check Manglik Dosha using birth date, time and place. See Mars placement from Lagna, Moon and Venus with Swiss Ephemeris, Lahiri ayanamsa and clear explanations.';
export const MANGLIK_URL = 'https://veadicastro.in/manglik-dosha-calculator';
export const MANGLIK_DATE_PUBLISHED = '2026-09-06';
export const MANGLIK_DATE_MODIFIED = '2026-09-06';

// Shared between the visible React page and its server-delivered HTML.
export const manglikSections = [
  {
    title: 'What is Manglik Dosha?',
    text: 'Manglik Dosha, also called Mangal Dosha, Kuja Dosha or Chevvai Dosham, is a traditional Vedic astrology classification based on the placement of Mars. Many practitioners check whether Mars occupies the first, second, fourth, seventh, eighth or twelfth house from the ascendant. This calculator follows that six-house convention and shows its reasoning. The label describes a chart rule rather than a proven forecast of someone’s marriage. It does not measure your character, worth, ability to love or suitability as a partner. Understanding the actual placement is more useful than reacting to an unexplained label.',
    link: '/blog/manglik-dosha-myths-vs-reality', anchor: 'our guide to Manglik Dosha myths and interpretation', after: 'explains why a single placement should never become a verdict on a relationship.',
  },
  {
    title: 'How to use this free Manglik calculator',
    text: 'Enter your birth date, the local time recorded at birth, and your birthplace. Search for the city or town and select the matching location from the suggestions. Check the country and region carefully when several places share a name. The tool uses the selected latitude and longitude, then identifies the local timezone. Submit the form to see the primary Lagna result and the supplementary Moon and Venus checks. You can edit the details and calculate again without signing up. A result belongs to the particular birth details shown with it, so correct any typing mistake before interpreting the answer.',
    link: '/free-kundli-generator', anchor: 'the free Kundli generator', after: 'provides the wider birth chart when you want to explore the other planets as well.',
  },
  {
    title: 'Swiss Ephemeris and Lahiri ayanamsa',
    text: 'The astronomical positions come from the same Swiss Ephemeris calculation engine used by our Kundli tools. The zodiac is sidereal with Lahiri ayanamsa, and the house comparison uses whole signs. First, the local birth time is converted to Universal Time. The engine then calculates the ascendant and planetary longitudes for the selected coordinates. Mars is assigned to a sign, and the number of signs counted from each reference gives its house. The numerical positions are calculated rather than invented by AI. Astrological interpretation is a separate layer and should not be confused with the precision of astronomical coordinates.',
    link: '/ai-kundli-analysis', anchor: 'AI Kundli analysis', after: 'can help explain the broader chart after the underlying positions have been calculated.',
  },
  {
    title: 'Why exact birth time and coordinates matter',
    text: 'Two people born on the same date can have different ascendants because the Earth rotates throughout the day. Latitude and longitude also influence the rising point. A birthplace is therefore more than a text label: it supplies the coordinates needed to calculate Lagna. Near an ascendant boundary, even a small time difference may change the whole-sign house occupied by Mars. This calculator requires a selected location and does not silently substitute a default city. If your birth time is approximate, compare plausible times and treat changes in the result as uncertainty that deserves attention.',
    link: '/astrology-by-date-of-birth', anchor: 'our explanation of astrology by date of birth', after: 'introduces how date, time and place contribute different information to a reading.',
  },
  {
    title: 'Birthplace timezone and daylight-saving time',
    text: 'Enter the local clock time from the birth record, not a time converted to your current country. The selected place supplies an IANA timezone, and the tool resolves the offset for the birth date using the browser’s timezone database. This matters for overseas births, fractional offsets and historical daylight-saving changes. When a clock moves backward, one local time can occur twice; the calculator asks which occurrence is intended. When clocks move forward, some local times never occur and must be corrected. Very old records and local mean time conventions may require an astrologer to review the original record.',
    link: '/talk-to-astrologer', anchor: 'a consultation with an astrologer', after: 'can help you discuss uncertain birth records and the limits of a chart interpretation.',
  },
  {
    title: 'Manglik from Lagna: the primary result',
    text: 'Lagna means the ascendant, or the zodiac sign rising at birth. In this tool it is the primary reference for the Manglik classification. Mars in houses one, two, four, seven, eight or twelve is marked as meeting the selected rule. Mars in houses three, five, six, nine, ten or eleven is marked as not meeting it. The result includes the house number so you can understand why the classification appeared. Some traditions omit the second house or apply additional exceptions. A different result from another calculator may reflect a different convention rather than a different astronomical position.',
    link: '/kundali-matching', anchor: 'the Kundali matching guide', after: 'explains how separate chart factors fit into a broader compatibility assessment.',
  },
  {
    title: 'Why check Mars from the Moon?',
    text: 'Many astrologers also count the position of Mars from the Moon sign. This is a supplementary reference and appears separately in your result. The Moon-based check uses the same six-house list, but starts counting from the sign containing the Moon rather than from the ascendant. It can therefore disagree with the Lagna check without either calculation being mathematically inconsistent. The display keeps both results visible instead of hiding them behind a single score. Neither reference should be treated as a diagnosis of emotional problems or as evidence that a person will cause relationship difficulties.',
    link: '/rashi-calculator-by-date-of-birth', anchor: 'the Rashi calculator', after: 'lets you explore the Moon sign that forms this second reference point.',
  },
  {
    title: 'Why include a Venus-based check?',
    text: 'Venus is another reference used by some practitioners in relationship astrology. We show Mars counted from Venus as an additional check rather than allowing it to overwrite the primary Lagna result. This makes the calculation easier to compare with an astrologer who uses that approach. Three references do not represent three independent predictions, and the number of positive checks is not a percentage chance of marriage problems. They are different ways of examining the same chart. Any interpretation needs to state which approach it uses and acknowledge that different schools give the references different weight.',
    link: '/love-astrology-by-date-of-birth', anchor: 'love astrology by date of birth', after: 'offers further context for relationship themes beyond this single Mars classification.',
  },
  {
    title: 'Full Manglik, partial Manglik and severity',
    text: 'Online services sometimes use labels such as full Manglik, partial Manglik, Anshik Manglik or high Manglik. These terms are not applied consistently across all Vedic traditions. Some refer to the reference point, while others use their own scoring systems or house weights. This tool avoids assigning a universal severity label from a simple count. Instead, it tells you whether each named reference meets the stated rule. This is more transparent when comparing reports. A careful reader can see the exact house involved and discuss the interpretation without assuming that every platform means the same thing by “partial”.',
    link: '/free-kundali-matching', anchor: 'free Kundli matching', after: 'can extend the enquiry to both partners instead of judging a match from one person’s label.',
  },
  {
    title: 'Possible mitigating factors and cancellation rules',
    text: 'Traditional interpretations sometimes consider the dignity of Mars or the influence of Jupiter when reviewing a Manglik indication. This tool identifies Mars in its own signs or exaltation sign and checks whether Jupiter shares its sign or casts a whole-sign fifth, seventh or ninth aspect on it. These are displayed as factors for review. They do not automatically remove the original house classification. Different traditions use different cancellation conditions and require additional context. A single birth chart also cannot establish whether both partners have matching indications. A complete interpretation should explain the particular rule rather than promise a blanket cancellation.',
    link: '/ai-marriage-prediction-by-date-of-birth', anchor: 'marriage prediction by date of birth', after: 'introduces other chart considerations that may be discussed alongside Mars placement.',
  },
  {
    title: 'Does Manglik Dosha disappear after age 28?',
    text: 'Age does not change the position of Mars in the natal chart. Statements that every Manglik indication disappears automatically after a particular birthday should therefore not be treated as calculation rules. Some astrologers associate age with maturity or interpret a placement differently as life experience develops. That is an interpretation, not a change in the original house. Planetary periods are another topic altogether. This calculator reports the natal placement and does not change the classification according to your current age. When asking about timing, distinguish a birth-chart condition from the periods active at a particular stage of life.',
    link: '/dasha-calculator/', anchor: 'the Vimshottari Dasha calculator', after: 'shows planetary periods separately from the natal Manglik check.',
  },
  {
    title: 'Manglik status and marriage compatibility',
    text: 'A Manglik result should never be used as a stand-alone reason to accept or reject someone. Relationship decisions involve consent, communication, trust, shared values and the actual behaviour of both people. Within astrology, practitioners may also examine the seventh house, its lord, Venus, Jupiter, divisional charts and timing. Even a detailed chart comparison does not guarantee the success or failure of a marriage. Use the output as a description of a traditional classification and a starting point for questions. It is not a certificate declaring a person safe, unsafe, compatible or incompatible.',
    link: '/ai-future-spouse-prediction', anchor: 'future spouse interpretation', after: 'explores additional traditional marriage themes while keeping this calculator focused on Mars.',
  },
  {
    title: 'Nakshatra matching is a separate calculation',
    text: 'Manglik checking and Nakshatra-based matching answer different questions. The first compares the sign of Mars with a reference sign. Nakshatra matching uses the birth stars and other factors involved in traditional compatibility systems. One result cannot replace the other, and a favourable score in one system is not proof that every relationship question is settled. Keeping the methods separate makes a report easier to understand. It also helps you notice when two websites are displaying different kinds of information under a general “compatibility” heading. Start with correctly calculated birth data before combining interpretations.',
    link: '/nakshatra-calculator', anchor: 'the Nakshatra calculator', after: 'finds the birth star and pada needed for that separate part of chart study.',
  },
  {
    title: 'How to discuss the result with AI',
    text: 'After calculating, ask focused questions about the reference point, the house occupied by Mars and the convention used. A useful explanation should be able to distinguish the visible numerical result from a traditional interpretation. You can also ask why a Moon-based indication differs from the Lagna result or what a displayed mitigating factor means. Do not assume that an AI automatically has this result unless you provide the relevant details. The chat button opens the site’s signup popup; the calculator itself remains available without an account. Keep personal details limited to what you choose to share.',
    link: '/free-ai-astrologer-chat', anchor: 'the AI astrologer chat page', after: 'explains the separate conversational experience available through Vedika.',
  },
  {
    title: 'Remedies without fear or pressure',
    text: 'Some families include prayer, charitable giving or other traditional practices in their response to a chart reading. These are personal cultural or spiritual choices, not scientifically established ways to change a marriage outcome. A calculator should not pressure you into buying gemstones, rituals or urgent services because a house rule was triggered. Practical relationship skills, thoughtful conversations and appropriate professional support remain valuable regardless of astrology. If you seek traditional guidance, ask what a proposed practice involves, why it is being suggested and whether you are comfortable with it. No result on this page requires a purchase.',
    link: '/ai-pandit', anchor: 'AI Pandit', after: 'is another place to explore traditional practices and ask questions about their context.',
  },
  {
    title: 'How accurate is a Manglik Dosha calculator?',
    text: 'There are two separate questions: whether the astronomical positions and house comparison are calculated correctly, and whether the interpretation predicts real events. Accurate input, a stated ayanamsa, a consistent house method and correct timezone handling support the first. They do not establish the second. Astrology is a traditional belief system and is not scientifically established as a method for predicting marriage outcomes. If reports differ, compare the birth details, timezone, zodiac and house rules before comparing labels. This tool shows its reference checks and selected location to make that comparison easier and to keep uncertainty visible.',
    link: '/blog/is-ai-astrology-accurate', anchor: 'our article on AI astrology accuracy', after: 'provides a starting point for discussing the difference between calculations and interpretations.',
  },
];

export const manglikFaqs = [
  ['What is Manglik Dosha or Mangal Dosha?', 'Manglik Dosha, also called Mangal Dosha or Kuja Dosha, is a traditional Vedic astrology classification based on the house occupied by Mars. In this calculator, the primary check uses houses 1, 2, 4, 7, 8 and 12 from Lagna.'],
  ['How is Manglik Dosha calculated?', 'The calculator first uses your birth date, local birth time and selected birthplace to calculate a sidereal chart. It then counts the sign occupied by Mars from Lagna, Moon and Venus, showing each reference separately.'],
  ['Can Manglik Dosha be cancelled?', 'Some traditions use cancellation or mitigating rules. This calculator flags selected factors for review, but does not call any placement automatically cancelled because rules and interpretation vary across traditions.'],
  ['Is Manglik Dosha real?', 'Manglik Dosha is a traditional Vedic astrology concept based on Mars placement. It is not scientifically established as a method for predicting marriage outcomes, and it should not be used as a verdict on a person or relationship.'],
  ['How do I know if I am Manglik?', 'Enter your birth date, local birth time and selected birthplace. The primary result checks whether Mars occupies houses 1, 2, 4, 7, 8 or 12 from Lagna. Moon and Venus checks are displayed separately.'],
  ['Is the Manglik Dosha calculator free?', 'Yes. You can calculate and review the result without signing up. Chat to AI Astrologer opens the separate signup popup.'],
  ['Can I check Manglik Dosha with only a birth date?', 'A reliable Lagna-based check requires birth time and birthplace as well. If your time is unknown, do not enter an invented time and treat the result as certain.'],
  ['Why do two calculators show different Manglik results?', 'They may use different birth times, timezones, ayanamsas, reference points or rules. This tool uses Lahiri sidereal positions, whole signs and the six-house convention including the second house.'],
  ['Is Moon-based Manglik the same as Lagna-based Manglik?', 'No. Each counts Mars from a different sign. The results can differ, so the calculator identifies each reference explicitly.'],
  ['Does the tool calculate cancellation factors?', 'It flags Mars in its own or exaltation sign and selected Jupiter relationships as possible mitigating factors. These do not constitute an automatic cancellation or a complete compatibility assessment.'],
  ['Can a Manglik marry a non-Manglik?', 'The label should not decide a marriage. Consent, shared values, communication and the relationship itself matter. Astrological traditions also consider more than one placement.'],
  ['Does Manglik Dosha end after age 28?', 'Your natal Mars placement does not change at age 28. This calculator does not automatically remove a natal indication based on age.'],
  ['Does this work for births outside India?', 'Yes, when the selected location includes a supported timezone. It uses the birthplace timezone for the birth date rather than your current device timezone. Repeated daylight-saving times require choosing the correct occurrence.'],
  ['Are full and partial Manglik labels universal?', 'No. Their meaning varies between traditions and services. This tool gives separate Lagna, Moon and Venus checks rather than assigning an unexplained severity score.'],
];
