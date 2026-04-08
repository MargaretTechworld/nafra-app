import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Store,
  Pencil,
  Trash2,
  X,
  User,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  UserCheck,
  UserPlus,
  MapPinPlus,
  Eye,
  Plus,
  Map,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField, CustomSelect } from '../../ui/form-elements';
import {
  useAdminGetDealersQuery,
  useAdminCreateDealerMutation,
  useAdminDeleteDealerMutation,
  useAdminUpdateDealerMutation,
  useAdminGetRegionsQuery,
  useAdminGetDistrictsQuery,
  useAdminGetChiefdomsQuery,
} from '../../../app/api/apiSlice';

const DealerRow = ({
  dealer, onView, onEdit, onDelete,
}) => {
  const isExpired = dealer.license_expiry_date
    && new Date(dealer.license_expiry_date) < new Date();

  return (
    <tr className="group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-none mb-1">{dealer.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              LIC:
              {dealer.license_number || 'PENDING'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
          {dealer.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {dealer.licensing_status === 'Yes' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-md ring-1 ring-green-100">
              <ShieldCheck className="h-3 w-3" />
              {' '}
              Licensed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-md ring-1 ring-gray-100">
              <ShieldAlert className="h-3 w-3" />
              {' '}
              Not Licensed
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`text-xs font-bold ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
          {dealer.license_expiry_date || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onView(dealer)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(dealer)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(dealer.id, dealer.name)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Dealer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

DealerRow.propTypes = {
  dealer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    category: PropTypes.string,
    licensing_status: PropTypes.string,
    license_expiry_date: PropTypes.string,
    license_number: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const DealerModal = ({
  isOpen, onClose, dealer = null, isReadOnly = false,
  regions = [], districts = [], chiefdoms = [],
}) => {
  const initialForm = useMemo(() => ({
    name: '',
    license_number: '',
    status: 'active',
    category: 'Non Commercial Importers',
    head_office_address: '',
    ceo_name: '',
    registration_date: '',
    license_expiry_date: '',
    licensing_status: 'No',
    contact_people_attributes: [],
    outlets_attributes: [],
  }), []);

  const [formData, setFormData] = useState(initialForm);
  const [createDealer, { isLoading: isCreating }] = useAdminCreateDealerMutation();
  const [updateDealer, { isLoading: isUpdating }] = useAdminUpdateDealerMutation();

  useEffect(() => {
    if (dealer) {
      const processedDealer = {
        ...dealer,
        contact_people_attributes: (dealer.contact_people || []).map((cp) => ({ ...cp })),
        outlets_attributes: (dealer.outlets || []).map((o) => ({
          ...o,
          addressLines: o.address ? o.address.split('\n') : [''],
        })),
      };
      setFormData(processedDealer);
    } else {
      setFormData(initialForm);
    }
  }, [dealer, isOpen, initialForm]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        // eslint-disable-next-line no-alert
        alert('Business Name is required.');
        return;
      }

      if (formData.licensing_status === 'Yes' && !formData.license_number) {
        // eslint-disable-next-line no-alert
        alert('License Number is required for licensed dealers.');
        return;
      }

      const processedData = {
        ...formData,
        status: formData.status || 'active',
        outlets_attributes: formData.outlets_attributes.map((o) => {
          const { addressLines, ...rest } = o;
          return {
            ...rest,
            address: (addressLines || [o.address || '']).filter((line) => line.trim()).join('\n'),
          };
        }),
      };

      if (dealer) {
        await updateDealer({ id: dealer.id, ...processedData }).unwrap();
      } else {
        await createDealer(processedData).unwrap();
      }
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save dealer:', err);
    }
  };

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contact_people_attributes: [
        ...prev.contact_people_attributes,
        {
          name: '', phone: '', email: '', role: '', is_primary: prev.contact_people_attributes.length === 0,
        },
      ],
    }));
  };

  const handleRemoveContact = (index) => {
    setFormData((prev) => {
      const updated = [...prev.contact_people_attributes];
      if (updated[index].id) {
        // eslint-disable-next-line no-underscore-dangle
        updated[index] = { ...updated[index], _destroy: true };
      } else {
        updated.splice(index, 1);
      }
      return { ...prev, contact_people_attributes: updated };
    });
  };

  const handleUpdateContact = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.contact_people_attributes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contact_people_attributes: updated };
    });
  };

  const handleAddOutlet = () => {
    setFormData((prev) => ({
      ...prev,
      outlets_attributes: [
        ...prev.outlets_attributes,
        {
          id: null,
          address_lines: [''],
          address: '',
          region_id: '',
          district_id: '',
          chiefdom_id: '',
        },
      ],
    }));
  };

  const handleRemoveOutlet = (index) => {
    setFormData((prev) => {
      const updated = [...prev.outlets_attributes];
      if (updated[index].id) {
        // eslint-disable-next-line no-underscore-dangle
        updated[index] = { ...updated[index], _destroy: true };
      } else {
        updated.splice(index, 1);
      }
      return { ...prev, outlets_attributes: updated };
    });
  };

  const handleUpdateOutlet = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.outlets_attributes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, outlets_attributes: updated };
    });
  };

  const handleAddAddressLine = (outletIdx) => {
    setFormData((prev) => {
      const updated = [...prev.outlets_attributes];
      updated[outletIdx] = {
        ...updated[outletIdx],
        addressLines: [...(updated[outletIdx].addressLines || ['']), ''],
      };
      return { ...prev, outlets_attributes: updated };
    });
  };

  const handleRemoveAddressLine = (outletIdx, lineIdx) => {
    setFormData((prev) => {
      const updated = [...prev.outlets_attributes];
      const lines = [...(updated[outletIdx].addressLines || [''])];
      if (lines.length > 1) {
        lines.splice(lineIdx, 1);
        updated[outletIdx] = { ...updated[outletIdx], addressLines: lines };
      }
      return { ...prev, outlets_attributes: updated };
    });
  };

  const handleUpdateAddressLine = (outletIdx, lineIdx, value) => {
    setFormData((prev) => {
      const updated = [...prev.outlets_attributes];
      const lines = [...(updated[outletIdx].addressLines || [''])];
      lines[lineIdx] = value;
      updated[outletIdx] = { ...updated[outletIdx], addressLines: lines };
      return { ...prev, outlets_attributes: updated };
    });
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-shrink-0 flex justify-between items-start p-6 border-b border-gray-100 bg-gray-900 text-white rounded-t-2xl">
            <div>
              <h3 className="text-2xl font-black tracking-tight">
                {dealer ? 'Update Dealer Profile' : 'Register New Dealer'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {dealer ? 'Modify existing business details and registration status'
                  : 'Enter business details to register a new fertilizer distributor'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-12">
            {/* Section 1: Business Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Briefcase className="h-5 w-5 text-gray-900" />
                <h4 className="text-sm font-black uppercase text-gray-900 tracking-widest">1. Business Identity</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField
                    label="Business Legal Name *"
                    placeholder="e.g. Green Agro Sierra Leone Ltd"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <InputField
                  label="CEO / Proprietor Name"
                  placeholder="e.g. John Kamara"
                  value={formData.ceo_name || ''}
                  onChange={(e) => setFormData({ ...formData, ceo_name: e.target.value })}
                  disabled={isReadOnly}
                />
                <CustomSelect
                  label="Business Category"
                  placeholder="Select category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isReadOnly}
                  options={[
                    'Non Commercial Importers',
                    'Commercial Importers',
                    'Small-to-Medium Enterprises',
                    'Farm-gate Grassroots Businesses',
                  ]}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Head Office Physical Address"
                    placeholder="e.g. 45 Siaka Stevens St, Freetown"
                    value={formData.head_office_address || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      head_office_address: e.target.value,
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Registration and License Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-gray-900" />
                <h4 className="text-sm font-black uppercase text-gray-900 tracking-widest">2. Registration & Licensing</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                  label="Licensing Status"
                  placeholder="Select"
                  value={formData.licensing_status || 'No'}
                  onChange={(e) => setFormData({ ...formData, licensing_status: e.target.value })}
                  disabled={isReadOnly}
                  options={['Yes', 'No']}
                />
                <InputField
                  type="date"
                  label="Registration Date"
                  value={formData.registration_date || ''}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  disabled={isReadOnly}
                />

                {formData.licensing_status === 'Yes' && (
                  <>
                    <InputField
                      label="License Number *"
                      placeholder="e.g. LIC-2026-0045"
                      value={formData.license_number || ''}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      disabled={isReadOnly}
                    />
                    <InputField
                      type="date"
                      label="License Expiry Date"
                      value={formData.license_expiry_date || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        license_expiry_date: e.target.value,
                      })}
                      disabled={isReadOnly}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Section 3: Management & Staff */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-gray-900" />
                  <h4 className="text-sm font-black uppercase text-gray-900 tracking-widest">3. Management & Staff</h4>
                </div>
              </div>
              <div className="space-y-6">
                {(formData.contact_people_attributes || [])
                  // eslint-disable-next-line no-underscore-dangle
                  .filter((c) => !c._destroy).map((contact, idx) => (
                    <div
                      key={contact.id || `contact-${idx}`}
                      className="p-6 bg-white rounded-2xl border-2 border-gray-50 relative group transition-all hover:border-gray-200 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-xl">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                              Staff Member #
                              {idx + 1}
                            </p>
                            <p className="text-sm font-bold text-gray-900">{contact.name || 'New Contact Person'}</p>
                          </div>
                        </div>
                        {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(idx)}
                          className="text-xs font-black uppercase tracking-tight text-red-500 hover:text-red-700 flex items-center gap-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {' '}
                          Remove
                        </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <InputField
                          label="Full Name"
                          value={contact.name}
                          onChange={(e) => handleUpdateContact(idx, 'name', e.target.value)}
                          disabled={isReadOnly}
                        />
                        <InputField
                          label="Role / Title"
                          value={contact.role}
                          onChange={(e) => handleUpdateContact(idx, 'role', e.target.value)}
                          disabled={isReadOnly}
                        />
                        <InputField
                          label="Phone Number"
                          value={contact.phone}
                          onChange={(e) => handleUpdateContact(idx, 'phone', e.target.value)}
                          disabled={isReadOnly}
                        />
                        <InputField
                          label="Email Address"
                          value={contact.email}
                          onChange={(e) => handleUpdateContact(idx, 'email', e.target.value)}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  ))}

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:border-gray-900 hover:text-gray-900 transition-all group"
                  >
                    <UserPlus className="h-5 w-5 transition-transform group-active:scale-90" />
                    Add New Staff Member
                  </button>
                )}
              </div>
            </section>

            {/* Section 4: Business Outlets */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-gray-900" />
                  <h4 className="text-sm font-black uppercase text-gray-900 tracking-widest">4. Business Outlets</h4>
                </div>
              </div>
              <div className="space-y-8">
                {(formData.outlets_attributes || [])
                  // eslint-disable-next-line no-underscore-dangle
                  .filter((o) => !o._destroy).map((outlet, idx) => {
                    const rId = parseInt(outlet.region_id, 10);
                    const dId = parseInt(outlet.district_id, 10);
                    const filteredDistricts = districts.filter((d) => d.region_id === rId);
                    const filteredChiefdoms = chiefdoms.filter((c) => c.district_id === dId);
                    const currentRegion = regions.find((r) => r.id === rId)?.name;
                    const firstLandmark = (outlet.addressLines && outlet.addressLines[0]?.trim());
                    const displayName = currentRegion
                      ? `${currentRegion}${firstLandmark ? ` - ${firstLandmark}` : ''}`
                      : (firstLandmark || 'New Distribution Outlet');

                    return (
                      <div
                        key={outlet.id || `outlet-${idx}`}
                        className="p-6 bg-white rounded-2xl border-2 border-gray-50 relative group transition-all hover:border-gray-200 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-xl">
                              <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                Outlet Location #
                                {idx + 1}
                              </p>
                              <p className="text-sm font-bold text-gray-900 border-l-2 border-green-500 pl-2">
                                {displayName}
                              </p>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOutlet(idx)}
                              disabled={isReadOnly}
                              className="text-xs font-black uppercase tracking-tight text-red-500 hover:text-red-700 flex items-center gap-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {' '}
                              Remove Outlet
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
                          <CustomSelect
                            label="Region"
                            placeholder="Not Available / Select Later"
                            value={outlet.region_id || ''}
                            disabled={isReadOnly}
                            onChange={(e) => {
                              handleUpdateOutlet(idx, 'region_id', e.target.value);
                              handleUpdateOutlet(idx, 'district_id', '');
                              handleUpdateOutlet(idx, 'chiefdom_id', '');
                            }}
                            options={regions.map((r) => ({ value: r.id, label: r.name }))}
                          />

                          <CustomSelect
                            label="District"
                            placeholder={outlet.region_id ? 'Select District' : 'Select Region First'}
                            value={outlet.district_id || ''}
                            disabled={!outlet.region_id || isReadOnly}
                            onChange={(e) => {
                              handleUpdateOutlet(idx, 'district_id', e.target.value);
                              handleUpdateOutlet(idx, 'chiefdom_id', '');
                            }}
                            options={filteredDistricts.map((d) => ({ value: d.id, label: d.name }))}
                          />

                          <CustomSelect
                            label="Chiefdom"
                            placeholder={outlet.district_id ? 'Select Chiefdom' : 'Select District First'}
                            value={outlet.chiefdom_id || ''}
                            disabled={!outlet.district_id || isReadOnly}
                            onChange={(e) => handleUpdateOutlet(idx, 'chiefdom_id', e.target.value)}
                            options={filteredChiefdoms.map((c) => ({ value: c.id, label: c.name }))}
                          />

                          <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-50">
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Physical Address / Landmarks</p>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => handleAddAddressLine(idx)}
                                  disabled={isReadOnly}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  {' '}
                                  Add Landmark
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              {(outlet.addressLines || ['']).map((line, lIdx) => (
                                <div
                                    // eslint-disable-next-line react/no-array-index-key
                                  key={`${outlet.id || idx}-addr-${lIdx}`}
                                  className="flex gap-2 group/line"
                                >
                                  <div className="flex-1">
                                    <InputField
                                      placeholder={lIdx === 0 ? 'e.g. 12 Main St, Near Central Mosque' : 'Additional landmark...'}
                                      value={line}
                                      onChange={(e) => {
                                        handleUpdateAddressLine(idx, lIdx, e.target.value);
                                      }}
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                  {lIdx > 0 && !isReadOnly && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAddressLine(idx, lIdx)}
                                      disabled={isReadOnly}
                                      className="p-2 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAddOutlet}
                    disabled={isReadOnly}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:border-gray-900 hover:text-gray-900 transition-all group"
                  >
                    <MapPinPlus className="h-5 w-5 transition-transform group-active:scale-90" />
                    Add New Business Outlet
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          {!isReadOnly && (
            <div className="flex-shrink-0 p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-8 bg-white border-gray-200 text-gray-600 font-bold"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="px-10 bg-gray-900 hover:bg-black text-white font-black shadow-xl"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </div>
                ) : (
                  <>
                    {dealer ? 'Update Profile' : 'Complete Registration'}
                  </>
                )}
              </Button>
            </div>
          )}
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
  isReadOnly: PropTypes.bool,
  regions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  })),
  districts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    region_id: PropTypes.number,
  })),
  chiefdoms: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    district_id: PropTypes.number,
  })),
};

DealerModal.defaultProps = {
  dealer: null,
  isReadOnly: false,
  regions: [],
  districts: [],
  chiefdoms: [],
};

const DeleteConfirmationModal = ({
  isOpen, onClose, onConfirm, dealerName, isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center text-gray-900">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-red-50/50">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-black mb-2 tracking-tight uppercase">Delete Dealer Record?</h3>
          <p className="text-gray-500 leading-relaxed px-4">
            You are about to permanently remove
            {' '}
            <span className="font-bold text-gray-900">
              &quot;
              {dealerName}
              &quot;
            </span>
            . This action will delete all associated staff and outlet profiles and cannot be undone.
          </p>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-6 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  dealerName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

const DealersView = () => {
  const {
    data: dealers, isLoading: isLoadingDealers, error: errorDealers,
  } = useAdminGetDealersQuery();
  const [deleteDealer, { isLoading: isDeletingDealer }] = useAdminDeleteDealerMutation();
  const [modalState, setModalState] = useState({ isOpen: false, dealer: null, isReadOnly: false });
  const [deleteState, setDeleteState] = useState({ isOpen: false, id: null, name: '' });

  // Fetch Reference Data
  const { data: regions = [] } = useAdminGetRegionsQuery();
  const { data: districts = [] } = useAdminGetDistrictsQuery();
  const { data: chiefdoms = [] } = useAdminGetChiefdomsQuery();

  const handleEdit = (dealer) => setModalState({ isOpen: true, dealer, isReadOnly: false });
  const handleView = (dealer) => setModalState({ isOpen: true, dealer, isReadOnly: true });
  const handleAddNew = () => setModalState({ isOpen: true, dealer: null, isReadOnly: false });
  const closeModal = () => setModalState({ isOpen: false, dealer: null, isReadOnly: false });

  const handleDeleteClick = (id, name) => {
    setDeleteState({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDealer(deleteState.id).unwrap();
      setDeleteState({
        isOpen: false, id: null, name: '',
      });
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Failed to delete dealer. They may have active distribution records.');
    }
  };

  const renderContent = () => {
    if (isLoadingDealers) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing Dealer Data...</p>
        </div>
      );
    }

    if (errorDealers) {
      return (
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border-2 border-red-100 text-center max-w-2xl mx-auto shadow-sm">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">Failed to load dealer network</p>
          <p className="text-sm opacity-80 mt-1 uppercase font-black">
            Connection Error:
            {' '}
            {errorDealers.message || 'Check terminal logs'}
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
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Detail</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Licensing</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dealers.map((dealer) => (
                <DealerRow
                  key={dealer.id}
                  dealer={dealer}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>
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
          className="bg-gray-900 hover:bg-black text-white font-black px-8 h-12 rounded-xl shadow-lg transition-transform active:scale-95"
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
        isReadOnly={modalState.isReadOnly}
        regions={regions}
        districts={districts}
        chiefdoms={chiefdoms}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        dealerName={deleteState.name}
        isLoading={isDeletingDealer}
      />
    </div>
  );
};

export default DealersView;
