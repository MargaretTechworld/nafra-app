import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  MapPin,
  Pencil,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField } from '../../ui/form-elements';

const DistrictCard = ({ district }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start space-x-4 mb-6">
      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        <MapPin className="h-6 w-6" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">{district.name}</h3>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {district.code}
          </span>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Chiefdoms
      </p>
      <p className="text-2xl font-bold text-gray-900">{district.chiefdomsCount}</p>
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

DistrictCard.propTypes = {
  district: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    chiefdomsCount: PropTypes.number.isRequired,
  }).isRequired,
};

const AddDistrictModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Add New District</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a new district in the system
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
          <InputField label="District Name *" placeholder="Bombali" />
          <InputField label="District Code *" placeholder="BOM" />
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
            Create District
          </Button>
        </div>
      </div>
    </div>
  );
};

AddDistrictModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const DistrictsView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('Districts');

  const districts = [
    {
      id: 1, name: 'Bombali', code: 'BOM', chiefdomsCount: 3,
    },
    {
      id: 2, name: 'Kenema', code: 'KEN', chiefdomsCount: 2,
    },
    {
      id: 3, name: 'Kono', code: 'KON', chiefdomsCount: 12,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Districts, Chiefdoms & Fertilizers</h2>
          <p className="text-gray-500 mt-2">Manage geographical locations and fertilizer types</p>
        </div>
        {activeSubTab === 'Districts' && (
        <Button
          className="bg-gray-900 hover:bg-gray-800 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add District
        </Button>
        )}
      </header>

      {/* Internal Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        {['Districts', 'Chiefdoms', 'Fertilizers'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeSubTab === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Districts' && (
        <div className="block animate-in fade-in duration-300">
          <p className="text-gray-500 mb-6">3 districts registered</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {districts.map((district) => (
              <DistrictCard key={district.id} district={district} />
            ))}
          </div>
        </div>
      )}

      {activeSubTab !== 'Districts' && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <p className="font-medium text-gray-900">Work in Progress</p>
          <p className="text-sm mt-1">
            The
            {activeSubTab}
            {' '}
            management view is coming soon.
          </p>
        </div>
      )}

      <AddDistrictModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DistrictsView;
