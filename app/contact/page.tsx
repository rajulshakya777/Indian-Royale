'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ContactInfo {
  email: string;
  phone: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .in('key', ['contact_email', 'contact_phone']);

      if (data) {
        const info: ContactInfo = { email: '', phone: '' };
        data.forEach((item) => {
          if (item.key === 'contact_email') info.email = item.value;
          if (item.key === 'contact_phone') info.phone = item.value;
        });
        setContactInfo(info);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || 'Failed to send message. Please try again.');
        return;
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Hero */}
      <div className="bg-[#800020] py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#D4A843] mb-4">Contact Us</h1>
          <p className="text-[#FFF8E7]/80 text-lg max-w-2xl mx-auto">
            We would love to hear from you. Reach out to us with any questions, feedback, or
            inquiries.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[#1a0a00] mb-6">Send Us a Message</h2>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">
                  Thank you for your message! We will get back to you as soon as possible.
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#1a0a00] mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#D4A843]/30 rounded-xl text-[#1a0a00] placeholder-gray-400 focus:outline-none focus:border-[#D4A843] transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1a0a00] mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#D4A843]/30 rounded-xl text-[#1a0a00] placeholder-gray-400 focus:outline-none focus:border-[#D4A843] transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#1a0a00] mb-1">
                      Phone <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-[#D4A843]/30 rounded-xl text-[#1a0a00] placeholder-gray-400 focus:outline-none focus:border-[#D4A843] transition-colors"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-[#1a0a00] mb-1"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#D4A843]/30 rounded-xl text-[#1a0a00] focus:outline-none focus:border-[#D4A843] transition-colors bg-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Subscription Question">Subscription Question</option>
                      <option value="Delivery Issue">Delivery Issue</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#1a0a00] mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-[#D4A843]/30 rounded-xl text-[#1a0a00] placeholder-gray-400 focus:outline-none focus:border-[#D4A843] transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3 bg-[#800020] text-[#D4A843] font-semibold rounded-xl hover:bg-[#600018] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#1a0a00] mb-5">Get in Touch</h3>

              <div className="space-y-5">
                {contactInfo.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-5 h-5 text-[#800020]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-[#800020] font-medium hover:underline"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {contactInfo.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-5 h-5 text-[#800020]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-[#800020] font-medium hover:underline"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#1a0a00] mb-4">Business Hours</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-[#1a0a00] font-medium">9:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-[#1a0a00] font-medium">10:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-[#1a0a00] font-medium">10:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Decorative Map Placeholder */}
            <div className="bg-[#800020] rounded-2xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4A843]/20 flex items-center justify-center">
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-[#D4A843] font-bold text-lg mb-2">Visit Us</h3>
              <p className="text-[#FFF8E7]/70 text-sm">
                We are conveniently located and ready to serve you authentic Indian cuisine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
