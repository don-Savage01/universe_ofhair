"use client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ContactFooter from "@/app/contact/ContactFooter";
export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Send to your API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Success
      setIsSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        topic: "",
        message: "",
      });

      // Redirect to home after 5 seconds
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="bg-green-100 text-green-800 p-6 rounded-lg">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-2">
              Message Sent Successfully!
            </h1>
            <p className="mb-4">
              Thank you for contacting Hair Universe. We&apos;ll get back to you
              soon.
            </p>
            <p className="text-sm text-gray-600">
              You will be redirected to the home page in 5 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="w-full p-2 text-white bg-pink-300 shadow-lg">
        <div className="max-w-7xl mx-auto pl-3 md:pl-4">
          <div className="pt-1">
            <div className="flex flex-col items-start">
              <span className="font-abyssinica text-xl md:text-2xl text-white font-bold leading-none mb-0.5">
                HAIR
              </span>
              <span className="font-akronim text-2xl md:text-4xl text-white font-bold -ml-1 leading-none">
                Universe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-7 md:py-12 bg-pink-100">
        <div className="w-full max-w-2xl mx-auto">
          {/* Contact Us Title */}
          <h1 className="text-3xl md:text-4xl text-left font-bold text-gray-600 mb-4 pl-1">
            Contact Us
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Please try again or email us directly at{" "}
                <a
                  href="mailto:contact@hairuniverse.com"
                  className="underline font-medium"
                >
                  contact@hairuniverse.com
                </a>
              </p>
            </div>
          )}

          {/* Form with pink border */}
          <div className="border-2 border-pink-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name *"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name *"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* EMAIL - Full width */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition disabled:opacity-50"
                />
              </div>

              {/* PHONE - Full width */}
              <div>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="NG"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={isSubmitting}
                  className="custom-phone-input w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition disabled:opacity-50"
                  placeholder="Phone Number"
                />
              </div>

              {/* TOPIC - Full width */}
              <div>
                <select
                  name="topic"
                  required
                  value={formData.topic}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition disabled:opacity-50"
                >
                  <option value="">Select a topic *</option>
                  <option value="custom-order">Custom Hair Order</option>
                  <option value="bespoke-styling">
                    Bespoke Hair Styling & Install
                  </option>
                  <option value="closure-inquiry">
                    Closure/Closures Inquiry
                  </option>
                  <option value="hair-maintenance">
                    Hair Care & Maintenance Session
                  </option>
                  <option value="wholesale">Wholesale/Bulk Order</option>
                  <option value="samples">Request Samples</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership/Collaboration</option>
                  <option value="custom-request">Others</option>
                </select>
              </div>

              {/* MESSAGE - Full width */}
              <div>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Write your message or let us know if you have any special requests... *"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition disabled:opacity-50"
                />
              </div>

              {/* ACTIONS */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 md:w-1/3 py-2.5 text-white rounded-lg text-lg font-medium disabled:opacity-50 bg-pink-400 hover:bg-pink-500 transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ContactFooter />
    </div>
  );
}
