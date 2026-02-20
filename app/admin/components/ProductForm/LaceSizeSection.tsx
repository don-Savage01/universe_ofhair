import { LaceSizeOption } from "@/app/shop/components/types";

interface LaceSizeSectionProps {
  formData: {
    laceLabel: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  laceSizeOptions: LaceSizeOption[];
  addLaceSizeOption: () => void;
  updateLaceSizeOption: (
    index: number,
    field: keyof LaceSizeOption,
    value: any,
  ) => void;
  removeLaceSizeOption: (index: number) => void;
  isDuplicate: (type: "lace", value: string, index: number) => boolean;
  formatNumberWithCommas: (value: string | number) => string;
}

export default function LaceSizeSection({
  formData,
  handleChange,
  laceSizeOptions,
  addLaceSizeOption,
  updateLaceSizeOption,
  removeLaceSizeOption,
  isDuplicate,
  formatNumberWithCommas,
}: LaceSizeSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Lace Size Options
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            First: Base price | Others: +Extra
          </p>
        </div>
      </div>

      {/* Custom Lace Label Input - ONLY SHOW IF LACE OPTIONS EXIST */}
      {laceSizeOptions.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <input
            type="text"
            name="laceLabel"
            value={formData.laceLabel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Lace wig, Cap size, Lace type"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be displayed on product page.
          </p>
        </div>
      )}

      {laceSizeOptions.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No lace size options added</p>
          <p className="text-sm text-gray-400 mt-1">
            Lace size options will not be shown on product page
          </p>
          {/* Moved and wider button */}
          <button
            type="button"
            onClick={addLaceSizeOption}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium w-3/4 min-w-[200px] mx-auto block"
          >
            + Add Lace Size Option
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {laceSizeOptions.map((option, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">
                  Lace Size {index + 1} {index === 0 && "(Default/Base Price)"}
                </h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeLaceSizeOption(index)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value (e.g., 13x4)
                  </label>
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) =>
                      updateLaceSizeOption(index, "value", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDuplicate("lace", option.value, index)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="13x4"
                  />
                  {isDuplicate("lace", option.value, index) && (
                    <p className="text-xs text-red-500 mt-1">
                      Duplicate value!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      updateLaceSizeOption(index, "label", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="13x4 Lace Wig"
                  />
                </div>
              </div>

              {/* PRICE FIELD - Different behavior for first vs additional options */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {index === 0 ? <>Base Price</> : <>Additional Price (₦)</>}
                </label>

                {index === 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-700 font-medium">
                        Default Price
                      </span>
                      <span className="text-blue-600">
                        No additional charge
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center">
                      <span className="absolute left-3 text-gray-500">₦</span>
                      <input
                        type="text"
                        value={formatNumberWithCommas(
                          option.priceMultiplier || 0,
                        )}
                        onChange={(e) => {
                          // Remove commas for storage
                          const numericValue = e.target.value.replace(/,/g, "");

                          // Convert to NUMBER, not string
                          updateLaceSizeOption(
                            index,
                            "priceMultiplier",
                            numericValue === "" ? 0 : Number(numericValue),
                          );
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="5,000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This amount will be added to the base product price
                    </p>
                  </div>
                )}

                {index === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    This is the default/base price option. No extra charge will
                    be added.
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* ADD MORE BUTTON at bottom - Wider */}
          <button
            type="button"
            onClick={addLaceSizeOption}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium w-full md:w-3/4 mx-auto block"
          >
            + Add Another Lace Size
          </button>
        </div>
      )}
    </div>
  );
}
