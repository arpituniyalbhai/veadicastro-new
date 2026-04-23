import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

// Blog imports - these should be dynamic in production
import AiAstrologyRealOrFake from '../../blogs/ai-astrology/ai-astrology-real-or-fake';
import IsAiAstrologyAccurate from '../../blogs/ai-astrology/is-ai-astrology-accurate';
import AiJyotishVedicAstrology from '../../blogs/ai-astrology/ai-jyotish-vedic-astrology';
import Ipl2026WinnerPrediction from '../../blogs/ipl-2026-winner-prediction-astrology';
import VedicAstrologyAiKeseKaamKartaHa from '../../blogs/vedic-astrology-ai-kese-kaam-karta-ha';

// Blog component mapping
const blogComponents: Record<string, React.ComponentType> = {
  'ai-astrology/ai-astrology-real-or-fake': AiAstrologyRealOrFake,
  'ai-astrology/is-ai-astrology-accurate': IsAiAstrologyAccurate,
  'ai-astrology/ai-jyotish-vedic-astrology': AiJyotishVedicAstrology,
  'ipl-2026-winner-prediction-astrology': Ipl2026WinnerPrediction,
  'vedic-astrology-ai-kese-kaam-karta-ha': VedicAstrologyAiKeseKaamKartaHa,
};

// Blog metadata
const blogMetadata: Record<string, { title: string; excerpt: string }> = {
  'ai-astrology/ai-astrology-real-or-fake': {
    title: 'AI Astrology Real or Fake? The Truth About AI Jyotish',
    excerpt: 'Is AI astrology real or fake? Discover the truth about AI Jyotish, how it works, and whether it can accurately predict your future using Vedic astrology principles.'
  },
  'ai-astrology/is-ai-astrology-accurate': {
    title: 'Is AI Astrology Accurate? Scientific Analysis',
    excerpt: 'Scientific analysis of AI astrology accuracy. Can AI really predict your future using Vedic astrology principles? Find out here.'
  },
  'ai-astrology/ai-jyotish-vedic-astrology': {
    title: 'AI Jyotish: The Future of Vedic Astrology',
    excerpt: 'Explore AI Jyotish and how artificial intelligence is revolutionizing Vedic astrology predictions and consultations.'
  },
  'ipl-2026-winner-prediction-astrology': {
    title: 'IPL 2026 Winner Prediction: Astrology Analysis',
    excerpt: 'IPL 2026 winner prediction based on Vedic astrology. Analysis of team charts, planetary positions, and match timings.'
  },
  'vedic-astrology-ai-kese-kaam-karta-ha': {
    title: 'Vedic Astrology AI Kaise Kaam Karta Hai? Complete Guide',
    excerpt: 'Vedic astrology AI kaise kaam karta hai? Complete guide in Hindi explaining AI Jyotish technology and predictions.'
  },
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 100);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!slug || !blogComponents[slug]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
          <button 
            onClick={() => navigate('/blog')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const BlogComponent = blogComponents[slug];
  const metadata = blogMetadata[slug];

  return (
    <>
      <SEO 
        title={metadata.title}
        description={metadata.excerpt}
        type="article"
        url={`https://veadicastro.in/blog/${slug}`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Blog Content */}
        <BlogComponent />
        <Footer />
      </div>
    </>
  );
};

export default BlogDetail;
