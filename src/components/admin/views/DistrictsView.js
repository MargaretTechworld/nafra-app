import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  MapPin, Pencil, Trash2, Plus, X,
  Globe, LayoutGrid, Beaker, Map,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { InputField, CustomSelect } from '../../ui/form-elements';
import {
  useAdminGetRegionsQuery,
  useAdminGetDistrictsQuery,
  useAdminGetChiefdomsQuery,
  useAdminGetTownshipsQuery,
  useAdminGetFertilizersQuery,
  useAdminCreateRegionMutation,
  useAdminDeleteRegionMutation,
  useAdminCreateDistrictMutation,
  useAdminUpdateDistrictMutation,
  useAdminDeleteDistrictMutation,
  useAdminCreateChiefdomMutation,
  useAdminUpdateChiefdomMutation,
  useAdminDeleteChiefdomMutation,
  useAdminCreateTownshipMutation,
  useAdminDeleteTownshipMutation,
  useAdminCreateFertilizerMutation,
  useAdminDeleteFertilizerMutation,
} from '../../../app/api/apiSlice';

const EntityCard = ({
  name, title, count, icon: Icon, onEdit, onDelete,
}) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black text-gray-900 leading-tight mb-2 line-clamp-1">{name}</p>
    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded w-fit">
      <span className="text-[10px] font-black text-gray-400 uppercase">Sub-units:</span>
      <span className="text-xs font-bold text-gray-700">{count || 0}</span>
    </div>
  </div>
);

EntityCard.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  icon: PropTypes.elementType.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

EntityCard.defaultProps = {
  count: 0,
};

const ReferenceModal = ({
  isOpen, onClose, type, data = {},
}) => {
  const [formData, setFormData] = useState({ name: '', parent_id: '' });

  // Mutations
  const [createRegion] = useAdminCreateRegionMutation();
  const [createDistrict] = useAdminCreateDistrictMutation();
  const [createChiefdom] = useAdminCreateChiefdomMutation();
  const [createTownship] = useAdminCreateTownshipMutation();
  const [createFertilizer] = useAdminCreateFertilizerMutation();
  const [updateDistrict] = useAdminUpdateDistrictMutation();
  const [updateChiefdom] = useAdminUpdateChiefdomMutation();

  // Parents for selection
  const { data: regions } = useAdminGetRegionsQuery();
  const { data: districts } = useAdminGetDistrictsQuery();
  const { data: chiefdoms } = useAdminGetChiefdomsQuery();

  useEffect(() => {
    if (data.id) {
      setFormData({
        name: data.name,
        parent_id: data.region_id || data.district_id || data.chiefdom_id || '',
      });
    } else {
      setFormData({ name: '', parent_id: '' });
    }
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'Regions') await createRegion({ name: formData.name }).unwrap();
      if (type === 'Districts') {
        const payload = { name: formData.name, region_id: formData.parent_id };
        if (data.id) {
          await updateDistrict({ id: data.id, ...payload }).unwrap();
        } else {
          await createDistrict(payload).unwrap();
        }
      }
      if (type === 'Chiefdoms') {
        const payload = { name: formData.name, district_id: formData.parent_id };
        if (data.id) {
          await updateChiefdom({ id: data.id, ...payload }).unwrap();
        } else {
          await createChiefdom(payload).unwrap();
        }
      }
      if (type === 'Townships') await createTownship({ name: formData.name, chiefdom_id: formData.parent_id }).unwrap();
      if (type === 'Fertilizers') await createFertilizer({ name: formData.name }).unwrap();

      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save failed:', err);
    }
  };

  const typeName = type.slice(0, -1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              {data.id ? 'Edit' : 'Add New'}
              {' '}
              {typeName}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <InputField
              label={`${typeName} Name`}
              placeholder="e.g. Northern Region"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {type === 'Districts' && (
              <CustomSelect
                label="Parent Region"
                placeholder="Select Region"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                options={(regions || []).map((r) => ({ value: r.id, label: r.name }))}
              />
            )}
            {type === 'Chiefdoms' && (
              <CustomSelect
                label="Parent District"
                placeholder="Select District"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                options={(districts || []).map((d) => ({ value: d.id, label: d.name }))}
                required
              />
            )}
            {type === 'Townships' && (
              <CustomSelect
                label="Parent Chiefdom"
                placeholder="Select Chiefdom"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                options={(chiefdoms || []).map((c) => ({ value: c.id, label: c.name }))}
                required
              />
            )}
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="bg-gray-900 text-white font-bold px-8" type="submit">
              {data.id ? 'Save Changes' : `Create ${typeName}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReferenceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    region_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    district_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    chiefdom_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

ReferenceModal.defaultProps = {
  data: {},
};

const DistrictsView = () => {
  const [activeTab, setActiveTab] = useState('Regions');
  const [modal, setModal] = useState({ open: false, data: {} });

  const { data: regions, isLoading: loadingR } = useAdminGetRegionsQuery();
  const { data: districts, isLoading: loadingD } = useAdminGetDistrictsQuery();
  const { data: chiefdoms, isLoading: loadingC } = useAdminGetChiefdomsQuery();
  const { data: townships, isLoading: loadingT } = useAdminGetTownshipsQuery();
  const { data: fertilizers, isLoading: loadingF } = useAdminGetFertilizersQuery();

  const [delRegion] = useAdminDeleteRegionMutation();
  const [delDistrict] = useAdminDeleteDistrictMutation();
  const [delChief] = useAdminDeleteChiefdomMutation();
  const [delTown] = useAdminDeleteTownshipMutation();
  const [delFert] = useAdminDeleteFertilizerMutation();

  const isLoading = loadingR || loadingD || loadingC || loadingT || loadingF;

  const handleDelete = (type, id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete this ${type.slice(0, -1)}?`)) {
      if (type === 'Regions') delRegion(id);
      if (type === 'Districts') delDistrict(id);
      if (type === 'Chiefdoms') delChief(id);
      if (type === 'Townships') delTown(id);
      if (type === 'Fertilizers') delFert(id);
    }
  };

  const tabs = [
    { id: 'Regions', icon: Globe },
    { id: 'Districts', icon: MapPin },
    { id: 'Chiefdoms', icon: LayoutGrid },
    { id: 'Townships', icon: Map },
    { id: 'Fertilizers', icon: Beaker },
  ];

  const activeTypeName = activeTab.slice(0, -1);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Geo-Spatial Settings</h2>
          <p className="text-gray-500 font-medium">Manage systems geographical hierarchy and reference data</p>
        </div>
        <Button
          type="button"
          className="bg-blue-600 text-white font-black px-6 hover:bg-blue-700 shadow-lg h-12 rounded-xl"
          onClick={() => setModal({ open: true, data: {} })}
        >
          <Plus className="mr-2 h-5 w-5" />
          {' '}
          Add
          {' '}
          {activeTypeName}
        </Button>
      </header>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit mb-10 shadow-inner">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {' '}
            {t.id}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-gray-900 border-t-transparent rounded-full" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Geo-Intelligence...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'Regions' && regions?.map((r) => (
            <EntityCard
              key={r.id}
              icon={Globe}
              title="Districts"
              count={r.districts_count}
              name={r.name}
              onEdit={() => setModal({ open: true, data: r })}
              onDelete={() => handleDelete('Regions', r.id)}
            />
          ))}
          {activeTab === 'Districts' && districts?.map((d) => (
            <EntityCard
              key={d.id}
              icon={MapPin}
              title="Chiefdoms"
              count={d.chiefdoms_count}
              name={d.name}
              onEdit={() => setModal({ open: true, data: d })}
              onDelete={() => handleDelete('Districts', d.id)}
            />
          ))}
          {activeTab === 'Chiefdoms' && chiefdoms?.map((c) => (
            <EntityCard
              key={c.id}
              icon={LayoutGrid}
              title="Townships"
              count={c.townships_count}
              name={c.name}
              onEdit={() => setModal({ open: true, data: c })}
              onDelete={() => handleDelete('Chiefdoms', c.id)}
            />
          ))}
          {activeTab === 'Townships' && townships?.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.chiefdom?.name || 'Chiefdom'}</p>
                <h4 className="text-xl font-black text-gray-900">{t.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => handleDelete('Townships', t.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          {activeTab === 'Fertilizers' && fertilizers?.map((f) => (
            <div key={f.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Beaker className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{f.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => handleDelete('Fertilizers', f.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ReferenceModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, data: {} })}
        type={activeTab}
        data={modal.data}
      />
    </div>
  );
};

export default DistrictsView;
