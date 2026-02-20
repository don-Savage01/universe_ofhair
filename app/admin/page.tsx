"use client";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to Hair Universe Admin Panel</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-700">
          Dashboard is ready. Click on Products in the sidebar to manage your
          products.
        </p>
      </div>
    </div>
  );
}
