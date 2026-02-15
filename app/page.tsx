'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  day: string;
  appetizer: string;
  curry: string;
  biryani: string;
  egg: string;
  naan: string;
  price: number;
  discount_percent: number;
  description: string;
  image_url: string;
  is_active: boolean;
}

interface SiteContent {
  [key: string]: string;
}

export default function HomePage() {
  const [content, setContent] = useState<SiteContent>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contentRes, menuRes] = await Promise.all([
          supabase.from('site_content').select('*'),
          supabase
            .from('menu_items')
            .select('*')
            .eq('is_active', true)
            .limit(5),
        ]);

        if (contentRes.data) {
          const mapped: SiteContent = {};
          contentRes.data.forEach((item: { key: string; value: string }) => {
            mapped[item.key] = item.value;
          });
          setContent(mapped);
        }

        if (menuRes.data) {
          setMenuItems(menuRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a0a00]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4A843]/30 border-t-[#D4A843]" />
          <p className="text-[#D4A843] tracking-widest uppercase text-sm">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0a00] text-[#FFF8E7]">
      {/* ─── Hero Section ─── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a00]/80 via-[#1a0a00]/60 to-[#1a0a00]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#800020]/30 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#D4A843]/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#800020]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#D4A843]/10 blur-2xl" />
              <Image
                src="/logo.png"
                alt="The Royale Indian"
                width={150}
                height={150}
                className="relative rounded-full border-2 border-[#D4A843]/30 shadow-2xl shadow-[#D4A843]/20"
                priority
              />
            </div>
          </div>

          {/* Ornament */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4A843]" />
            <span className="text-sm font-medium uppercase tracking-[0.3em] text-[#D4A843]">
              Authentic Indian Cuisine
            </span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4A843]" />
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-[#FFF8E7]">The </span>
            <span className="bg-gradient-to-r from-[#D4A843] via-[#f0d080] to-[#D4A843] bg-clip-text text-transparent">
              Royale
            </span>
            <br />
            <span className="text-[#FFF8E7]">Indian</span>
          </h1>

          <p className="mx-auto mb-4 max-w-2xl text-xl leading-relaxed text-[#FFF8E7]/80 sm:text-2xl font-medium italic">
            {content.hero_subtitle || 'Taste the royal food. Feel the royalty.'}
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#FFF8E7]/60 sm:text-xl">
            {content.hero_description ||
              'At Royale Indian, we invite you to experience the true essence of authentic Indian cuisine, where rich traditions meet royal flavors.'}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/menu"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#D4A843] px-8 py-4 text-base font-bold uppercase tracking-wider text-[#1a0a00] shadow-lg shadow-[#D4A843]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4A843]/30"
            >
              <span className="relative z-10">View Menu</span>
              <svg
                className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-[#f0d080] to-[#D4A843] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#D4A843]/50 px-8 py-4 text-base font-bold uppercase tracking-wider text-[#D4A843] transition-all duration-300 hover:border-[#D4A843] hover:bg-[#D4A843]/10"
            >
              Subscribe Now
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4A843]/50">Scroll</span>
            <div className="h-8 w-5 rounded-full border border-[#D4A843]/30 p-1">
              <div className="h-2 w-full animate-bounce rounded-full bg-[#D4A843]/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── About Preview ─── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a00] via-[#1a0a00]/95 to-[#1a0a00]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-[#D4A843]">
                Our Story
              </span>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                A Taste of{' '}
                <span className="text-[#D4A843]">Tradition</span>
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-[#FFF8E7]/70">
                {content.about_description ||
                  'At Royale Indian, we invite you to experience the true essence of authentic Indian cuisine, where rich traditions meet royal flavors. Every bite is designed to make you taste the royal food and feel the royalty.'}
              </p>
              <p className="text-base leading-relaxed text-[#FFF8E7]/50 italic">
                {content.about_mission ||
                  'Taste the royal food. Feel the royalty.'}
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[#D4A843]/20 to-[#800020]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-[#D4A843]/20 flex items-center justify-center bg-gradient-to-br from-[#800020]/30 to-[#1a0a00] p-8">
                <Image
                  src="/logo.png"
                  alt="The Royale Indian"
                  width={300}
                  height={300}
                  className="rounded-full border-2 border-[#D4A843]/30 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Menu Preview ─── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-[#800020]/5" />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-[#D4A843]">
              Weekly Specials
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              This Week&apos;s <span className="text-[#D4A843]">Menu</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-[#FFF8E7]/60">
              {content.menu_preview_subtitle ||
                'A different culinary experience every day. Explore our rotating menu of handcrafted Indian dishes.'}
            </p>
          </div>

          {/* Day Cards - Horizontal Scroll on mobile, Grid on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
            {menuItems.map((item) => {
              const discountedPrice =
                item.discount_percent > 0
                  ? item.price - (item.price * item.discount_percent) / 100
                  : item.price;

              return (
                <div
                  key={item.day}
                  className="group min-w-[220px] flex-shrink-0 overflow-hidden rounded-xl border border-[#D4A843]/20 bg-[#1a0a00] transition-all duration-300 hover:border-[#D4A843]/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D4A843]/10 md:min-w-0"
                >
                  {/* Card Image */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80'}
                      alt={item.day}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a00] to-transparent" />
                    <span className="absolute bottom-3 left-3 text-lg font-bold text-[#D4A843]">
                      {item.day}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-[#D4A843]/60">
                      Full Meal Includes
                    </p>
                    <p className="mb-3 text-sm font-medium text-[#FFF8E7]/90 line-clamp-2">
                      {item.appetizer}, {item.curry}, {item.biryani}, {item.egg}, {item.naan}
                    </p>
                    <div className="flex items-baseline gap-2">
                      {item.discount_percent > 0 && (
                        <span className="text-xs text-[#FFF8E7]/40 line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-[#D4A843]">
                        ${discountedPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-[#FFF8E7]/45">
                      Price for full meal
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#D4A843] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#D4A843] transition-all duration-300 hover:bg-[#D4A843] hover:text-[#1a0a00]"
            >
              View Full Menu
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative py-24">
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-[#D4A843]">
              Simple Process
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              How It <span className="text-[#D4A843]">Works</span>
            </h2>
            <p className="mx-auto max-w-xl text-base text-[#FFF8E7]/60">
              Getting your daily Indian feast is as easy as 1-2-3.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Choose Your Days',
                description:
                  'Browse our weekly menu and pick the days that excite your taste buds. Mix and match to create your perfect week.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Make Payment',
                description:
                  'Securely pay for your selected meals online. We offer flexible plans to suit your budget and appetite.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Enjoy Your Meals',
                description:
                  'Sit back and savor restaurant-quality Indian food prepared fresh and delivered right to your door.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-2xl border border-[#D4A843]/15 bg-gradient-to-b from-[#D4A843]/5 to-transparent p-8 transition-all duration-300 hover:border-[#D4A843]/40 hover:shadow-lg hover:shadow-[#D4A843]/5"
              >
                {/* Step number background */}
                <span className="absolute -top-4 -right-2 text-8xl font-black text-[#D4A843]/5 transition-colors duration-300 group-hover:text-[#D4A843]/10">
                  {item.step}
                </span>

                <div className="relative z-10">
                  <div className="mb-5 inline-flex rounded-xl bg-[#800020]/40 p-3 text-[#D4A843]">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[#FFF8E7]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#FFF8E7]/60">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Subscribe CTA ─── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#800020]/10 to-[#1a0a00]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Decorative border */}
          <div className="rounded-3xl border border-[#D4A843]/20 bg-gradient-to-br from-[#800020]/20 via-[#1a0a00] to-[#800020]/10 p-12 sm:p-16">
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-[#D4A843]">
              Join Us Today
            </span>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Ready for a{' '}
              <span className="bg-gradient-to-r from-[#D4A843] to-[#f0d080] bg-clip-text text-transparent">
                Culinary Journey
              </span>
              ?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-[#FFF8E7]/60">
              {content.subscribe_cta_text ||
                'Subscribe now and enjoy authentic Indian meals delivered to your doorstep. No cooking, no hassle, just pure flavor. Your first week comes with a special welcome discount!'}
            </p>
            <Link
              href="/subscribe"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#D4A843] px-10 py-4 text-base font-bold uppercase tracking-wider text-[#1a0a00] shadow-lg shadow-[#D4A843]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4A843]/30"
            >
              <span className="relative z-10">Start Your Subscription</span>
              <svg
                className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-[#f0d080] to-[#D4A843] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
