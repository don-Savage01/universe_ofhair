"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TeamMemberFormProps {
  member?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TeamMemberForm({
  member,
  onClose,
  onSuccess,
}: TeamMemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    display_order: 0,
    is_active: true,
    image_url: "",
  });

  // Initialize form if editing
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        description: member.description || "",
        display_order: member.display_order || 0,
        is_active: member.is_active,
        image_url: member.image_url || "",
      });
      if (member.image_url) {
        setImagePreview(member.image_url);
      }
    } else {
      // Set default order for new member
      setFormData((prev) => ({ ...prev, display_order: 1 }));
    }
  }, [member]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a JPG, PNG, WebP, or HEIC image");
      return;
    }

    // 2. Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // 3. Show preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // 🔐 4. SIMPLE AUTH CHECK: Is user logged into Supabase?
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in as admin to upload images");
      return;
    }

    // 5. Upload to Supabase Storage
    try {
      setIsLoading(true);
      setUploadProgress(0);

      // FIX: If editing and has old image, delete it first
      if (member && member.image_url) {
        try {
          // Extract filename from URL
          const oldFileName = member.image_url.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("team").remove([oldFileName]);
            console.log("Old image deleted:", oldFileName);
          }
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
          // Continue even if delete fails
        }
      }

      // Generate safe filename
      let fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

      // Convert HEIC to JPG in extension
      if (fileExt === "heic" || fileExt === "heif") {
        fileExt = "jpg";
      }

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Set correct content type
      let contentType = file.type;
      if (file.type === "image/heic" || file.type === "image/heif") {
        contentType = "image/jpeg";
      }

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // UPLOAD
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("team")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        });

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("team")
        .getPublicUrl(filePath);

      // Update form with new URL
      setFormData((prev) => ({
        ...prev,
        image_url: urlData.publicUrl,
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setImagePreview(null);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error("Name and role are required");
      return;
    }

    try {
      setIsLoading(true);

      if (member) {
        // Update existing member
        const { error } = await supabase
          .from("team_members")
          .update({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            display_order: formData.display_order,
            is_active: formData.is_active,
            image_url: formData.image_url,
          })
          .eq("id", member.id);

        if (error) throw error;
        toast.success("Team member updated successfully!");
      } else {
        // Create new member
        const { error } = await supabase.from("team_members").insert([
          {
            name: formData.name,
            role: formData.role,
            description: formData.description,
            display_order: formData.display_order,
            is_active: formData.is_active,
            image_url: formData.image_url,
          },
        ]);

        if (error) throw error;
        toast.success("Team member added successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "display_order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {member ? "Edit Team Member" : "Add Team Member"}
          </h2>
          <p className="text-gray-600 text-sm">
            {member
              ? "Update team member details"
              : "Add a new team member to your salon"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>

          <div className="flex flex-col items-center justify-center">
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 rounded-lg object-cover border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, image_url: "" }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4 bg-gray-50">
                <span className="text-4xl mb-2">👤</span>
                <span className="text-gray-500 text-sm">Upload photo</span>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full max-w-xs mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm">
                {imagePreview ? "Change Photo" : "Upload Photo"}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, WebP, HEIC up to 5MB. Recommended: Square photo (1:1
              ratio)
            </p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Enter team member name"
            required
            disabled={isLoading}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="e.g., Lead Stylist, Barber, etc."
            required
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Brief description about this team member"
            disabled={isLoading}
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Order in which to display (lower number appears first)"
            disabled={isLoading}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleCheckboxChange}
            id="is_active"
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
            Active (show on website)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-2 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {member ? "Updating..." : "Saving..."}
              </span>
            ) : member ? (
              "Update Team Member"
            ) : (
              "Add Team Member"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
