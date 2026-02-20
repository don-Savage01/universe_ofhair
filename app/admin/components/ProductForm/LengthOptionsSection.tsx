import { LengthOption, LaceSizeOption } from "@/app/shop/components/types";
import { useState } from "react";

interface LengthOptionsSectionProps {
  lengthOptions: LengthOption[];
  addLengthOption: () => void;
  updateLengthOption: (
    index: number,
    field: keyof LengthOption,
    value: any,
  ) => void;
  removeLengthOption: (index: number) => void;
  laceSizeOptions: LaceSizeOption[];
  isDuplicate: (type: "length", value: string, index: number) => boolean;
  formatNumberWithCommas: (value: string | number) => string;
}

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

export default function LengthOptionsSection({
  lengthOptions,
  addLengthOption,
  updateLengthOption,
  removeLengthOption,
  laceSizeOptions,
  isDuplicate,
  formatNumberWithCommas,
}: LengthOptionsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Length Options
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Each length has its own price
          </p>
        </div>
      </div>

      {lengthOptions.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No length options added</p>
          <p className="text-sm text-gray-400 mt-1">
            Add at least one length option
          </p>
          <button
            type="button"
            onClick={addLengthOption}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium w-3/4 min-w-[200px] mx-auto block"
          >
            + Add Length Option
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lengthOptions.map((option, index) => {
            // ✅ Check if this value is a duplicate
            const isDuplicateValue = isDuplicate("length", option.value, index);

            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">
                    Length Option {index + 1}{" "}
                    {index === 0 && "(Default/Base Price)"}
                  </h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLengthOption(index)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length Value (number only)
                    </label>
                    <input
                      type="text"
                      value={option.value.replace(/inches?$/i, "")} // Remove "inches" if present
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          "",
                        ); // Only allow numbers
                        updateLengthOption(index, "value", numericValue);
                        // Auto-update label if it matches the pattern
                        if (
                          option.label === `${option.value}inches` ||
                          option.label === `${option.value} inches`
                        ) {
                          updateLengthOption(
                            index,
                            "label",
                            numericValue ? `${numericValue} inches` : "",
                          );
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDuplicateValue
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 14"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    {/* ✅ Show duplicate warning message */}
                    {isDuplicateValue && (
                      <p className="text-xs text-red-500 mt-1">
                        Duplicate Value!
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Numbers only</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) =>
                        updateLengthOption(index, "label", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDuplicateValue
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 14 inches"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₦) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        ₦
                      </span>
                      <input
                        type="text"
                        value={formatNumberWithCommas(option.price)}
                        onChange={(e) => {
                          updateLengthOption(index, "price", e.target.value);
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        required
                        placeholder="25,000"
                      />
                    </div>

                    {/* 🔥 SIMPLE FEE CALCULATOR - JUST THE NUMBER */}
                    {option.price > 0 && (
                      <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <span className="text-xs font-medium text-gray-700">
                          Customer pays:
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          ₦{calculateFinalAmount(option.price).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (₦) - Optional
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        ₦
                      </span>
                      <input
                        type="text"
                        value={
                          option.originalPrice
                            ? formatNumberWithCommas(option.originalPrice)
                            : ""
                        }
                        onChange={(e) =>
                          updateLengthOption(
                            index,
                            "originalPrice",
                            e.target.value,
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addLengthOption}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium w-full md:w-3/4 mx-auto block"
          >
            + Add Another Length Option
          </button>
        </div>
      )}
    </div>
  );
}
