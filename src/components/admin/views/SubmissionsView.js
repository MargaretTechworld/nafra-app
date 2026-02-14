import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  Plus,
  Calendar,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
} from '../../ui/card';
import { CustomSelect, InputField } from '../../ui/form-elements';

const SubmissionCard = ({ submission }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-4">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-gray-900">
            Submission #
            {submission.id}
          </h3>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {submission.date}
          </span>
        </div>
        <p className="text-sm text-gray-500">{submission.agencyName}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Submitted By
        </p>
        <div className="font-medium text-gray-900">{submission.submittedBy.name}</div>
        <div className="text-xs text-gray-500">{submission.submittedBy.email}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Total 25kg Bags
        </p>
        <div className="text-2xl font-bold text-blue-600">{submission.total25kg}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Total 50kg Bags
        </p>
        <div className="text-2xl font-bold text-green-600">{submission.total50kg}</div>
      </div>
    </div>

    <div className="pt-6 border-t border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">
        Distribution Items (
        {submission.items.length}
        )
      </h4>
      <div className="space-y-4">
        {submission.items.map((item) => (
          <div key={item.id || item.name} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded-lg">
            <div className="mb-2 md:mb-0">
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.location}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.dealer}</div>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-blue-600">
                {item.qty25}
                {' '}
                x 25kg
              </span>
              <span className="text-green-600">
                {item.qty50}
                {' '}
                x 50kg
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

SubmissionCard.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    agencyName: PropTypes.string.isRequired,
    submittedBy: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    total25kg: PropTypes.number.isRequired,
    total50kg: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      dealer: PropTypes.string.isRequired,
      qty25: PropTypes.number.isRequired,
      qty50: PropTypes.number.isRequired,
    })).isRequired,
  }).isRequired,
};

const CreateSubmissionModal = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([1]);

  if (!isOpen) return null;

  const addItem = () => {
    setItems([...items, items.length + 1]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Create New Submission</h3>
            <p className="text-sm text-gray-500 mt-1">
              Submit fertilizer distribution data for tracking and analytics
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
          {/* Top Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelect
              label="Agency *"
              placeholder="Select agency"
              value=""
              onChange={() => { }}
              options={['Northern District Agency', 'Southern District Agency']}
            />
            <div className="space-y-2 w-full">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="submission-date" className="text-sm font-medium text-gray-700 block text-left">
                Submission Date *
              </label>
              <div className="relative">
                <input
                  id="submission-date"
                  type="date"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 pl-3 outline-none transition-colors"
                  defaultValue="2026-02-13"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Distribution Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Distribution Items</h4>
              <Button
                onClick={addItem}
                className="bg-gray-900 hover:bg-gray-800 text-white"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={item} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <h5 className="text-sm font-medium text-gray-900 mb-4">
                    Item
                    {' '}
                    {index + 1}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CustomSelect
                      label="District *"
                      placeholder="Select district"
                      value=""
                      onChange={() => { }}
                      options={['District A', 'District B']}
                    />
                    <CustomSelect
                      label="Chiefdom *"
                      placeholder="Select chiefdom"
                      value=""
                      onChange={() => { }}
                      options={['Chiefdom A', 'Chiefdom B']}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CustomSelect
                      label="Fertilizer *"
                      placeholder="Select fertilizer"
                      value=""
                      onChange={() => { }}
                      options={['NPK 15-15-15', 'Urea']}
                    />
                    <CustomSelect
                      label="Dealer *"
                      placeholder="Select dealer"
                      value=""
                      onChange={() => { }}
                      options={['Green Agro (LIC001)', 'Farm Supplies (LIC002)']}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="25kg Bags" placeholder="0" type="number" />
                    <InputField label="50kg Bags" placeholder="0" type="number" />
                  </div>
                </div>
              ))}
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
            Create Submission
          </Button>
        </div>
      </div>
    </div>
  );
};

CreateSubmissionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const SubmissionsView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterAgency, setFilterAgency] = useState('');

  const submissions = [
    {
      id: 1,
      agencyName: 'Northern District Agency - Phase 2',
      date: '2026-02-10',
      submittedBy: { name: 'John Doe', email: 'john@example.com' },
      total25kg: 270,
      total50kg: 135,
      items: [
        {
          id: 'item-1',
          name: 'NPK 15-15-15',
          location: 'Bombali - Bombali Sebora',
          dealer: 'Dealer: Green Agro (LIC001)',
          qty25: 150,
          qty50: 75,
        },
        {
          id: 'item-2',
          name: 'Urea',
          location: 'Bombali - Sanda Loko',
          dealer: 'Dealer: Farm Supplies Co (LIC002)',
          qty25: 120,
          qty50: 60,
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Submissions</h2>
          <p className="text-gray-500 mt-2">View and create fertilizer distribution submissions</p>
        </div>
        <Button
          className="bg-gray-900 hover:bg-gray-800 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Submission
        </Button>
      </header>

      <Card className="shadow-sm border border-gray-100 bg-white mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-12">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              <CustomSelect
                label="Filter by Agency"
                placeholder="All agencies"
                value={filterAgency}
                onChange={(e) => setFilterAgency(e.target.value)}
                options={['Northern District Agency', 'Southern District Agency']}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
      </div>

      <CreateSubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SubmissionsView;
