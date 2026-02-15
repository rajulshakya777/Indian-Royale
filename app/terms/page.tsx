'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'terms_conditions')
        .single();

      if (data) {
        setContent(data.value);
      }
      setLoading(false);
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4A843] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Hero */}
      <div className="bg-[#800020] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#D4A843] mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-[#FFF8E7]/80 text-lg">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          {content ? (
            <div
              className="prose prose-lg max-w-none text-[#1a0a00]/80 prose-headings:text-[#1a0a00] prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-a:text-[#800020] prose-a:underline prose-strong:text-[#1a0a00]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">
              Terms and conditions content is not available at this time. Please check back later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
