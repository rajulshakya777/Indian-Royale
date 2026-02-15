"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  type: string;
}

type GroupedContent = Record<string, ContentItem[]>;

const SECTION_ORDER = [
  "Hero",
  "About",
  "Menu",
  "Subscribe",
  "Contact",
  "Footer",
  "Policies",
];

function getSectionForKey(key: string): string {
  if (key.startsWith("hero_")) return "Hero";
  if (key.startsWith("about_")) return "About";
  if (key.startsWith("menu_")) return "Menu";
  if (key.startsWith("subscribe_")) return "Subscribe";
  if (key.startsWith("contact_")) return "Contact";
  if (key.startsWith("footer_")) return "Footer";
  if (["privacy_policy", "terms_conditions", "cancellation_policy"].includes(key)) {
    return "Policies";
  }
  return "Other";
}

export default function AdminContentPage() {
  const [content, setContent] = useState<GroupedContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("key");

      if (error) throw error;

      const grouped: GroupedContent = {};
      (data || []).forEach((item: ContentItem) => {
        const section = getSectionForKey(item.key);
        if (!grouped[section]) {
          grouped[section] = [];
        }
        grouped[section].push(item);
      });

      setContent(grouped);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (
    section: string,
    index: number,
    value: string
  ) => {
    setContent((prev) => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][index] = { ...updated[section][index], value };
      return updated;
    });
  };

  const handleSaveSection = async (section: string) => {
    setSaving((prev) => ({ ...prev, [section]: true }));
    try {
      const items = content[section];
      for (const item of items) {
        const { error } = await supabase
          .from("site_content")
          .update({ value: item.value })
          .eq("id", item.id);
        if (error) throw error;
      }
      setSuccessMsg((prev) => ({ ...prev, [section]: "Saved!" }));
      setTimeout(() => {
        setSuccessMsg((prev) => ({ ...prev, [section]: "" }));
      }, 2000);
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string,
    index: number,
    item: ContentItem
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = `${section}-${index}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `content/${section.toLowerCase()}-${item.key}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("Royale-images")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("Royale-images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      handleValueChange(section, index, publicUrl);

      // Also save to DB immediately
      const { error: updateError } = await supabase
        .from("site_content")
        .update({ value: publicUrl })
        .eq("id", item.id);

      if (updateError) throw updateError;

      setSuccessMsg((prev) => ({ ...prev, [section]: "Image uploaded!" }));
      setTimeout(() => {
        setSuccessMsg((prev) => ({ ...prev, [section]: "" }));
      }, 2000);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const renderField = (
    item: ContentItem,
    section: string,
    index: number
  ) => {
    const uploadKey = `${section}-${index}`;

    if (item.type === "image") {
      return (
        <div className="space-y-3">
          {item.value && (
            <img
              src={item.value}
              alt={item.key}
              className="w-48 h-32 object-cover rounded-lg border border-[#D4A843]/20"
            />
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={item.value || ""}
              onChange={(e) => handleValueChange(section, index, e.target.value)}
              placeholder="Image URL"
              className="flex-1 px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
            />
            <label className="shrink-0">
              <span className="inline-block px-4 py-2 rounded-lg border border-[#D4A843]/40 text-[#D4A843] text-sm cursor-pointer hover:bg-[#D4A843]/10 transition-colors">
                {uploading[uploadKey] ? "Uploading..." : "Upload"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, section, index, item)}
                disabled={uploading[uploadKey]}
              />
            </label>
          </div>
        </div>
      );
    }

    if (item.type === "html") {
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) =>
            handleValueChange(section, index, e.currentTarget.innerHTML)
          }
          dangerouslySetInnerHTML={{ __html: item.value || "" }}
          className="w-full min-h-[140px] px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843] overflow-auto"
        />
      );
    }

    // Default: text type
    return (
      <input
        type="text"
        value={item.value || ""}
        onChange={(e) => handleValueChange(section, index, e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#D4A843] text-lg">Loading content...</div>
      </div>
    );
  }

  const sortedSections = Object.keys(content).sort((a, b) => {
    const aIdx = SECTION_ORDER.indexOf(a);
    const bIdx = SECTION_ORDER.indexOf(b);
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">
          Content Management
        </h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          Edit website content by section.
        </p>
      </div>

      <div className="space-y-6">
        {sortedSections.map((section) => (
          <div
            key={section}
            className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#D4A843]">
                {section}
              </h2>
              <div className="flex items-center gap-3">
                {successMsg[section] && (
                  <span className="text-green-400 text-sm">
                    {successMsg[section]}
                  </span>
                )}
                <button
                  onClick={() => handleSaveSection(section)}
                  disabled={saving[section]}
                  className="px-6 py-2 rounded-lg bg-[#D4A843] text-[#1a0a00] font-medium hover:bg-[#D4A843]/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving[section] ? "Saving..." : "Save Section"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {content[section].map((item, index) => (
                <div key={item.id}>
                  <label className="block text-[#FFF8E7]/70 text-sm mb-2">
                    {item.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    <span className="ml-2 text-[#FFF8E7]/30 text-xs">
                      ({item.type})
                    </span>
                  </label>
                  {renderField(item, section, index)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
