"use client";

import { useState } from "react";
import { MEAL_PRICE, DAY_NAMES, MealType, formatCurrency } from "@/lib/utils";

type DaySelection = {
  day: string;
  meals: MealType[];
};

export default function SubscribePage() {
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<DaySelection[]>([]);
  const [weeks, setWeeks] = useState(4);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalMealsPerWeek = selectedDays.reduce(
    (sum, d) => sum + d.meals.length,
    0
  );
  const totalMeals = totalMealsPerWeek * weeks;
  const totalPrice = totalMeals * MEAL_PRICE;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const exists = prev.find((d) => d.day === day);
      if (exists) {
        return prev.filter((d) => d.day !== day);
      }
      return [...prev, { day, meals: ["lunch", "dinner"] as MealType[] }];
    });
  };

  const toggleMeal = (day: string, meal: MealType) => {
    setSelectedDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const hasMeal = d.meals.includes(meal);
        const newMeals = hasMeal
          ? d.meals.filter((m) => m !== meal)
          : [...d.meals, meal];
        if (newMeals.length === 0) return d;
        return { ...d, meals: newMeals };
      })
    );
  };

  const isDaySelected = (day: string) =>
    selectedDays.some((d) => d.day === day);

  const hasMeal = (day: string, meal: MealType) =>
    selectedDays.find((d) => d.day === day)?.meals.includes(meal) ?? false;

  const canProceedStep1 =
    selectedDays.length > 0 && selectedDays.every((d) => d.meals.length > 0);
  const canProceedStep3 =
    name.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    address.trim() !== "";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDays,
          weeks,
          name,
          email,
          phone,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment request failed");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Stripe checkout URL not returned");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start payment. Please check details and try again.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Days & Meals", "Weeks", "Your Details", "Review & Pay"];

  return (
    <main className="min-h-screen bg-[#1a0a00]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#800020] to-[#1a0a00] py-12 md:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#D4A843] mb-3">
          Subscribe to Fresh Meals
        </h1>
        <p className="text-[#FFF8E7]/70 text-base md:text-lg max-w-xl mx-auto px-4">
          Authentic Indian cuisine delivered to your door, every week.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20 -mt-4">
        {/* Step Indicators */}
        <div className="mb-10 overflow-x-auto">
          <div className="flex min-w-max items-center justify-center px-2">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#D4A843] text-[#1a0a00]"
                        : isActive
                        ? "bg-[#800020] text-[#D4A843] ring-2 ring-[#D4A843]"
                        : "bg-[#1a0a00] text-[#FFF8E7]/40 border border-[#FFF8E7]/20"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden sm:block whitespace-nowrap ${
                      isActive
                        ? "text-[#D4A843]"
                        : isCompleted
                        ? "text-[#D4A843]/70"
                        : "text-[#FFF8E7]/30"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 sm:mb-0 transition-all duration-300 ${
                      step > stepNum ? "bg-[#D4A843]" : "bg-[#FFF8E7]/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#800020]/20 border border-[#D4A843]/20 rounded-2xl p-6 md:p-8">
          {/* Step 1: Select Days & Meal Times */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#D4A843] mb-2">
                Choose Your Days & Meals
              </h2>
              <p className="text-[#FFF8E7]/60 mb-8">
                Select the days you want meals delivered and pick lunch, dinner,
                or both.
              </p>

              <div className="space-y-4">
                {DAY_NAMES.map((day) => {
                  const selected = isDaySelected(day);
                  return (
                    <div
                      key={day}
                      className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                        selected
                          ? "border-[#D4A843] bg-[#D4A843]/10"
                          : "border-[#FFF8E7]/10 bg-[#1a0a00]/40 hover:border-[#FFF8E7]/30"
                      }`}
                    >
                      <button
                        onClick={() => toggleDay(day)}
                        className="w-full flex items-center justify-between p-4"
                      >
                        <span
                          className={`text-lg font-semibold ${
                            selected ? "text-[#D4A843]" : "text-[#FFF8E7]/70"
                          }`}
                        >
                          {day}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            selected
                              ? "bg-[#D4A843] border-[#D4A843]"
                              : "border-[#FFF8E7]/30"
                          }`}
                        >
                          {selected && (
                            <svg
                              className="w-4 h-4 text-[#1a0a00]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>

                      {selected && (
                        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => toggleMeal(day, "lunch")}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              hasMeal(day, "lunch")
                                ? "bg-[#D4A843] text-[#1a0a00]"
                                : "bg-[#1a0a00]/60 text-[#FFF8E7]/50 hover:text-[#FFF8E7]/70 border border-[#FFF8E7]/10"
                            }`}
                          >
                            Lunch &middot; 1:00 PM
                          </button>
                          <button
                            onClick={() => toggleMeal(day, "dinner")}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              hasMeal(day, "dinner")
                                ? "bg-[#D4A843] text-[#1a0a00]"
                                : "bg-[#1a0a00]/60 text-[#FFF8E7]/50 hover:text-[#FFF8E7]/70 border border-[#FFF8E7]/10"
                            }`}
                          >
                            Dinner &middot; 7:00 PM
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedDays.length > 0 && (
                <div className="mt-6 p-4 bg-[#1a0a00]/50 rounded-lg border border-[#D4A843]/10">
                  <p className="text-[#FFF8E7]/60 text-sm">
                    <span className="text-[#D4A843] font-semibold">
                      {totalMealsPerWeek} meal
                      {totalMealsPerWeek !== 1 ? "s" : ""}
                    </span>{" "}
                    per week selected
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full sm:w-auto px-8 py-3 bg-[#D4A843] text-[#1a0a00] font-bold rounded-lg hover:bg-[#c49a3a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next: Choose Weeks
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Number of Weeks */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#D4A843] mb-2">
                How Many Weeks?
              </h2>
              <p className="text-[#FFF8E7]/60 mb-8">
                Choose your subscription duration. The longer you subscribe, the
                more you save on planning.
              </p>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#FFF8E7]/50 text-sm">1 week</span>
                  <span className="text-3xl font-bold text-[#D4A843]">
                    {weeks} week{weeks !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[#FFF8E7]/50 text-sm">12 weeks</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="w-full h-2 bg-[#1a0a00] rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
                />
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-8">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeeks(w)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      weeks === w
                        ? "bg-[#D4A843] text-[#1a0a00]"
                        : "bg-[#1a0a00]/60 text-[#FFF8E7]/50 hover:text-[#FFF8E7]/80 border border-[#FFF8E7]/10"
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </div>

              <div className="bg-[#1a0a00]/60 border border-[#D4A843]/20 rounded-xl p-6">
                <h3 className="text-[#FFF8E7]/50 text-sm uppercase tracking-wider mb-4">
                  Price Breakdown
                </h3>
                <div className="space-y-2 text-[#FFF8E7]/70">
                  <div className="flex justify-between">
                    <span>Meals per week</span>
                    <span className="text-[#FFF8E7]">
                      {totalMealsPerWeek}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per meal</span>
                    <span className="text-[#FFF8E7]">
                      {formatCurrency(MEAL_PRICE)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of weeks</span>
                    <span className="text-[#FFF8E7]">{weeks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total meals</span>
                    <span className="text-[#FFF8E7]">
                      {totalMealsPerWeek} &times; {weeks} = {totalMeals}
                    </span>
                  </div>
                  <div className="border-t border-[#FFF8E7]/10 pt-3 mt-3 flex justify-between">
                    <span className="text-[#D4A843] font-bold text-lg">
                      Total
                    </span>
                    <span className="text-[#D4A843] font-bold text-lg">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 py-3 border border-[#D4A843]/30 text-[#D4A843] font-medium rounded-lg hover:bg-[#D4A843]/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto px-8 py-3 bg-[#D4A843] text-[#1a0a00] font-bold rounded-lg hover:bg-[#c49a3a] transition-colors"
                >
                  Next: Your Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#D4A843] mb-2">
                Your Details
              </h2>
              <p className="text-[#FFF8E7]/60 mb-8">
                Tell us where to deliver your meals.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[#FFF8E7]/70 text-sm font-medium mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-[#1a0a00]/60 border border-[#FFF8E7]/15 rounded-lg text-[#FFF8E7] placeholder:text-[#FFF8E7]/25 focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#FFF8E7]/70 text-sm font-medium mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-[#1a0a00]/60 border border-[#FFF8E7]/15 rounded-lg text-[#FFF8E7] placeholder:text-[#FFF8E7]/25 focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#FFF8E7]/70 text-sm font-medium mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-[#1a0a00]/60 border border-[#FFF8E7]/15 rounded-lg text-[#FFF8E7] placeholder:text-[#FFF8E7]/25 focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#FFF8E7]/70 text-sm font-medium mb-2">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, Apt 4B, New York, NY 10001"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1a0a00]/60 border border-[#FFF8E7]/15 rounded-lg text-[#FFF8E7] placeholder:text-[#FFF8E7]/25 focus:outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-6 py-3 border border-[#D4A843]/30 text-[#D4A843] font-medium rounded-lg hover:bg-[#D4A843]/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3}
                  className="w-full sm:w-auto px-8 py-3 bg-[#D4A843] text-[#1a0a00] font-bold rounded-lg hover:bg-[#c49a3a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next: Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Pay */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#D4A843] mb-2">
                Review Your Subscription
              </h2>
              <p className="text-[#FFF8E7]/60 mb-8">
                Double-check everything before proceeding to payment.
              </p>

              {/* Selected Schedule */}
              <div className="bg-[#1a0a00]/60 border border-[#FFF8E7]/10 rounded-xl p-5 mb-5">
                <h3 className="text-[#D4A843] font-semibold mb-4 text-sm uppercase tracking-wider">
                  Delivery Schedule
                </h3>
                <div className="space-y-3">
                  {selectedDays.map(({ day, meals }) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[#FFF8E7] font-medium">{day}</span>
                      <div className="flex gap-2 flex-wrap">
                        {meals.map((meal) => (
                          <span
                            key={meal}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30"
                          >
                            {meal === "lunch"
                              ? "Lunch (1:00 PM)"
                              : "Dinner (7:00 PM)"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration & Price */}
              <div className="bg-[#1a0a00]/60 border border-[#FFF8E7]/10 rounded-xl p-5 mb-5">
                <h3 className="text-[#D4A843] font-semibold mb-4 text-sm uppercase tracking-wider">
                  Price Breakdown
                </h3>
                <div className="space-y-2 text-[#FFF8E7]/70 text-sm">
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-[#FFF8E7]">
                      {weeks} week{weeks !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meals per week</span>
                    <span className="text-[#FFF8E7]">
                      {totalMealsPerWeek}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total meals</span>
                    <span className="text-[#FFF8E7]">{totalMeals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per meal</span>
                    <span className="text-[#FFF8E7]">
                      {formatCurrency(MEAL_PRICE)}
                    </span>
                  </div>
                  <div className="border-t border-[#FFF8E7]/10 pt-3 mt-3 flex justify-between">
                    <span className="text-[#D4A843] font-bold text-base">
                      Total Amount
                    </span>
                    <span className="text-[#D4A843] font-bold text-xl">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-[#1a0a00]/60 border border-[#FFF8E7]/10 rounded-xl p-5 mb-5">
                <h3 className="text-[#D4A843] font-semibold mb-4 text-sm uppercase tracking-wider">
                  Delivery Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#FFF8E7]/50">Name</span>
                    <span className="text-[#FFF8E7]">{name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#FFF8E7]/50">Email</span>
                    <span className="text-[#FFF8E7] text-right break-all">{email}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#FFF8E7]/50">Phone</span>
                    <span className="text-[#FFF8E7] text-right break-all">{phone}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#FFF8E7]/50">Address</span>
                    <span className="text-[#FFF8E7] text-right max-w-[70%] break-words">
                      {address}
                    </span>
                  </div>
                </div>
              </div>

              {/* 24-Hour Notice */}
              <div className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-xl p-4 mb-8 flex gap-3">
                <svg
                  className="w-6 h-6 text-[#D4A843] flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-[#D4A843] font-semibold text-sm">
                    24-Hour Activation Notice
                  </p>
                  <p className="text-[#FFF8E7]/60 text-sm mt-1">
                    Your subscription will be activated 24 hours after purchase.
                    Orders must be placed at least 24 hours before delivery time.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto px-6 py-3 border border-[#D4A843]/30 text-[#D4A843] font-medium rounded-lg hover:bg-[#D4A843]/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-[#D4A843] text-[#1a0a00] font-bold rounded-lg hover:bg-[#c49a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Pay with Stripe &mdash; {formatCurrency(totalPrice)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
