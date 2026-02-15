"use client";

import { useState } from "react";

interface ExportOption {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const exportOptions: ExportOption[] = [
  {
    key: "orders",
    label: "Orders",
    description: "Export all subscription orders with customer and delivery details.",
    icon: "\u{1F4CB}",
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    description: "Export all subscription records with customer information.",
    icon: "\u{1F4E6}",
  },
  {
    key: "sales",
    label: "Sales",
    description: "Export sales report with revenue and refund data.",
    icon: "\u{1F4B0}",
  },
];

export default function AdminExportPage() {
  const [dateRanges, setDateRanges] = useState<
    Record<string, { start: string; end: string }>
  >({
    orders: { start: "", end: "" },
    subscriptions: { start: "", end: "" },
    sales: { start: "", end: "" },
  });
  const [exporting, setExporting] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDateChange = (
    key: string,
    field: "start" | "end",
    value: string
  ) => {
    setDateRanges((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleExport = async (key: string) => {
    setExporting((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: "" }));

    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        type: key,
      });

      if (dateRanges[key].start) {
        params.append("start_date", dateRanges[key].start);
      }
      if (dateRanges[key].end) {
        params.append("end_date", dateRanges[key].end);
      }

      const res = await fetch(`/api/admin/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Export failed. Please try again.");
      }

      // Get the blob
      const blob = await res.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `royale-indian-${key}-${dateStr}.xlsx`;

      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Export error:", error);
      setErrors((prev) => ({
        ...prev,
        [key]: error.message || "Export failed. Please try again.",
      }));
    } finally {
      setExporting((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#D4A843]">Export Data</h1>
        <p className="text-[#FFF8E7]/60 mt-1">
          Download data as Excel files for reporting and analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {exportOptions.map((option) => (
          <div
            key={option.key}
            className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{option.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-[#D4A843]">
                  {option.label}
                </h2>
                <p className="text-[#FFF8E7]/50 text-xs mt-0.5">
                  {option.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRanges[option.key]?.start || ""}
                  onChange={(e) =>
                    handleDateChange(option.key, "start", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>

              <div>
                <label className="block text-[#FFF8E7]/70 text-sm mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRanges[option.key]?.end || ""}
                  onChange={(e) =>
                    handleDateChange(option.key, "end", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a0a00]/60 border border-[#D4A843]/30 text-[#FFF8E7] text-sm focus:outline-none focus:border-[#D4A843]"
                />
              </div>
            </div>

            {errors[option.key] && (
              <div className="mt-3 text-red-300 text-sm bg-red-900/20 px-3 py-2 rounded-lg">
                {errors[option.key]}
              </div>
            )}

            <button
              onClick={() => handleExport(option.key)}
              disabled={exporting[option.key]}
              className="mt-4 w-full py-3 rounded-lg bg-[#D4A843] text-[#1a0a00] font-semibold hover:bg-[#D4A843]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {exporting[option.key]
                ? "Exporting..."
                : `Export ${option.label} to Excel`}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#800020]/10 border border-[#D4A843]/20 rounded-xl p-6">
        <h3 className="text-[#D4A843] font-medium mb-2">Export Notes</h3>
        <ul className="space-y-1 text-[#FFF8E7]/50 text-sm">
          <li>
            - Leave date fields empty to export all available data.
          </li>
          <li>
            - Files are downloaded in .xlsx format compatible with Microsoft
            Excel and Google Sheets.
          </li>
          <li>
            - Large exports may take a few moments to generate.
          </li>
        </ul>
      </div>
    </div>
  );
}
