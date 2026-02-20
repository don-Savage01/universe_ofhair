"use client";

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, Admin</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
