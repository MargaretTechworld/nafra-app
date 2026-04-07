import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Shield, Pencil, Trash2, X, Plus,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField } from '../../ui/form-elements';
import { useListUsersQuery } from '../../../app/api/apiSlice';

const AdminCard = ({ admin }) => {
  const joinedDate = admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A';

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{admin.name}</h3>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
              {admin.role}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </p>
              <p className="text-sm font-medium text-gray-900">{admin.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Joined
              </p>
              <p className="text-sm font-medium text-gray-900">{joinedDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          className="flex items-center justify-center px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

AdminCard.propTypes = {
  admin: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    created_at: PropTypes.string,
  }).isRequired,
};

const CreateAdminModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Create New Admin</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a new administrator account with full system access
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <InputField label="Full Name *" placeholder="John Doe" />
          <InputField label="Email *" placeholder="admin@example.com" type="email" />
          <InputField label="Password *" placeholder="Minimum 8 characters" type="password" />
          <InputField label="Confirm Password *" placeholder="Confirm password" type="password" />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            Create Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

CreateAdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const AdminsView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: users, isLoading, error } = useListUsersQuery();

  const admins = (users || []).filter((u) => u.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Admins</h2>
          <p className="text-gray-500 mt-2">View and manage system administrators</p>
        </div>
        <Button
          className="bg-gray-900 hover:bg-gray-800 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </header>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
      {error && !isLoading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center">
          Failed to load administrators. Please try again.
        </div>
      )}
      {!isLoading && !error && admins.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-20 text-center text-gray-400">
          <p className="text-lg">No administrators found.</p>
        </div>
      )}
      {!isLoading && !error && admins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <AdminCard key={admin.id} admin={admin} />
          ))}
        </div>
      )}

      <CreateAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AdminsView;
