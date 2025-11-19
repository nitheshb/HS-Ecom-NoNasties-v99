'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-8">Settings</h1>

          {/* Coming Soon Message */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-xl text-gray-600">Settings page coming soon</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

