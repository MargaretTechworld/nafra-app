import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Store,
  Pencil,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField } from '../../ui/form-elements';

const DealerCard = ({ dealer }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start space-x-4 mb-6">
      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
        <Store className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{dealer.name}</h3>
        <p className="text-sm font-medium text-gray-500">
          License:
          {' '}
          {dealer.license}
        </p>
      </div>
    </div>

    <div className="space-y-4 mb-6">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Contact Person
        </p>
        <p className="text-sm font-medium text-gray-900">{dealer.contactPerson}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Phone
        </p>
        <p className="text-sm font-medium text-gray-900">{dealer.phone}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Email
        </p>
        <p className="text-sm font-medium text-gray-900">{dealer.email}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Address
        </p>
        <p className="text-sm font-medium text-gray-900">{dealer.address}</p>
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

DealerCard.propTypes = {
  dealer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    license: PropTypes.string.isRequired,
    contactPerson: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
};

const AddDealerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Add New Dealer</h3>
            <p className="text-sm text-gray-500 mt-1">
              Register a new fertilizer dealer or distributor
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Business Name *" placeholder="Green Agro Supplies" />
            <InputField label="License Number *" placeholder="LIC001" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Contact Person *" placeholder="John Doe" />
            <InputField label="Phone Number *" placeholder="+232 76 123 456" />
          </div>
          <InputField label="Email *" placeholder="info@dealer.com" type="email" />
          <InputField label="Address *" placeholder="Street address, city" />
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
            Create Dealer
          </Button>
        </div>
      </div>
    </div>
  );
};

AddDealerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const DealersView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dealers = [
    {
      id: 1,
      name: 'Green Agro Supplies',
      license: 'LIC001',
      contactPerson: 'Mohamed Kamara',
      phone: '+232 76 123 456',
      email: 'info@greenagro.sl',
      address: 'Wilkinson Road, Freetown',
    },
    {
      id: 2,
      name: 'Farm Supplies Co',
      license: 'LIC002',
      contactPerson: 'Fatmata Sesay',
      phone: '+232 77 234 567',
      email: 'contact@farmsupplies.sl',
      address: 'Main Street, Bo',
    },
    {
      id: 3,
      name: 'AgriTech Limited',
      license: 'LIC003',
      contactPerson: 'Ibrahim Koroma',
      phone: '+232 78 345 678',
      email: 'sales@agritech.sl',
      address: 'Wellington Road, Kenema',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Dealers</h2>
          <p className="text-gray-500 mt-2">Manage fertilizer dealers and distributors</p>
        </div>
        <Button
          className="bg-gray-900 hover:bg-gray-800 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Dealer
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealers.map((dealer) => (
          <DealerCard key={dealer.id} dealer={dealer} />
        ))}
      </div>

      <AddDealerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DealersView;
