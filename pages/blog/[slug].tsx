// NOTE: This is a Vite project, not Next.js
// For Vite, we need to use a different approach for blog routing
// This file should be moved to src/pages/BlogDetail.tsx or similar

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../../src/components/Footer';

// Blog component wrapper for Vite
const BlogPost = ({ blogData }: { blogData: any }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Dynamic component rendering
  const BlogComponent = blogData.component;

  return (
    <>
      <Helmet>
        <title>{blogData.title}</title>
        <meta name="description" content={blogData.excerpt} />
        <meta property="og:title" content={blogData.title} />
        <meta property="og:description" content={blogData.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://veadicastro.in/blog/${blogData.slug}`} />
      </Helmet>
      
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

export default BlogPost;
