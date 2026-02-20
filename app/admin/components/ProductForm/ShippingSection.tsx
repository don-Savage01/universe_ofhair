import { calculateDeliveryDates } from "./utils";

interface ShippingSectionProps {
  formData: {
    shippingFee: string;
    deliveryText: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function ShippingSection({
  formData,
  handleChange,
  setFormData,
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
          <div className="space-y-2">
            <input
              type="text"
              name="deliveryText"
              value={formData.deliveryText}
              readOnly={true} // ✅ FIXED: Use boolean true instead of just "readOnly"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              placeholder="Auto-calculated delivery window"
            />
            <p className="text-xs text-gray-500">
              Automatically calculated: 5-10 days from today
            </p>
            <button
              type="button"
              onClick={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  deliveryText: calculateDeliveryDates(),
                }))
              }
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ↻ Refresh delivery dates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
