interface DealTextSectionProps {
  formData: {
    dealLeftText: string;
    dealRightText: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function DealTextSection({
  formData,
  handleChange,
}: DealTextSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Left Deal Text
          </label>
          <input
            type="text"
            name="dealLeftText"
            value={formData.dealLeftText}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="SUPER DEAL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Right Deal Text
          </label>
          <input
            type="text"
            name="dealRightText"
            value={formData.dealRightText}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="LIMITED OFFER"
          />
        </div>
      </div>
    </div>
  );
}
