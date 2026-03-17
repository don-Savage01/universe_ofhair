import { calculateDeliveryDates } from "./utils";

interface ShippingSectionProps {
  formData: {
    shippingFee: string;
  };
  handleChange: (
    e: React.ChangeEvent
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function ShippingSection({
  formData,
  handleChange,
}: ShippingSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Fee (₦)
          </label>
          <input
            type="text"
            name="shippingFee"
            value={formData.shippingFee}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="2,500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Dates
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Auto-calculated for customers at the time they view the product. Always shows 5–10 days from today.
          </p>
        </div>
      </div>
    </div>
  );
}