'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface AboutContent {
  about_title: string;
  about_description: string;
  about_mission: string;
  about_image: string;
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>({
    about_title: '',
    about_description: '',
    about_mission: '',
    about_image: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .in('key', ['about_title', 'about_description', 'about_mission', 'about_image']);

      if (data) {
        const mapped: Record<string, string> = {};
        data.forEach((item) => {
          mapped[item.key] = item.value;
        });
        setContent({
          about_title: mapped.about_title || 'Our Story',
          about_description: mapped.about_description || '',
          about_mission: mapped.about_mission || '',
          about_image: mapped.about_image || '',
        });
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
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#D4A843] mb-4">About Us</h1>
          <p className="text-[#FFF8E7]/80 text-lg max-w-2xl mx-auto italic">
            Taste the royal food. Feel the royalty.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="w-full h-[400px] bg-gradient-to-br from-[#800020] to-[#1a0a00] rounded-2xl shadow-xl flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="The Royale Indian"
                width={250}
                height={250}
                className="rounded-full border-2 border-[#D4A843]/30 shadow-2xl"
              />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a0a00] mb-6">
              {content.about_title || 'Our Story'}
            </h2>
            <div className="w-20 h-1 bg-[#D4A843] mb-6"></div>
            {content.about_description ? (
              <div className="text-[#1a0a00]/80 leading-relaxed space-y-4">
                {content.about_description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="text-[#1a0a00]/80 leading-relaxed space-y-4">
                <p>
                  At Royale Indian, we invite you to experience the true essence of authentic Indian
                  cuisine, where rich traditions meet royal flavors.
                </p>
                <p>
                  Every bite is designed to make you taste the royal food and feel the royalty.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-[#800020] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-6">Our Mission</h2>
          <div className="w-20 h-1 bg-[#D4A843] mx-auto mb-8"></div>
          {content.about_mission ? (
            <div className="text-[#FFF8E7]/90 text-lg leading-relaxed space-y-4">
              {content.about_mission.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-[#FFF8E7]/90 text-lg leading-relaxed">
              Taste the royal food. Feel the royalty. Our mission is to bring the rich traditions
              and royal flavors of authentic Indian cuisine right to your doorstep, making every
              meal a celebration of India&apos;s culinary heritage.
            </p>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a0a00] text-center mb-4">
          Our Values
        </h2>
        <div className="w-20 h-1 bg-[#D4A843] mx-auto mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#D4A843]/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#D4A843]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1a0a00] mb-3">Authenticity</h3>
            <p className="text-[#1a0a00]/70 leading-relaxed">
              Every recipe is rooted in tradition, passed down through generations. We honor the
              authentic flavors and cooking techniques that make Indian cuisine extraordinary.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#D4A843]/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#D4A843]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1a0a00] mb-3">Quality</h3>
            <p className="text-[#1a0a00]/70 leading-relaxed">
              We source the freshest ingredients and spices to ensure every meal meets our exacting
              standards. Quality is never compromised in our kitchen.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#D4A843]/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#D4A843]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1a0a00] mb-3">Community</h3>
            <p className="text-[#1a0a00]/70 leading-relaxed">
              Food is at the heart of community. We strive to bring people together through the
              shared experience of enjoying wholesome, lovingly prepared meals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a0a00] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-4">
            Ready to Experience The Royale Indian?
          </h2>
          <p className="text-[#FFF8E7]/70 text-lg mb-8">
            Subscribe today and let us bring the finest Indian cuisine to your table.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-[#D4A843] text-[#1a0a00] font-semibold rounded-xl hover:bg-[#c49a3a] transition-colors text-lg"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
