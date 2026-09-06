import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, MapPin, MessageCircle, Sparkles, RotateCcw, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/context/AuthContext';
import { getPlanetaryData } from '@/lib/astroCalc';
import { analyseManglik, resolveBirthTime } from '@/lib/manglik';
import { MANGLIK_TITLE, MANGLIK_DESCRIPTION, MANGLIK_URL, MANGLIK_DATE_PUBLISHED, MANGLIK_DATE_MODIFIED, manglikSections, manglikFaqs } from '@/lib/manglikContent';

// Same OpenCage service and existing browser key as FreeKundliGenerator.
// Keep annotations enabled to obtain the location's IANA timezone.
const OPENCAGE_KEY = '91ab8792290d414b92590c9d4cc0793c';
type Place = { label: string; lat: number; lon: number; zone: string };
type GeoResult = { formatted?: string; geometry?: { lat?: number; lng?: number }; annotations?: { timezone?: { name?: string } } };
type BirthMoment = ReturnType<typeof resolveBirthTime>[number];
type Result = ReturnType<typeof analyseManglik> & { place: Place; date: string; time: string; offset: number };
const fieldClass = 'mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-base text-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 [color-scheme:dark]';
const offsetLabel = (offset: number) => `UTC${offset >= 0 ? '+' : ''}${offset}`;

export default function ManglikDoshaCalculator() {
  const { setAuthOpen } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigation = [
    { label: 'Home', to: '/' },
    { label: 'Kundli Generator', to: '/free-kundli-generator' },
    { label: 'Kundli Matching', to: '/free-kundali-matching' },
    { label: 'Talk to Astrologer', to: '/talk-to-astrologer' },
  ];
  const openChat = () => { setMenuOpen(false); setAuthOpen(true); };
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [moments, setMoments] = useState<BirthMoment[]>([]);
  const [occurrence, setOccurrence] = useState('');
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (place || query.trim().length < 2) return;
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchMessage('');
      try {
        const params = new URLSearchParams({ q: query.trim(), key: OPENCAGE_KEY, limit: '5', no_record: '1' });
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Place search is temporarily unavailable. Please try again shortly.');
        const data = await response.json() as { results?: GeoResult[] };
        const found = (data.results || []).flatMap(item => {
          const lat = item.geometry?.lat;
          const lon = item.geometry?.lng;
          const zone = item.annotations?.timezone?.name;
          if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !zone || !item.formatted) return [];
          try { new Intl.DateTimeFormat('en', { timeZone: zone }); } catch { return []; }
          return [{ label: item.formatted, lat, lon, zone }];
        });
        if (active) {
          setSuggestions(found);
          if (!found.length) setSearchMessage('No supported location found. Try the nearest town or include the country.');
        }
      } catch (e) {
        if (active) setSearchMessage(e instanceof Error ? e.message : 'Could not search places. Please try again.');
      } finally { if (active) setSearching(false); }
    }, 450);
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [query, place]);

  useEffect(() => { if (result) resultRef.current?.focus(); }, [result]);
  const invalidate = () => { setResult(null); setError(''); setMoments([]); setOccurrence(''); };
  const calculate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!place) { setError('Select your birthplace from the search results so its coordinates and timezone can be used.'); return; }
    setLoading(true);
    setResult(null);
    try {
      const candidates = resolveBirthTime(date, time, place.zone);
      if (candidates.length > 1 && occurrence === '') { setMoments(candidates); setError('This birth time occurred twice when clocks changed. Select the recorded occurrence below.'); return; }
      const birth = candidates[candidates.length > 1 ? Number(occurrence) : 0];
      if (!birth || birth.utc > Date.now()) throw new Error('Please enter a birth time that is not in the future.');
      const chart = await getPlanetaryData({ ...birth, lat: place.lat, lon: place.lon }).catch(() => {
        throw new Error('The astrology engine could not load. Please check your connection and try again. If this continues, refresh the page. Your birth details have been kept in the form.');
      });
      setResult({ ...analyseManglik(chart), place, date, time, offset: birth.tzone });
    } catch (e) { setError(e instanceof Error ? e.message : 'Calculation failed. Please check your details and try again.'); }
    finally { setLoading(false); }
  };
  const reset = () => { invalidate(); document.getElementById('manglik-date')?.focus(); };
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebApplication', name: MANGLIK_TITLE, url: MANGLIK_URL, description: MANGLIK_DESCRIPTION, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web Browser', datePublished: MANGLIK_DATE_PUBLISHED, dateModified: MANGLIK_DATE_MODIFIED, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://veadicastro.in/' }, { '@type': 'ListItem', position: 2, name: 'Manglik Dosha Calculator', item: MANGLIK_URL }] },
      { '@type': 'FAQPage', mainEntity: manglikFaqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
    ],
  };

  return <>
    <Helmet>
      <title>{MANGLIK_TITLE}</title>
      <meta name="description" content={MANGLIK_DESCRIPTION} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={MANGLIK_URL} />
      <meta property="og:title" content={MANGLIK_TITLE} /><meta property="og:description" content={MANGLIK_DESCRIPTION} />
      <meta property="og:type" content="website" /><meta property="og:url" content={MANGLIK_URL} /><meta property="og:site_name" content="Veadicastro" />
      <meta property="og:image" content="https://veadicastro.in/optimized/social-sharing.webp" />
      <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={MANGLIK_TITLE} /><meta name="twitter:description" content={MANGLIK_DESCRIPTION} />
      <meta name="twitter:image" content="https://veadicastro.in/optimized/social-sharing.webp" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <nav aria-label="Manglik calculator navigation" className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[72px] items-center justify-between gap-4">
            <Link to="/" aria-label="Veadicastro home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"><img src="/optimized/logo.webp" alt="" className="h-9 w-9 rounded-full" /><span className="text-lg font-bold tracking-wide">Veadicastro</span></Link>
            <div className="hidden items-center gap-5 xl:gap-7 lg:flex">{navigation.map(item => <Link key={item.to} to={item.to} className="whitespace-nowrap text-sm font-medium text-white/70 transition-colors hover:text-pink-400 focus-visible:text-pink-400">{item.label}</Link>)}</div>
            <Button onClick={openChat} className="hidden shrink-0 rounded-full bg-pink-600 px-5 text-white hover:bg-pink-500 lg:inline-flex"><MessageCircle className="h-4 w-4" />Chat to AI Astrologer</Button>
            <button ref={menuButtonRef} type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="manglik-mobile-nav" onClick={() => setMenuOpen(open => !open)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400 lg:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
          {menuOpen && <div id="manglik-mobile-nav" className="border-t border-white/10 pb-5 pt-3 lg:hidden"><div className="flex flex-col">{navigation.map(item => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-pink-400">{item.label}</Link>)}</div><Button onClick={openChat} className="mt-3 h-11 w-full rounded-xl bg-pink-600 text-white hover:bg-pink-500"><MessageCircle className="h-4 w-4" />Chat to AI Astrologer</Button></div>}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <nav aria-label="Breadcrumb" className="pt-6 text-sm text-white/60"><Link to="/" className="hover:text-pink-400">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">Manglik Dosha Calculator</span></nav>
        <section className="py-12 text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/30 px-4 py-2 text-xs uppercase tracking-widest text-pink-400"><Sparkles className="h-4 w-4" />Free Vedic astrology tool</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">Manglik Dosha Calculator — Free Mangal Dosha Check Online</h1>
          <p className="mt-4 text-xl font-semibold text-pink-400">Check your Mangal Dosha with clear chart details</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65">Find Mars’s position from Lagna, Moon and Venus using your birth date, exact time and birthplace.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">{['Swiss Ephemeris', 'Lahiri ayanamsa', 'No signup needed'].map(label => <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75">{label}</span>)}</div>
        </section>
        <section aria-labelledby="birth-heading" className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <h2 id="birth-heading" className="text-center text-2xl font-bold">Enter your birth details</h2>
          <p className="mt-2 text-center text-sm leading-6 text-white/60">Use the local clock time recorded at your birthplace.</p>
          <form onSubmit={calculate} className="mt-6">
            <fieldset disabled={loading} className="space-y-5 disabled:opacity-60">
              <legend className="sr-only">Birth details for Manglik calculation</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="manglik-date" className="text-sm font-medium">Date of birth<input id="manglik-date" type="date" required min="1900-01-01" value={date} onChange={e => { setDate(e.target.value); invalidate(); }} className={fieldClass} /></label>
                <label htmlFor="manglik-time" className="text-sm font-medium">Time of birth<input id="manglik-time" type="time" required value={time} onChange={e => { setTime(e.target.value); invalidate(); }} className={fieldClass} /></label>
              </div>
              <div>
                <label htmlFor="manglik-place" className="text-sm font-medium">Place of birth</label>
                <input id="manglik-place" required value={query} autoComplete="off" placeholder="City or town, country" aria-describedby="place-help" onChange={e => { setQuery(e.target.value); setPlace(null); setSuggestions([]); setSearching(false); setSearchMessage(''); invalidate(); }} className={fieldClass} />
                <p id="place-help" className="mt-2 text-xs leading-5 text-white/60">Choose a search result to confirm latitude, longitude and timezone.</p>
                {searching && <p role="status" className="mt-2 flex gap-2 text-sm text-pink-300"><Loader2 className="h-4 w-4 animate-spin" />Searching places…</p>}
                {searchMessage && <p role="status" className="mt-2 text-sm text-amber-200">{searchMessage}</p>}
                {suggestions.length > 0 && <ul aria-label="Matching birthplaces" className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-[#15121c]">{suggestions.map((item, i) => <li key={`${item.lat}-${item.lon}-${i}`}><button type="button" className="flex w-full items-start gap-2 border-b border-white/10 px-4 py-3 text-left text-sm hover:bg-pink-500/10 focus:bg-pink-500/10" onClick={() => { setPlace(item); setQuery(item.label); setSuggestions([]); setSearching(false); setSearchMessage(''); invalidate(); }}><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />{item.label}</button></li>)}</ul>}
                {place && <p className="mt-3 rounded-xl bg-pink-500/5 p-3 text-xs leading-5 text-white/70">{place.label}<br />{place.lat.toFixed(5)}° latitude · {place.lon.toFixed(5)}° longitude<br />Timezone: {place.zone}</p>}
                <p className="mt-2 text-xs text-white/45">Place search by <a href="https://opencagedata.com/credits" className="underline" target="_blank" rel="nofollow noopener noreferrer">OpenCage and its data sources</a>.</p>
              </div>
              {moments.length > 1 && <label className="block text-sm">Which occurrence is on your birth record?<select required value={occurrence} onChange={e => setOccurrence(e.target.value)} className={fieldClass}><option value="">Choose the recorded offset</option>{moments.map((moment, i) => <option key={moment.utc} value={i}>{i === 0 ? 'First' : 'Second'} occurrence ({offsetLabel(moment.tzone)})</option>)}</select></label>}
              {error && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">{error}</p>}
              <Button type="submit" className="h-14 w-full rounded-full bg-pink-600 text-base font-semibold text-white hover:bg-pink-500">{loading ? <><Loader2 className="animate-spin" />Calculating…</> : 'Check My Manglik Dosha'}</Button>
            </fieldset>
          </form>
        </section>
        <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-pink-500/25 bg-pink-500/5 p-5 text-center sm:p-6">
          <h2 className="text-lg font-semibold text-white">Need detailed guidance from Vedika AI on Manglik Dosha?</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Ask your questions and get clear Vedic astrology guidance based on your chart.</p>
          <Button onClick={openChat} className="mt-4 h-11 rounded-full bg-pink-600 px-6 text-white hover:bg-pink-500"><MessageCircle className="h-4 w-4" />Chat to Vedika AI</Button>
        </section>
        {result && <section ref={resultRef} tabIndex={-1} aria-labelledby="result-heading" className="mt-8 scroll-mt-24 rounded-3xl border border-pink-500/25 bg-pink-500/5 p-5 outline-none sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-pink-400">Your Lagna-based result</p><h2 id="result-heading" className="mt-2 text-2xl font-bold">{result.checks[0].present ? 'Manglik indication present' : 'No Manglik indication from Lagna'}</h2></div><Button variant="outline" onClick={reset} className="border-white/20 bg-transparent"><RotateCcw className="h-4 w-4" />Calculate again</Button></div>
          <p className="mt-3 text-sm leading-6 text-white/65">{result.date} · {result.time} · {result.place.label} · {offsetLabel(result.offset)} ({result.place.zone})</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">{result.checks.map(check => <div key={check.reference} className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">From {check.reference}</h3><p className="mt-2 text-2xl font-bold text-pink-300">House {check.house}</p><p className="mt-2 text-sm text-white/75">{check.present ? 'Meets the six-house rule' : 'Does not meet the six-house rule'}</p></div>)}</div>
          <p className="mt-5 text-sm leading-6 text-white/75">Mars: {result.marsSign} ({(result.marsLongitude % 30).toFixed(4)}° within sign) · Lagna: {result.lagna} · Moon: {result.moon}</p>
          <h3 className="mt-6 font-semibold">Possible mitigating factors</h3>
          {result.factors.length ? <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-6 text-white/75">{result.factors.map(factor => <li key={factor}>{factor}</li>)}</ul> : <p className="mt-2 text-sm leading-6 text-white/65">No factors were found in the limited checks this tool performs. This is not proof that no traditional exceptions apply.</p>}
          <p className="mt-5 text-sm leading-6 text-white/65">These checks use houses 1, 2, 4, 7, 8 and 12. Supplementary Moon and Venus results are not a severity score. A chart label does not determine a marriage outcome.</p>
        </section>}
        <article aria-label="Guide to Manglik Dosha" className="mx-auto mt-16 max-w-3xl space-y-10">{manglikSections.map(section => <section key={section.title}><h2 className="text-2xl font-bold text-white">{section.title}</h2><p className="mt-4 text-base leading-8 text-white/70">{section.text}</p><p className="mt-3 text-base leading-8 text-white/70">Explore <Link to={section.link} className="text-pink-400 underline underline-offset-4 hover:text-pink-300">{section.anchor}</Link>; {section.after}</p></section>)}</article>
        <section aria-labelledby="faq-heading" className="mx-auto mt-14 max-w-3xl"><h2 id="faq-heading" className="text-3xl font-bold">Manglik calculator FAQs</h2><Accordion type="single" collapsible className="mt-6">{manglikFaqs.map(([question, answer], i) => <AccordionItem key={question} value={`faq-${i}`} className="border-white/10"><AccordionTrigger className="text-left text-base">{question}</AccordionTrigger><AccordionContent className="text-base leading-7 text-white/70">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
      </main>
    </div>
  </>;
}
