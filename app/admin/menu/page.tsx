"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DAY_NAMES } from "@/lib/utils";

interface MenuItem {
  id: string;
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

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*");

      if (error) throw error;
      const sorted = (data || []).sort(
        (a, b) => DAY_NAMES.indexOf(a.day as (typeof DAY_NAMES)[number]) - DAY_NAMES.indexOf(b.day as (typeof DAY_NAMES)[number])
      );
      setMenuItems(sorted);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof MenuItem,
    value: string | number
  ) => {
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async (item: MenuItem, index: number) => {
    setSaving((prev) => ({ ...prev, [item.id]: true }));
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({
          appetizer: item.appetizer,
          curry: item.curry,
          biryani: item.biryani,
          egg: item.egg,
          naan: item.naan,
          price: item.price,
          discount_percent: item.discount_percent,
          description: item.description,
          image_url: item.image_url,
        })
        .eq("id", item.id);

      if (error) throw error;
      setSuccessMsg((prev) => ({ ...prev, [item.id]: "Saved!" }));
      setTimeout(() => {
        setSuccessMsg((prev) => ({ ...prev, [item.id]: "" }));
      }, 2000);
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    item: MenuItem,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [item.id]: true }));
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `menu/${item.day.toLowerCase()}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("Royale-images")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("Royale-images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update in DB
      const { error: updateError } = await supabase
        .from("menu_items")
        .update({ image_url: publicUrl })
        .eq("id", item.id);

      if (updateError) throw updateError;

      // Update local state
      handleFieldChange(index, "image_url", publicUrl);
      setSuccessMsg((prev) => ({ ...prev, [item.id]: "Image uploaded!" }));
      setTimeout(() => {
        setSuccessMsg((prev) => ({ ...prev, [item.id]: "" }));
      }, 2000);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading menu items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Menu Management</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          Edit daily menu items, prices, and images.
        </p>
      </div>

      <div className="space-y-6">
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#D4A843]">
                {item.day}
              </h2>
              <div className="flex items-center gap-3">
                {successMsg[item.id] && (
                  <span className="text-green-400 text-sm">
                    {successMsg[item.id]}
                  </span>
                )}
                <button
                  onClick={() => handleSave(item, index)}
                  disabled={saving[item.id]}
                  className="px-6 py-2 rounded-lg bg-[#D4A843] text-[#1a0a00] font-medium hover:bg-[#D4A843]/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving[item.id] ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Image section */}
              <div className="lg:row-span-2">
                <label className="block text-[#FFF8E7]/70 text-sm mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.day}
                      className="w-full h-40 object-cover rounded-lg border border-[#D4A843]/20"
                    />
                  )}
                  <label className="block">
                    <span className="inline-block px-4 py-2 rounded-lg border border-[#D4A843]/40 text-[#D4A843] text-sm cursor-pointer hover:bg-[#D4A843]/10 transition-colors">
                      {uploading[item.id] ? "Uploading..." : "Upload Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, item, index)}
                      disabled={uploading[item.id]}
                    />
                  </label>
                </div>
              </div>

              {/* Text fields */}
              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Appetizer
                </label>
                <input
                  type="text"
                  value={item.appetizer || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "appetizer", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Curry
                </label>
                <input
                  type="text"
                  value={item.curry || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "curry", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Biryani
                </label>
                <input
                  type="text"
                  value={item.biryani || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "biryani", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Egg
                </label>
                <input
                  type="text"
                  value={item.egg || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "egg", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Naan
                </label>
                <input
                  type="text"
                  value={item.naan || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "naan", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) =>
                    handleFieldChange(index, "price", parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Discount %
                </label>
                <input
                  type="number"
                  value={item.discount_percent || 0}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "discount_percent",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Description
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "description", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843] resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
