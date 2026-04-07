import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Store,
  Pencil,
  Trash2,
  X,
  Plus,
  Calendar,
  User,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField, CustomSelect } from '../../ui/form-elements';
import {
  useAdminGetDealersQuery,
  useAdminCreateDealerMutation,
  useAdminDeleteDealerMutation,
  useAdminUpdateDealerMutation,
} from '../../../app/api/apiSlice';

const DealerCard = ({ dealer, onEdit, onDelete }) => {
  const isExpired = dealer.license_expiry_date
    && new Date(dealer.license_expiry_date) < new Date();

  const statusClass = dealer.status === 'active'
    ? 'text-green-700 bg-green-50'
    : 'text-gray-600 bg-gray-100';

  const licenseClass = isExpired ? 'text-red-600' : 'text-blue-600';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-white ring-4 ring-gray-50">
            <Store className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md mb-2 ${statusClass}`}>
              {dealer.status}
            </span>
            {dealer.licensing_status && (
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${licenseClass}`}>
                {isExpired ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                {isExpired ? 'Expired' : dealer.licensing_status}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-black text-gray-900 leading-tight">{dealer.name}</h3>
          <p className="text-sm font-medium text-gray-400 flex items-center gap-1 mt-1 uppercase tracking-tighter">
            <Briefcase className="h-3 w-3" />
            {dealer.category}
            {' '}
            •
            {' '}
            {dealer.category_type}
          </p>
        </div>

        <div className="space-y-3 py-4 border-t border-gray-50">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-gray-50 rounded-md text-gray-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-1">CEO / Proprietor</p>
              <p className="font-semibold text-gray-700">{dealer.ceo_name || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-gray-50 rounded-md text-gray-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-1">License Expiry</p>
              <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                {dealer.license_expiry_date || 'No date set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-gray-50 rounded-md text-gray-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-1">Head Office</p>
              <p className="text-gray-700 line-clamp-1">{dealer.head_office_address || 'Address missing'}</p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Registration</p>
            <p className="text-xs font-bold text-gray-600">{dealer.registration_date || 'N/A'}</p>
          </div>
          <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 flex-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold">License #</p>
            <p className="text-xs font-bold text-gray-600">{dealer.license_number || 'PENDING'}</p>
          </div>
        </div>
      </div>

      <div className="p-2 bg-gray-50 border-t border-gray-100 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(dealer)}
          className="flex-1 flex items-center justify-center py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm active:scale-95"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </button>
        <button
          type="button"
          onClick={() => onDelete(dealer.id)}
          className="flex items-center justify-center px-4 py-2.5 bg-white border border-red-100 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

DealerCard.propTypes = {
  dealer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    status: PropTypes.string,
    category: PropTypes.string,
    category_type: PropTypes.string,
    licensing_status: PropTypes.string,
    ceo_name: PropTypes.string,
    license_expiry_date: PropTypes.string,
    head_office_address: PropTypes.string,
    registration_date: PropTypes.string,
    license_number: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const DealerModal = ({ isOpen, onClose, dealer = null }) => {
  const initialForm = useMemo(() => ({
    name: '',
    license_number: '',
    status: 'active',
    category: 'Fertilizer Dealer',
    category_type: 'Retailer',
    head_office_address: '',
    ceo_name: '',
    registration_date: '',
    license_expiry_date: '',
    licensing_status: 'Active',
  }), []);

  const [formData, setFormData] = useState(initialForm);
  const [createDealer, { isLoading: isCreating }] = useAdminCreateDealerMutation();
  const [updateDealer, { isLoading: isUpdating }] = useAdminUpdateDealerMutation();

  useEffect(() => {
    if (dealer) {
      setFormData(dealer);
    } else {
      setFormData(initialForm);
    }
  }, [dealer, isOpen, initialForm]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dealer) {
        await updateDealer({ id: dealer.id, ...formData }).unwrap();
      } else {
        await createDealer(formData).unwrap();
      }
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save dealer:', err);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-gray-100">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {dealer ? 'Update Dealer Profile' : 'Register New Dealer'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {dealer ? 'Modify existing business details and registration status'
                  : 'Enter business details to register a new fertilizer distributor'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2">Business Identity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Business Legal Name *"
                    placeholder="e.g. Green Agro Sierra Leone Ltd"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <InputField
                  label="CEO / Proprietor Name"
                  placeholder="e.g. John Kamara"
                  value={formData.ceo_name}
                  onChange={(e) => setFormData({ ...formData, ceo_name: e.target.value })}
                />
                <InputField
                  label="License Number"
                  placeholder="e.g. LIC-2026-0045"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2">Category & Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                  label="Business Category"
                  placeholder="Select category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={['Fertilizer Dealer', 'Seed Dealer', 'Equipment Supplier', 'General Agro']}
                />
                <CustomSelect
                  label="Category Type"
                  placeholder="Select type"
                  value={formData.category_type}
                  onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                  options={['Wholesaler', 'Retailer', 'Distributor']}
                />
                <CustomSelect
                  label="Operational Status"
                  placeholder="Select status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={['active', 'inactive', 'suspended']}
                />
                <CustomSelect
                  label="Licensing Status"
                  placeholder="Select license status"
                  value={formData.licensing_status}
                  onChange={(e) => setFormData({ ...formData, licensing_status: e.target.value })}
                  options={['Active', 'Pending', 'Expired', 'Revoked']}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2">Timeline & Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  type="date"
                  label="Registration Date"
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                />
                <InputField
                  type="date"
                  label="License Expiry Date"
                  value={formData.license_expiry_date}
                  onChange={(e) => setFormData({
                    ...formData,
                    license_expiry_date: e.target.value,
                  })}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Head Office Physical Address"
                    placeholder="e.g. 45 Siaka Stevens St, Freetown"
                    value={formData.head_office_address}
                    onChange={(e) => setFormData({
                      ...formData,
                      head_office_address: e.target.value,
                    })}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8 bg-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="px-10 bg-gray-900 hover:bg-black text-white font-bold"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </div>
              ) : (
                <>
                  {dealer ? 'Update Profile' : 'Complete Registration'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

DealerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dealer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    status: PropTypes.string,
    category: PropTypes.string,
    category_type: PropTypes.string,
    licensing_status: PropTypes.string,
    ceo_name: PropTypes.string,
    license_expiry_date: PropTypes.string,
    head_office_address: PropTypes.string,
    registration_date: PropTypes.string,
    license_number: PropTypes.string,
  }),
};

DealerModal.defaultProps = {
  dealer: null,
};

const DealersView = () => {
  const [modalState, setModalState] = useState({ isOpen: false, dealer: null });
  const { data: dealers, isLoading, error } = useAdminGetDealersQuery();
  const [deleteDealer] = useAdminDeleteDealerMutation();

  const handleEdit = (dealer) => setModalState({ isOpen: true, dealer });
  const handleAddNew = () => setModalState({ isOpen: true, dealer: null });
  const closeModal = () => setModalState({ isOpen: false, dealer: null });

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this dealer? This action cannot be undone.')) {
      try {
        await deleteDealer(id).unwrap();
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert('Failed to delete dealer. They may have active outlets or submissions.');
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing Dealer Data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border-2 border-red-100 text-center max-w-2xl mx-auto shadow-sm">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">Failed to load dealer network</p>
          <p className="text-sm opacity-80 mt-1 uppercase font-black">
            Connection Error:
            {' '}
            {error.message || 'Check terminal logs'}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6 border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </Button>
        </div>
      );
    }

    if ((dealers?.length || 0) === 0) {
      return (
        <div className="bg-white border-4 border-dashed border-gray-100 rounded-3xl py-32 text-center flex flex-col items-center">
          <div className="p-6 bg-gray-50 rounded-full mb-6">
            <Store className="h-16 w-16 text-gray-200" />
          </div>
          <p className="text-2xl font-black text-gray-900">No Registered Dealers</p>
          <p className="text-gray-400 mt-2 font-medium max-w-sm">The dealer network is currently empty. Start by registering your first distribution partner.</p>
          <Button
            type="button"
            className="mt-8 bg-gray-900 text-white"
            onClick={handleAddNew}
          >
            Register First Dealer
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {dealers.map((dealer) => (
          <DealerCard
            key={dealer.id}
            dealer={dealer}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900 rounded-xl">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Dealer Network</h2>
          </div>
          <p className="text-gray-500 font-medium">Manage fertilizer distribution partners and licensing compliance</p>
        </div>
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-12 rounded-xl shadow-lg transition-transform active:scale-95"
          onClick={handleAddNew}
        >
          <Plus className="mr-2 h-5 w-5" />
          Register New Dealer
        </Button>
      </header>

      {renderContent()}

      <DealerModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        dealer={modalState.dealer}
      />
    </div>
  );
};

export default DealersView;
