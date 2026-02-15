import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/track", label: "Track Order" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About Us" },
];

const policyLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cancellation-policy", label: "Cancellation Policy" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a0a00] text-[#FFF8E7]/70">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Brand & Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/logo.png"
                alt="The Royale Indian"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h3 className="text-2xl font-heading font-bold text-[#D4A843]">
                The Royale Indian
              </h3>
            </div>
            <p className="text-sm leading-relaxed mb-2 italic text-[#D4A843]/80">
              Taste the royal food. Feel the royalty.
            </p>
            <p className="text-sm leading-relaxed mb-4">
              At Royale Indian, we invite you to experience the true essence of
              authentic Indian cuisine, where rich traditions meet royal flavors.
            </p>
            <p className="text-xs text-[#D4A843]/60">
              theroyaleindian.com
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-[#D4A843] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#D4A843] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[#D4A843]/15">
              <ul className="space-y-2">
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#FFF8E7]/40 hover:text-[#D4A843]/70 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-[#D4A843] mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#D4A843] mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <a
                  href="mailto:info@theroyalindian.com"
                  className="hover:text-[#D4A843] transition-colors"
                >
                  info@theroyalindian.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-[#D4A843] mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                <a
                  href="tel:+911234567890"
                  className="hover:text-[#D4A843] transition-colors"
                >
                  +91 123 456 7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#D4A843]/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#FFF8E7]/40">
            &copy; {currentYear} The Royale Indian. All rights reserved.
          </p>
          <p className="text-xs text-[#FFF8E7]/30">
            theroyaleindian.com
          </p>
        </div>
      </div>
    </footer>
  );
}
