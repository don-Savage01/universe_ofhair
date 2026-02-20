// app/admin/team/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import TeamMemberForm from "../components/TeamMemberForm";
import { toast, Toaster } from "react-hot-toast";
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch team members
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Team member deleted successfully");
      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ is_active: !member.is_active })
        .eq("id", member.id);

      if (error) throw error;

      toast.success(
        `Team member ${!member.is_active ? "activated" : "deactivated"}`,
      );
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditingMember(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    fetchTeamMembers();
    handleFormClose();
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
          <p className="text-gray-600 mb-4">Manage your salon team</p>
          {/* Moved button below the paragraph */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <span className="text-xl mr-2">+</span>
            Add Team Member
          </button>
        </div>
      </div>

      {/* Team Member Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TeamMemberForm
              member={editingMember}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Team Members Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first team member to get started
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Add Your First Team Member
          </button>
        </div>
      ) : (
        /* Team Members Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                !member.is_active ? "opacity-60" : ""
              }`}
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-100">
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {member.name}
                    </h3>
                    <p className="text-pink-600 font-medium">{member.role}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Order: {member.display_order}
                  </div>
                </div>

                {member.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {member.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleActive(member)}
                    className="flex-1 flex items-center justify-center py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
                    title={member.is_active ? "Deactivate" : "Activate"}
                  >
                    {member.is_active ? (
                      <>
                        <EyeSlashIcon className="w-4 h-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 flex items-center justify-center py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="flex-1 flex items-center justify-center py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
