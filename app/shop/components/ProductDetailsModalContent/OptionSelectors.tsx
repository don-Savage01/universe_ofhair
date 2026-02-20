"use client";

import { LengthOption, LaceSizeOption } from "./ProductDetailsModalContent";

interface OptionSelectorsProps {
  selectedLength: string;
  selectedDensity: string;
  selectedLaceSize: string;
  isOutOfStock: boolean;
  hasLengthOptions: boolean;
  hasDensityOptions: boolean;
  hasLaceSizeOptions: boolean;
  lengthOptions: LengthOption[];
  densityOptions: string[];
  laceSizeOptions: LaceSizeOption[];
  laceLabel: string;
  onLengthSelect: (value: string) => void;
  onDensitySelect: (value: string) => void;
  onLaceSizeSelect: (value: string) => void;
}

export default function OptionSelectors({
  selectedLength,
  selectedDensity,
  selectedLaceSize,
  isOutOfStock,
  hasLengthOptions,
  hasDensityOptions,
  hasLaceSizeOptions,
  lengthOptions,
  densityOptions,
  laceSizeOptions,
  laceLabel,
  onLengthSelect,
  onDensitySelect,
  onLaceSizeSelect,
}: OptionSelectorsProps) {
  return (
    <>
      {hasLengthOptions && (
        <div className="mb-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-gray-800">
              Stretched length:{" "}
              <span className="text-gray-800 font-medium">
                {selectedLength
                  ? `${selectedLength.replace("inch", "").trim()} inches`
                  : "Select length"}
              </span>
            </h3>
          </div>
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <div className="flex space-x-2 min-w-max">
                {lengthOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onLengthSelect(option.value)}
                    className={`px-2 py-1.5 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                      selectedLength === option.value
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                        : "border-gray-200 hover:border-green-300 hover:bg-pink-25"
                    } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isOutOfStock}
                  >
                    <div className="text-center font-sans font-medium">
                      {option.label || option.value}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasDensityOptions && densityOptions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-light text-gray-800">
              Density:{" "}
              <span className="text-black font-medium font-sans">
                {selectedDensity && selectedDensity.trim() !== ""
                  ? selectedDensity
                  : "Select density"}
              </span>
            </h3>
          </div>
          {/* FIX: Added overflow container with horizontal scroll */}
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex space-x-2 min-w-max">
              {densityOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onDensitySelect(option)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                    selectedDensity === option ||
                    (!selectedDensity && option === densityOptions[0])
                      ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-25"
                  } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isOutOfStock}
                >
                  <div className="text-center font-medium">{option}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasLaceSizeOptions && laceLabel && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-gray-800">
              {laceLabel}:{" "}
              <span className="text-gray-800 font-medium">
                {selectedLaceSize || `Select ${laceLabel.toLowerCase()}`}
              </span>
            </h3>
          </div>
          {/* FIX: Added overflow container with horizontal scroll */}
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex space-x-2 min-w-max">
              {laceSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onLaceSizeSelect(option.value)}
                  className={`px-2 py-1.5 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                    selectedLaceSize === option.value
                      ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-25"
                  } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isOutOfStock}
                >
                  <div className="text-center font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
