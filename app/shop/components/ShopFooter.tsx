// app/shop/components/ShopFooter.tsx
"use client";

export default function ShopFooter() {
  // Generate WhatsApp message for consultation
  const generateConsultationMessage = () => {
    const phoneNumber = "2347046212735"; // Consultation number
    const message = `Hello HAIR Universe! 👋

I need help choosing the right wig/hair product.

Can you help me with recommendations based on:
• My face shape and skin tone
• My lifestyle and budget
• The look I want to achieve
• Specific need: [Please specify any special requirements]

Please advise what would work best for me. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  // Generate WhatsApp message for support
  const generateSupportMessage = () => {
    const phoneNumber = "2349075361085"; // Support number
    const message = `Hello HAIR Universe Support! 👋

I need assistance with:
[Please describe your issue or question]

Thank you for your help!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  // Handle consultation click
  const handleConsultationClick = () => {
    const whatsappUrl = generateConsultationMessage();
    window.open(whatsappUrl, "_blank");
  };

  // Handle support click
  const handleSupportClick = () => {
    const whatsappUrl = generateSupportMessage();
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-500 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-pink-100 mb-8">
            Our hair experts are here to help you find the perfect match for
            your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleConsultationClick}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Book a Consultation
            </button>
            <button
              onClick={handleSupportClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
