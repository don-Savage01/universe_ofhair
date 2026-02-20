import StarRatingSelector from "./StarRatingSelector";

interface BasicInfoSectionProps {
  formData: {
    name: string;
    description: string;
    category: string;
    inStock: boolean;
    rating: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  StarRatingSelector: React.ComponentType<{
    rating: string;
    setRating: (rating: string) => void;
  }>;
}

export default function BasicInfoSection({
  formData,
  handleChange,
  StarRatingSelector: StarRatingComponent,
}: BasicInfoSectionProps) {
  // ✅ Properly capitalized categories
  const categories = [
    "Wigs",
    "Beauty & Cosmetics",
    "Skincare",
    "Hair & Wigs",
    "Jewelry & Accessories",
    "Fashion & Clothing",
    "Gadgets",
    "Appliances",
    "Hair & Beauty Tools",
    "Personal Care",
    "Bags & Luggage",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
            placeholder="e.g.. Brazillian Hair"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          >
            <option value="">-- Select a category --</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} {/* Already properly capitalized */}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This category will appear in your shop&apos;s filter
          </p>
        </div>
      </div>

      {formData.category && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Selected category:</span>{" "}
            {formData.category}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <StarRatingComponent
          rating={formData.rating}
          setRating={(rating) =>
            handleChange({
              target: { name: "rating", value: rating },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="inStock"
          name="inStock"
          checked={formData.inStock}
          onChange={handleChange}
          className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
        />
        <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
          Product is in stock
        </label>
        <p className="text-xs text-gray-500">(Uncheck = out of stock)</p>
      </div>
    </div>
  );
}
