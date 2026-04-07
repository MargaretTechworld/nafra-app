import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Pencil, Trash2, X, Plus, Building2, TrendingUp, ShieldAlert,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/card';
import { InputField, CustomSelect } from '../../ui/form-elements';
import {
  useListAgenciesQuery,
  useListUsersQuery,
  useCreateAgencyMutation,
  useAgencyDistrictDistributionQuery,
  useAdminGetDistrictsQuery,
} from '../../../app/api/apiSlice';

const AgencyCard = ({ agency }) => {
  const initials = agency.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'A';

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{agency.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{agency.project_name || 'No project description'}</p>
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
        <p className="font-medium text-gray-900">{agency.ministry || 'N/A'}</p>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Associated User
        </p>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{agency.user?.name || 'Unknown User'}</p>
            <p className="text-xs text-gray-500">{agency.user?.email || 'No email provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

AgencyCard.propTypes = {
  agency: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    project_name: PropTypes.string,
    ministry: PropTypes.string,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
  }).isRequired,
};

const CreateAgencyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    project_name: '',
    ministry: '',
    user_id: '',
  });
  const [createAgency, { isLoading: isCreating }] = useCreateAgencyMutation();
  const { data: usersData } = useListUsersQuery();
  const users = (usersData || []).filter((u) => u.role === 'agency');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAgency(formData).unwrap();
      onClose();
      setFormData({
        name: '', project_name: '', ministry: '', user_id: '',
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create agency:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Create New Agency</h3>
              <p className="text-sm text-gray-500 mt-1">
                Associate a distribution project with an agency user.
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
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <InputField
                label="Agency Name *"
                placeholder="Northern District Office"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <InputField
                label="Project Name *"
                placeholder="Fertilizer Distribution Phase 2"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                required
              />
              <InputField
                label="Ministry *"
                placeholder="Ministry of Agriculture"
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                required
              />
              <CustomSelect
                label="Associate User *"
                placeholder="Select an agency user"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
                required
              />
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
            <Button className="bg-gray-900 hover:bg-gray-800 text-white" type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Agency'}
            </Button>
          </div>
        </form>
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
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showLookupResults, setShowLookupResults] = useState(false);

  // Core Data
  const { data: agenciesData, isLoading, error } = useListAgenciesQuery();
  const { data: districtsData } = useAdminGetDistrictsQuery();

  // Conditional Query for Deep-Dive
  const {
    data: lookupData,
    isFetching: isFetchingLookup,
    error: lookupError,
  } = useAgencyDistrictDistributionQuery(
    { agencyId: selectedAgency, districtId: selectedDistrict },
    { skip: !showLookupResults || !selectedAgency || !selectedDistrict },
  );

  const agencies = agenciesData || [];
  const agencyOptions = agencies.map((a) => ({ value: a.id, label: a.name }));
  const districtOptions = (districtsData || []).map((d) => ({ value: d.id, label: d.name }));

  const handleLookup = () => {
    if (selectedAgency && selectedDistrict) {
      setShowLookupResults(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Manage Agencies</h2>
          <p className="text-gray-500 font-medium">Configure distribution partners and monitor performance</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-black h-11 px-8 rounded-xl shadow-md border-b-2 border-blue-800 flex items-center gap-2 transition-transform active:scale-95 translate-y-[-2px]"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Agency
        </Button>
      </header>

      {/* Distribution Deep-Dive Section */}
      <Card className="shadow-lg border-0 bg-white ring-1 ring-gray-100 mb-12 overflow-hidden transition-all hover:ring-blue-100 rounded-2xl">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
        <CardHeader className="pb-4 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Performance Deep-Dive</CardTitle>
              <CardDescription className="text-gray-500">Analyze granular distribution data by agency and district</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <CustomSelect
                label="Primary Agency"
                placeholder="Select distribution partner"
                value={selectedAgency}
                onChange={(e) => {
                  setSelectedAgency(e.target.value);
                  setShowLookupResults(false);
                }}
                options={agencyOptions}
              />
            </div>
            <div className="md:col-span-5">
              <CustomSelect
                label="Target District"
                placeholder="Select focus district"
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setShowLookupResults(false);
                }}
                options={districtOptions}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-11 shadow-sm transition-transform active:scale-95"
                size="lg"
                onClick={handleLookup}
                disabled={!selectedAgency || !selectedDistrict}
              >
                {isFetchingLookup ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Area */}
          {showLookupResults && lookupData && (
            <div className="mt-8 pt-8 border-t border-gray-100 animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Chiefdoms Reached</p>
                    <p className="text-3xl font-black text-gray-900">
                      {new Set(lookupData.distributions?.map((d) => d.chiefdom)).size || 0}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest mb-1">Total 25kg Bags</p>
                    <p className="text-3xl font-black text-blue-700">{lookupData.totals?.total_bags_25kg || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-400 shadow-sm border border-blue-50">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="p-5 bg-green-50/50 rounded-2xl border border-green-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-black text-green-500 tracking-widest mb-1">Total 50kg Bags</p>
                    <p className="text-3xl font-black text-green-700">{lookupData.totals?.total_bags_50kg || 0}</p>
                  </div>
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-green-400 shadow-sm border border-green-50">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5">Chiefdom Name</th>
                      <th className="px-8 py-5">Fertilizer Grade</th>
                      <th className="px-8 py-5 text-right">25kg Units</th>
                      <th className="px-8 py-5 text-right">50kg Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {lookupData.distributions?.map((dist) => {
                      const rowKey = `${dist.chiefdom}-${dist.fertilizer}-${dist.bags_25kg}-${dist.bags_50kg}`;
                      return (
                        <tr key={rowKey} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-5 font-black text-gray-900 uppercase tracking-tight">{dist.chiefdom}</td>
                          <td className="px-8 py-5">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded uppercase tracking-tighter">
                              {dist.fertilizer}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-mono font-bold text-blue-600">{dist.bags_25kg}</td>
                          <td className="px-8 py-5 text-right font-mono font-bold text-green-600">{dist.bags_50kg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {lookupError && (
            <div className="mt-6 p-6 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 font-bold uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert className="h-5 w-5" />
              Analysis Integrity Failed: One of the selected records may no longer exist
              in the secure registry.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Agency Registry</h3>
        <p className="text-xs text-gray-400 font-bold tracking-tighter uppercase">
          {agencies.length}
          {' '}
          Partners Registered
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
      {error && !isLoading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center">
          Failed to load agencies. Please try again.
        </div>
      )}
      {!isLoading && !error && (agencies?.length || 0) === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-20 text-center text-gray-400">
          <p className="text-lg">No agencies found.</p>
          <p className="text-sm">Click &quot;Create Agency&quot; to add one.</p>
        </div>
      )}
      {!isLoading && !error && (agencies?.length || 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(agencies || []).map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      )}

      <CreateAgencyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AgenciesView;
