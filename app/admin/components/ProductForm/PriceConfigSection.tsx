interface PriceConfigSectionProps {
  formData: {
    price: string;
    originalPrice: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  enableLengthOptions: boolean;
  setEnableLengthOptions: (value: boolean) => void;
  // 🔥 NEW PROPS
  desiredAmount: number;
  setDesiredAmount: (value: number) => void;
  showFeeCalculator: boolean;
  setShowFeeCalculator: (value: boolean) => void;
}

export default function PriceConfigSection({
  formData,
  handleChange,
  enableLengthOptions,
  setEnableLengthOptions,
  // 🔥 NEW PROPS
  desiredAmount,
  setDesiredAmount,
  showFeeCalculator,
  setShowFeeCalculator,
}: PriceConfigSectionProps) {
  // 🔥 SIMPLE FEE CALCULATION - ONLY RETURNS THE FINAL AMOUNT
  const calculateFinalAmount = (amount: number): number => {
    const PERCENTAGE_RATE = 0.015; // 1.5%
    const FLAT_FEE = 100;
    const FLAT_FEE_THRESHOLD = 2500;
    const FEE_CAP = 2000;

    if (amount < FLAT_FEE_THRESHOLD) {
      const finalAmount = amount / (1 - PERCENTAGE_RATE) + 0.01;
      return Math.ceil(finalAmount);
    } else {
      const finalAmount = (amount + FLAT_FEE) / (1 - PERCENTAGE_RATE) + 0.01;
      let totalFee = finalAmount * PERCENTAGE_RATE + FLAT_FEE;

      if (totalFee > FEE_CAP) {
        return amount + FEE_CAP;
      }

      return Math.ceil(finalAmount);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Toggle to enable length options:
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableLengthOptions}
              onChange={() => setEnableLengthOptions(!enableLengthOptions)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>
      </div>

      {!enableLengthOptions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₦) *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={(e) => {
                handleChange(e);
                const numericValue =
                  parseFloat(e.target.value.replace(/[^\d.]/g, "")) || 0;
                setDesiredAmount(numericValue);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
              placeholder="25,000"
            />

            {/* 🔥 SIMPLE FEE CALCULATOR - JUST THE NUMBER */}
            {desiredAmount > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    Customer pays:
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    ₦{calculateFinalAmount(desiredAmount).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  Including Paystack charges
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (₦) - Optional
            </label>
            <input
              type="text"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Length options are enabled. Base price will be automatically
            determined from the first length option.
          </p>
        </div>
      )}
    </div>
  );
}
