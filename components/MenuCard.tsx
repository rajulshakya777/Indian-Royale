'use client';

import React from 'react';

interface MenuCardProps {
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
}

const MenuCard: React.FC<MenuCardProps> = ({
  day,
  appetizer,
  curry,
  biryani,
  egg,
  naan,
  price,
  discount_percent,
  description,
  image_url,
}) => {
  const discountedPrice =
    discount_percent > 0 ? price - (price * discount_percent) / 100 : price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#D4A843]/30 bg-[#1a0a00] shadow-lg shadow-black/20 transition-all duration-300 hover:border-[#D4A843] hover:shadow-xl hover:shadow-[#D4A843]/10 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={image_url || '/placeholder-food.jpg'}
          alt={`${day} - ${biryani}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a00] via-transparent to-transparent" />

        {/* Day Badge */}
        <div className="absolute top-4 left-4 rounded-full bg-[#800020] px-4 py-1.5 shadow-lg">
          <span className="text-sm font-bold uppercase tracking-wider text-[#D4A843]">
            {day}
          </span>
        </div>

        {/* Discount Badge */}
        {discount_percent > 0 && (
          <div className="absolute top-4 right-4 rounded-full bg-[#D4A843] px-3 py-1.5 shadow-lg">
            <span className="text-sm font-bold text-[#1a0a00]">
              {discount_percent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Menu Items List */}
        <div className="mb-4 space-y-2.5">
          <MenuItem icon="🍢" label="Appetizer" value={appetizer} />
          <MenuItem icon="🍛" label="Curry" value={curry} />
          <MenuItem icon="🍚" label="Biryani" value={biryani} />
          <MenuItem icon="🥚" label="Egg" value={egg} />
          <MenuItem icon="🫓" label="Naan" value={naan} />
        </div>

        {/* Description */}
        {description && (
          <p className="mb-4 text-sm leading-relaxed text-[#FFF8E7]/60">
            {description}
          </p>
        )}

        {/* Divider */}
        <div className="mt-auto mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#D4A843]/40 to-transparent" />

        {/* Price */}
        <div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#FFF8E7]/40">
              Per meal
            </span>
            <div className="flex items-baseline gap-2">
              {discount_percent > 0 && (
                <span className="text-base text-[#FFF8E7]/40 line-through">
                  ${price.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold text-[#D4A843]">
                ${discountedPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-base leading-none">{icon}</span>
    <div className="flex-1">
      <span className="text-xs uppercase tracking-wider text-[#D4A843]/70">
        {label}
      </span>
      <p className="text-sm font-medium text-[#FFF8E7]/90">{value}</p>
    </div>
  </div>
);

export default MenuCard;
