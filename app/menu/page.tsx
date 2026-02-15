'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MenuCard from '@/components/MenuCard';

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

export default function MenuPage() {
  const [content, setContent] = useState<SiteContent>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contentRes, menuRes] = await Promise.all([
          supabase.from('site_content').select('*'),
          supabase.from('menu_items').select('*').eq('is_active', true),
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
        console.error('Error fetching menu data:', error);
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
          <p className="text-sm uppercase tracking-widest text-[#D4A843]">
            Loading Menu
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0a00] text-[#FFF8E7]">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden pb-16 pt-32">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#800020]/15 to-transparent" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#D4A843]/5 blur-3xl" />
        <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-[#800020]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-[#FFF8E7]/40">
            <Link
              href="/"
              className="transition-colors hover:text-[#D4A843]"
            >
              Home
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#D4A843]">Menu</span>
          </nav>

          {/* Ornament */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A843]" />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4A843]">
              Weekly Selection
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A843]" />
          </div>

          <h1 className="mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
            {content.menu_title || (
              <>
                Our{' '}
                <span className="bg-gradient-to-r from-[#D4A843] via-[#f0d080] to-[#D4A843] bg-clip-text text-transparent">
                  Weekly Menu
                </span>
              </>
            )}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#FFF8E7]/60">
            {content.menu_subtitle ||
              'Each day brings a new culinary adventure. Our chefs prepare a unique selection of appetizers, curries, biryanis, and freshly baked naan for every day of the week.'}
          </p>
        </div>
      </section>

      {/* ─── Menu Cards Grid ─── */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {menuItems.length === 0 ? (
            <div className="rounded-2xl border border-[#D4A843]/20 bg-[#D4A843]/5 p-12 text-center">
              <p className="text-lg text-[#FFF8E7]/60">
                Our menu is currently being updated. Please check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <MenuCard
                  key={item.day}
                  day={item.day}
                  appetizer={item.appetizer}
                  curry={item.curry}
                  biryani={item.biryani}
                  egg={item.egg}
                  naan={item.naan}
                  price={item.price}
                  discount_percent={item.discount_percent}
                  description={item.description}
                  image_url={item.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Subscribe CTA ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-3xl border border-[#D4A843]/20 bg-gradient-to-br from-[#800020]/20 via-[#1a0a00] to-[#800020]/10 p-12 sm:p-16">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Love What You See?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-[#FFF8E7]/60">
              {content.menu_cta_text ||
                'Subscribe to get these delicious meals delivered to your door every week. Choose the days that work best for you and enjoy hassle-free dining.'}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/subscribe"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#D4A843] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#1a0a00] shadow-lg shadow-[#D4A843]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4A843]/30"
              >
                <span className="relative z-10">Subscribe Now</span>
                <svg
                  className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#FFF8E7]/20 px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#FFF8E7]/60 transition-all duration-300 hover:border-[#FFF8E7]/40 hover:text-[#FFF8E7]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
