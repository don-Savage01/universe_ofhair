import {
  DensityOption,
  LengthOption,
  makeLengthId,
} from "@/app/shop/components/types";
import { useState, useEffect } from "react";

interface DensityOptionsSectionProps {
  densityOptions: DensityOption[];
  lengthOptions: LengthOption[];
  addDensityOption: () => void;
  updateDensityOption: (
    index: number,
    field: keyof DensityOption,
    value: any,
  ) => void;
  removeDensityOption: (index: number) => void;
  isDuplicate: (type: "density", value: string, index: number) => boolean;
}

function DensityPriceMatrix({
  densityIndex,
  densityOption,
  lengthOptions,
  onUpdatePrice,
}: {
  densityIndex: number;
  densityOption: DensityOption;
  lengthOptions: LengthOption[];
  onUpdatePrice: (
    densityIndex: number,
    lengthId: string,
    price: number,
  ) => void;
}) {
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const [displayValues, setDisplayValues] = useState<Record<string, string>>(
    () => {
      const initialValues: Record<string, string> = {};
      lengthOptions.forEach((length) => {
        const lengthId = length.id || makeLengthId(length.value);
        const priceEntry = densityOption.prices?.find(
          (p) => p.lengthId === lengthId || p.lengthValue === length.value,
        );
        if (priceEntry?.price) {
          initialValues[lengthId] = formatNumber(priceEntry.price);
        }
      });
      return initialValues;
    },
  );

  // Re-sync display values when prices are initialized/updated by the parent
  useEffect(() => {
    setDisplayValues(() => {
      const values: Record<string, string> = {};
      lengthOptions.forEach((length) => {
        const lengthId = length.id || makeLengthId(length.value);
        const priceEntry = densityOption.prices?.find(
          (p) => p.lengthId === lengthId || p.lengthValue === length.value,
        );
        if (priceEntry?.price) {
          values[lengthId] = formatNumber(priceEntry.price);
        }
      });
      return values;
    });
  }, [densityOption.prices, lengthOptions]);

  const handlePriceChange = (lengthId: string, value: string) => {
    const rawNumbers = value.replace(/[^0-9]/g, "");
    if (rawNumbers === "") {
      setDisplayValues((prev) => {
        const newState = { ...prev };
        delete newState[lengthId];
        return newState;
      });
    } else {
      const numericValue = parseInt(rawNumbers, 10);
      const formattedValue = formatNumber(numericValue);
      setDisplayValues((prev) => ({ ...prev, [lengthId]: formattedValue }));
      onUpdatePrice(densityIndex, lengthId, numericValue);
    }
  };

  const getDisplayValue = (lengthId: string) => displayValues[lengthId] || "";

  return (
    <div className="mt-6 overflow-hidden bg-white">
      <div className="bg-purple-50 px-4 py-3 border-b">
        <h5 className="font-medium text-purple-900">
          Set prices for {densityOption.label || "this density"}
        </h5>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Length
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Base Price
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                {densityOption.value || "Density"} Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lengthOptions.map((length) => {
              const lengthId = length.id || makeLengthId(length.value);
              return (
                <tr key={lengthId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{length.label}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ₦{formatNumber(length.price)}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={getDisplayValue(lengthId)}
                      onChange={(e) =>
                        handlePriceChange(lengthId, e.target.value)
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-sm"
                      placeholder="Enter price"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-1 py-2 text-xs text-gray-500 border-t">
        These prices will override the base price when this density is selected
      </div>
    </div>
  );
}

export default function DensityOptionsSection({
  densityOptions,
  lengthOptions,
  addDensityOption,
  updateDensityOption,
  removeDensityOption,
  isDuplicate,
}: DensityOptionsSectionProps) {
  // Initialize prices for any density that doesn't have them yet
  useEffect(() => {
    densityOptions.forEach((option, index) => {
      if (option.prices && option.prices.length > 0) return;
      const initialPrices = lengthOptions.map((length) => ({
        lengthId: length.id || makeLengthId(length.value),
        lengthValue: length.value,
        price: length.price,
      }));
      updateDensityOption(index, "prices", initialPrices);
    });
  }, [densityOptions.length, lengthOptions]);

  const handleDensityValueChange = (index: number, inputValue: string) => {
    const numbersOnly = inputValue.replace(/[^0-9]/g, "");
    if (numbersOnly === "") {
      updateDensityOption(index, "value", "");
    } else {
      updateDensityOption(index, "value", `${numbersOnly}%`);
    }
  };

  const handleUpdatePrice = (
    densityIndex: number,
    lengthId: string,
    price: number,
  ) => {
    const option = densityOptions[densityIndex];
    const currentPrices = option.prices || [];
    const existingIndex = currentPrices.findIndex(
      (p) => p.lengthId === lengthId,
    );
    let newPrices;

    if (existingIndex >= 0) {
      newPrices = currentPrices.map((p, i) =>
        i === existingIndex ? { ...p, price } : p,
      );
    } else {
      const length = lengthOptions.find(
        (l) => (l.id || makeLengthId(l.value)) === lengthId,
      );
      newPrices = [
        ...currentPrices,
        { lengthId, lengthValue: length?.value || "", price },
      ];
    }

    updateDensityOption(densityIndex, "prices", newPrices);
  };

  const getDisplayValue = (value: string) => {
    if (!value) return "";
    return value.replace("%", "");
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Density Options
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            First: Base price | Others: Set specific prices for each length
          </p>
        </div>
      </div>

      {densityOptions.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No density options added</p>
          <p className="text-sm text-gray-400 mt-1">
            Density options will not be shown on product page
          </p>
          <button
            type="button"
            onClick={addDensityOption}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium w-3/4 min-w-[200px] mx-auto block"
          >
            + Add Density Option
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {densityOptions.map((option, index) => {
            const isDuplicateValue =
              option.value &&
              option.value.trim() !== "" &&
              isDuplicate("density", option.value, index);

            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">
                    Density Option {index + 1}{" "}
                    {index === 0 && "(Default/Base Price)"}
                  </h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeDensityOption(index)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Density Value
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={getDisplayValue(option.value)}
                        onChange={(e) =>
                          handleDensityValueChange(index, e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDuplicateValue
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter percentage (e.g., 150)"
                        pattern="[0-9]*"
                        inputMode="numeric"
                      />
                      <span className="ml-2 text-gray-600">%</span>
                    </div>
                    {isDuplicateValue && (
                      <p className="text-xs text-red-500 mt-1">
                        Duplicate density value!
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={option.label || ""}
                      onChange={(e) =>
                        updateDensityOption(index, "label", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 150% Density"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {option.value && option.value.trim() !== ""
                        ? "Auto-generated from density value, but you can customize it"
                        : "Enter a density value first"}
                    </p>
                  </div>
                </div>

                {index > 0 && lengthOptions.length > 0 && (
                  <DensityPriceMatrix
                    densityIndex={index}
                    densityOption={option}
                    lengthOptions={lengthOptions}
                    onUpdatePrice={handleUpdatePrice}
                  />
                )}

                {index === 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Base Density:</span> Uses
                      the prices set in Length Options. No additional charge.
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addDensityOption}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium w-full md:w-3/4 mx-auto block"
          >
            + Add Another Density Option
          </button>
        </div>
      )}
    </div>
  );
}
