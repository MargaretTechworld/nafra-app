import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FileText,
  Calendar,
  Building2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  User,
  Package,
  X,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  FlaskConical,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
} from '../../ui/card';
import { CustomSelect } from '../../ui/form-elements';

import {
  useListSubmissionsQuery,
  useListAgenciesQuery,
  useDeleteSubmissionMutation,
} from '../../../app/api/apiSlice';

const SubmissionDetailModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

  const totalBags25kg = Number(submission.total_bags_25kg) || 0;
  const totalBags50kg = Number(submission.total_bags_50kg) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
          <div className="flex gap-5">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Audit Date:
                  {' '}
                  {submission.submitted_at?.split(' ')[0] || 'N/A'}
                </h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">Verified Record</span>
              </div>
              <p className="text-gray-500 font-medium flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {' '}
                {submission.submitted_at}
                <span className="mx-2 text-gray-300">|</span>
                <User className="h-4 w-4" />
                {' '}
                Submitted by
                {' '}
                {submission.submitted_by?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Info Bar with Gradient */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20">
              <Building2 className="h-6 w-6 text-blue-100" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] leading-none mb-1.5 font-mono">Registry Master Agency</p>
              <p className="font-black text-xl tracking-tight">{submission.agency?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl ring-1 ring-white/20 text-right min-w-[140px]">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-2">Total 25kg</p>
              <div className="flex items-center justify-end gap-2">
                <Package className="h-4 w-4 text-blue-200 opacity-60" />
                <p className="font-black text-2xl">{totalBags25kg.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl ring-1 ring-white/20 text-right min-w-[140px]">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-2">Total 50kg</p>
              <div className="flex items-center justify-end gap-2">
                <Package className="h-4 w-4 text-blue-200 opacity-60" />
                <p className="font-black text-2xl">{totalBags50kg.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Itemized Distribution Log</h4>
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 bg-white">
              <table className="w-full text-left">
                <thead className="bg-[#1e293b] text-white">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">District</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Chiefdom</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Fertilizer Type</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Dealer / Dealership</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right opacity-80">25kg Bags</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right opacity-80">50kg Bags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.values((submission.submission_items || []).reduce((acc, item) => {
                    const key = `${item.district?.id}-${item.chiefdom?.id}-${item.fertilizer?.id}-${item.dealer?.id}`;
                    if (!acc[key]) {
                      acc[key] = { ...item, bags_25kg: 0, bags_50kg: 0 };
                    }
                    acc[key].bags_25kg += Number(item.bags_25kg || 0);
                    acc[key].bags_50kg += Number(item.bags_50kg || 0);
                    return acc;
                  }, {})).map((item) => (
                    <tr key={`${item.id}-display`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {item.district?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-sm font-bold text-gray-700">
                            {item.chiefdom?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="text-xs font-black text-gray-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-tighter">
                            {item.fertilizer?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm font-bold text-gray-700 tracking-tight">
                            {item.dealer?.name || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-bold text-blue-600">
                        {item.bags_25kg}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-bold text-green-600">
                        {item.bags_50kg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" className="border-gray-200 text-gray-600 font-bold px-8 rounded-xl h-12" onClick={onClose}>
            Close Report
          </Button>
          <Button className="bg-blue-600 text-white font-black px-10 rounded-xl h-12 shadow-lg shadow-blue-100 flex items-center gap-2">
            <Download className="h-4 w-4" />
            {' '}
            Download PDF Extract
          </Button>
        </div>
      </div>
    </div>
  );
};

SubmissionDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  submission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    submitted_at: PropTypes.string,
    submitted_by: PropTypes.shape({ name: PropTypes.string }),
    agency: PropTypes.shape({ name: PropTypes.string }),
    total_bags_25kg: PropTypes.number,
    total_bags_50kg: PropTypes.number,
    submission_items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      chiefdom: PropTypes.shape({ name: PropTypes.string }),
      fertilizer: PropTypes.shape({ name: PropTypes.string }),
      bags_25kg: PropTypes.number,
      bags_50kg: PropTypes.number,
    })),
  }),
};

SubmissionDetailModal.defaultProps = {
  submission: null,
};

const DeleteConfirmationModal = ({
  isOpen, onClose, onConfirm, submission, isDeleting,
}) => {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-red-50">
        <div className="p-8 text-center">
          <div className="h-20 w-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-red-100 animate-pulse">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Registry Override</h3>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed px-4">
            You are about to execute a
            {' '}
            <span className="text-red-600 font-black">Permanent Erasure</span>
            {' '}
            of distribution record
            {' '}
            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-bold">
              #
              {submission.id}
            </span>
            . This cannot be reversed.
          </p>

          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-100 text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Eradicating...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  Confirm Deletion
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 text-gray-400 font-bold hover:text-gray-900 transition-colors"
              onClick={onClose}
              disabled={isDeleting}
            >
              Retain Record
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  submission: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
  isDeleting: PropTypes.bool,
};

DeleteConfirmationModal.defaultProps = {
  submission: null,
  isDeleting: false,
};

const SubmissionRow = ({ submission, onOpenReport, onDelete }) => {
  const v25 = Number(submission.total_bags_25kg) || 0;
  const v50 = Number(submission.total_bags_50kg) || 0;
  const totalBags = v25 + v50;

  return (
    <tr className="group hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm ring-1 ring-gray-100 group-hover:ring-blue-500">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-none mb-1">
              {submission.submitted_at?.split(' ')[0] || 'N/A'}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              REPORT ID: #
              {submission.id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <span className="text-sm font-bold text-gray-800">
            {submission.agency?.name || 'Unassigned'}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-[10px] font-black uppercase ring-1 ring-indigo-100">
            {(submission.submitted_by?.name || 'U')[0]}
          </div>
          <span className="text-sm font-medium">{submission.submitted_by?.name || 'System User'}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-gray-900 font-black">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-base tracking-tight">
              {totalBags}
              {' '}
              <span className="text-[10px] text-gray-400 font-black">BAGS</span>
            </span>
          </div>
          <div className="flex gap-2">
            {submission.total_bags_25kg > 0 && (
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md ring-1 ring-blue-100/50">
                25KG:
                {submission.total_bags_25kg}
              </span>
            )}
            {submission.total_bags_50kg > 0 && (
              <span className="text-[9px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-md ring-1 ring-green-100/50">
                50KG:
                {submission.total_bags_50kg}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-black text-blue-600 border-blue-100 bg-white hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all active:scale-95 border-b-2 border-blue-200 hover:border-blue-700"
            onClick={() => onOpenReport(submission)}
          >
            View Full Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 flex items-center justify-center text-red-500 border-red-50 bg-red-50/30 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-all active:scale-95 border-b-2 border-red-100 hover:border-red-600"
            onClick={() => onDelete(submission)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

SubmissionRow.propTypes = {
  submission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    submitted_at: PropTypes.string,
    submitted_by: PropTypes.shape({ name: PropTypes.string }),
    agency: PropTypes.shape({ name: PropTypes.string }),
    total_bags_25kg: PropTypes.number,
    total_bags_50kg: PropTypes.number,
  }).isRequired,
  onOpenReport: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const SubmissionsView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [filterAgency, setFilterAgency] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const { data, isLoading, error } = useListSubmissionsQuery({
    agency_id: filterAgency,
    page,
    per_page: perPage,
  });

  const [deleteSubmission, { isLoading: isDeleting }] = useDeleteSubmissionMutation();

  const { data: agenciesData } = useListAgenciesQuery();
  const agencies = agenciesData || [];

  const submissions = data?.submissions || [];
  const pagination = data?.pagination || { total_pages: 1, current_page: 1 };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;

    const headers = ['ID', 'Agency', 'Submitted At', 'Submitter', 'Total 25kg', 'Total 50kg'];
    const rows = submissions.map((s) => [
      s.id,
      s.agency?.name || 'N/A',
      s.submitted_at,
      s.submitted_by?.name || 'N/A',
      s.total_bags_25kg || 0,
      s.total_bags_50kg || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nafra-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-blue-600/10 rounded-full" />
            <div className="absolute top-0 left-0 h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] font-mono">Decoding Registry...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-16 text-center bg-red-50 border border-red-100 rounded-[2.5rem] shadow-inner">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-black tracking-tight mb-4 uppercase">Registry Integrity Check Failed</p>
          <Button variant="outline" className="h-12 px-10 border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-100" onClick={() => window.location.reload()}>Re-Establish Handshake</Button>
        </div>
      );
    }

    if (submissions.length === 0) {
      return (
        <div className="py-40 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[3rem] animate-in fade-in duration-700">
          <FileText className="h-20 w-20 text-gray-200 mx-auto mb-6" />
          <p className="text-2xl font-black text-gray-400 uppercase tracking-tight">No Verified Distribution Records Found</p>
          <p className="text-gray-400 text-sm font-medium mt-2">The selected parameters returned zero audit entries</p>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        <div className="bg-white rounded-[2.5rem] ring-1 ring-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Audit Sequence</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registered Agency</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Lead</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Distribution Vol.</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  onOpenReport={(sub) => setSelectedReport(sub)}
                  onDelete={(sub) => setSubmissionToDelete(sub)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-between items-center py-8 px-4 bg-gray-50/50 rounded-3xl ring-1 ring-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Viewing sequence
              {' '}
              <span className="text-blue-600">{pagination.current_page}</span>
              {' '}
              /
              {' '}
              {pagination.total_pages}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-2xl h-12 w-12 p-0 border-gray-200 shadow-sm hover:bg-white hover:shadow-md disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Button>

              <div className="flex gap-2">
                {[...Array(pagination.total_pages)].slice(0, 5).map((_, i) => (
                  <button
                    type="button"
                    key={`page-${i + 1}`}
                    onClick={() => setPage(i + 1)}
                    className={`h-12 w-12 text-sm font-black rounded-2xl transition-all ${page === i + 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100'
                      : 'bg-white text-gray-400 hover:text-blue-600 hover:shadow-md ring-1 ring-gray-100 font-bold'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={page === pagination.total_pages}
                onClick={() => setPage(page + 1)}
                className="rounded-2xl h-12 w-12 p-0 border-gray-200 shadow-sm hover:bg-white hover:shadow-md disabled:opacity-20 transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gray-900 rounded-2xl shadow-xl ring-1 ring-white/10">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Audit Archive</h2>
          </div>
          <p className="text-gray-500 font-medium">Systematic distribution records and intelligence-driven audit logs</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-white border-gray-200 text-gray-700 font-bold h-12 px-6 rounded-2xl hover:bg-gray-50 flex items-center gap-2 shadow-sm border-b-2 border-gray-300"
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-8 rounded-2xl shadow-lg border-b-2 border-blue-800 flex items-center gap-2 transition-transform active:scale-95 translate-y-[-2px]"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Direct Audit Entry
          </Button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <Card className="mb-10 border-0 bg-white ring-1 ring-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden rounded-3xl">
        <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
          <div className="p-8 flex-1 flex flex-col md:flex-row items-end gap-8">
            <div className="w-full md:w-96">
              <CustomSelect
                label="Registered Agency Focus"
                placeholder="Showing Global Registry"
                value={filterAgency}
                onChange={(e) => {
                  setFilterAgency(e.target.value);
                  setPage(1);
                }}
                options={agencies.map((a) => ({ value: a.id, label: a.name }))}
              />
            </div>
            <div className="pb-1">
              <Button
                type="button"
                variant="ghost"
                className={`text-xs font-black uppercase h-11 px-6 rounded-xl hover:shadow-inner ${filterAgency ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-300 pointer-events-none'}`}
                onClick={() => {
                  setFilterAgency('');
                  setPage(1);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <div className="bg-gray-50/50 px-10 py-6 flex items-center gap-12 border-l border-gray-100">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Total Records</p>
              <p className="text-3xl font-black text-gray-900">{pagination.total_count || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Active View</p>
              <p className="text-3xl font-black text-blue-600">{pagination.current_page}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderContent()}

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        submission={selectedReport}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!submissionToDelete}
        submission={submissionToDelete}
        isDeleting={isDeleting}
        onClose={() => setSubmissionToDelete(null)}
        onConfirm={async () => {
          try {
            await deleteSubmission(submissionToDelete.id).unwrap();
            setSubmissionToDelete(null);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to delete submission:', err);
          }
        }}
      />

      {/* Modal for Direct Entry (Coming Soon) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white p-14 rounded-[3rem] shadow-2xl text-center ring-1 ring-black/5 border border-white/20">
            <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-blue-100">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 uppercase mb-4 tracking-tight">Direct Entry Interface</h3>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">The administrative override terminal is currently undergoing security validation and will be available in the next deployment cycle.</p>
            <Button
              type="button"
              className="bg-gray-900 hover:bg-black text-white font-black h-14 px-14 rounded-2xl shadow-xl w-full text-lg transition-transform active:scale-95"
              onClick={() => setIsModalOpen(false)}
            >
              Secure Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsView;
