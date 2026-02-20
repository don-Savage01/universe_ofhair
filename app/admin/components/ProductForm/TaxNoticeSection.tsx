interface TaxNoticeSectionProps {
  formData: {
    taxNotice: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function TaxNoticeSection({
  formData,
  handleChange,
}: TaxNoticeSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tax Notice Text
        </label>
        <input
          type="text"
          name="taxNotice"
          value={formData.taxNotice}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="Tax excluded, add at checkout if applicable"
        />
      </div>
    </div>
  );
}
