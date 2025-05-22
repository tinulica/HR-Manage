// src/pages/CreateOrganizationPage.jsx
import { CreateOrganization } from "@clerk/clerk-react";

export default function CreateOrganizationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 bg-white rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-center">Create Your Organization</h2>
        <CreateOrganization />
      </div>
    </div>
  );
}
