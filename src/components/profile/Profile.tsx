import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Full Name</div>
          <div className="mt-1 font-medium">John Doe</div>
        </div>
        <div className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="text-sm text-gray-500">Phone</div>
          <div className="mt-1 font-medium">+255 700 000 000</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


