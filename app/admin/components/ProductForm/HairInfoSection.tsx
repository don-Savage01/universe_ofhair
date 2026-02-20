interface HairInfoSectionProps {
  formData: {
    hairInfo: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function HairInfoSection({
  formData,
  handleChange,
}: HairInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Description
        </label>
        <textarea
          name="hairInfo"
          value={formData.hairInfo}
          onChange={handleChange}
          rows={4}
          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Give description about the product..."
          required
        />
      </div>
    </div>
  );
}
