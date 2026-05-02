import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image?: string;
  externalLink?: string;
};

// Latest 3 blog posts (sorted by date, most recent first)
const latestBlogPosts: BlogPost[] = [
  {
    id: "20",
    title: "Online Astrologer Per Minute Scam — The Truth",
    excerpt: "Online astrologers charge ₹15–₹50 per minute. A 45-min session costs ₹2,250. See how the industry traps you — and how VeadicAstro charges ₹799 flat with no per-minute billing.",
    author: "Arpit Uniyal",
    date: "2026-04-24",
    readTime: "9 min read",
    category: "Industry Analysis",
    image: "/blog-images/astrologer-scal-blog.webp",
    externalLink: "/blog/the-great-astrology-scam"
  },
  {
    id: "25",
    title: "Free AI Astrology Chat India — Ask Vedika AI Your Question",
    excerpt: "Chat with Vedika AI — India's free AI astrology chat built on Vedic Jyotish. Ask about marriage, career, finance. Get answers based on your real Kundali, not generic horoscopes.",
    author: "Arpit Uniyal",
    date: "2026-05-02",
    readTime: "12 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/free-ai-astrology-chat-india.webp",
    externalLink: "/blog/free-ai-astrology-chat-india"
  },
  {
    id: "24",
    title: "Vedika AI — India's Most Accurate AI Astrologer",
    excerpt: "Meet Vedika AI — India's most accurate AI astrologer. Get free AI astrology chat, daily predictions, kundli analysis in Hindi & English. Built on authentic Vedic knowledge with Lahiri sidereal system.",
    author: "Arpit Uniyal",
    date: "2026-04-27",
    readTime: "20 min read",
    category: "AI & Technology",
    image: "/optimized/vedika-ai-16.5-image.webp",
    externalLink: "/blog/vedika-ai-astrologer-india"
  }
];
const BlogSection = () => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const handlePostClick = (post: BlogPost) => {
    if (post.externalLink) {
      if (post.externalLink.startsWith('/')) {
        navigate(post.externalLink);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.open(post.externalLink, '_blank');
      }
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-accent/10 backdrop-blur-md shadow-lg">
            <BookOpen className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">Latest Insights</span>
          </div>
          
          <h2 className="font-sans text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight tracking-normal relative">
            <span className="relative z-10 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-2xl">
              Latest from Our Blog
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-accent/50 to-primary/40 blur-2xl -z-10 scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-secondary/40 to-accent/30 blur-xl -z-10 scale-105"></div>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover Vedic wisdom, AI insights, and cosmic guidance from our expert astrologers
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {latestBlogPosts.map((post, index) => (
            <article
              key={post.id}
              className="group relative bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden"
              onClick={() => handlePostClick(post)}
            >
              {/* Image Container */}
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 space-y-4">
                {/* Category Badge */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-secondary font-medium uppercase tracking-wide">
                    {post.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold leading-tight line-clamp-2 group-hover:text-accent transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <span className="text-xs">By {post.author}</span>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </article>
          ))}
        </div>

        {/* View All Blogs CTA */}
        <div className="text-center space-y-4">
          <button
            onClick={() => {
              navigate('/blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-xl hover:from-secondary/90 hover:to-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            View All Blog Posts
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-center">
            <button
              onClick={() => {
                navigate('/ai-astrology');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-2 border border-accent/40 text-accent hover:bg-accent/10 rounded-lg transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              AI Astrology — Complete Guide
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
