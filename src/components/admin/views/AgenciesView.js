import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Pencil,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField } from '../../ui/form-elements';

const AgencyCard = ({ agency }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{agency.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{agency.description}</p>
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Edit agency"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          aria-label="Delete agency"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Ministry
      </p>
      <p className="font-medium text-gray-900">{agency.ministry}</p>
    </div>

    <div className="pt-6 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Associated User
      </p>
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
          {agency.user.initials}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{agency.user.name}</p>
          <p className="text-xs text-gray-500">{agency.user.email}</p>
        </div>
      </div>
    </div>
  </div>
);

AgencyCard.propTypes = {
  agency: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    ministry: PropTypes.string.isRequired,
    user: PropTypes.shape({
      initials: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const CreateAgencyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Create New Agency</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a new agency with an associated user account. All fields are required.
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
        <div className="p-6 space-y-8">
          {/* User Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">User Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name *" placeholder="John Doe" />
              <InputField label="Email *" placeholder="john.doe@example.com" type="email" />
              <InputField label="Password *" placeholder="Minimum 8 characters" type="password" />
              <InputField label="Confirm Password *" placeholder="Confirm password" type="password" />
            </div>
          </div>

          {/* Agency Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Agency Details</h4>
            <div className="space-y-4">
              <InputField label="Agency Name *" placeholder="Northern District Office" />
              <InputField label="Project Name *" placeholder="Fertilizer Distribution Phase 2" />
              <InputField label="Ministry *" placeholder="Ministry of Agriculture" />
            </div>
          </div>
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
            Create Agency
          </Button>
        </div>
      </div>
    </div>
  );
};

CreateAgencyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const AgenciesView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const agencies = [
    {
      id: 1,
      name: 'Northern District Office',
      description: 'Fertilizer Distribution Phase 2',
      ministry: 'Ministry of Agriculture',
      user: {
        initials: 'J',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    },
    {
      id: 2,
      name: 'Southern District Office',
      description: 'Agricultural Development',
      ministry: 'Ministry of Agriculture',
      user: {
        initials: 'M',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Agencies</h2>
          <p className="text-gray-500 mt-2">Create and manage agency accounts</p>
        </div>
        <Button
          className="bg-gray-900 hover:bg-gray-800 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Agency
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agencies.map((agency) => (
          <AgencyCard key={agency.id} agency={agency} />
        ))}
      </div>

      <CreateAgencyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AgenciesView;
