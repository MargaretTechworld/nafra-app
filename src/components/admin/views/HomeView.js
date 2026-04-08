import React from 'react';
import PropTypes from 'prop-types';
import {
  Building2,
  Store,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/card';

import {
  useListAgenciesQuery,
  useGetDealersQuery,
  useAdminGetDistrictsQuery,
  useBagsByDistrictQuery,
  useBagsByAgencyQuery,
  useLicenseStatusSummaryQuery,
} from '../../../app/api/apiSlice';

const DataBadge = ({ label, value, colorClass = 'text-blue-600 bg-blue-50' }) => (
  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${colorClass}`}>
    <span>
      {label}
      :
    </span>
    <span>{value}</span>
  </div>
);

DataBadge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colorClass: PropTypes.string,
};

DataBadge.defaultProps = {
  colorClass: 'text-blue-600 bg-blue-50',
};

const SimpleBarChart = ({
  data, labelKey, valueKey25, valueKey50, title,
}) => {
  const maxVal = Math.max(
    ...data.map((d) => (Number(d[valueKey25]) || 0) + (Number(d[valueKey50]) || 0)),
    1,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h4 className="text-sm font-bold text-gray-700">{title}</h4>
        <div className="flex gap-3">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-500">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            25kg
          </div>
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            50kg
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.slice(0, 5).map((item) => {
          const v25 = Number(item[valueKey25]) || 0;
          const v50 = Number(item[valueKey50]) || 0;
          const total = v25 + v50;
          const pct25 = (v25 / maxVal) * 100;
          const pct50 = (v50 / maxVal) * 100;

          return (
            <div key={item[labelKey]} className="group">
              <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-600">
                <span>{item[labelKey]}</span>
                <span className="text-gray-400 group-hover:text-gray-900 transition-colors uppercase text-[10px] font-bold">
                  Total:
                  {' '}
                  {total}
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
                  style={{ width: `${pct25}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                  style={{ width: `${pct50}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

SimpleBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  labelKey: PropTypes.string.isRequired,
  valueKey25: PropTypes.string.isRequired,
  valueKey50: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const HomeView = () => {
  // Core Data
  const { data: agenciesData, isLoading: isLoadingAgencies } = useListAgenciesQuery();
  const { data: dealers, isLoading: isLoadingDealers } = useGetDealersQuery();
  // Pre-fetch districts for reference
  useAdminGetDistrictsQuery();

  // Analytics Data
  const {
    data: bagsPerDistrict, isLoading: isLoadingDistrictAnalytics,
  } = useBagsByDistrictQuery();
  const {
    data: bagsPerAgency, isLoading: isLoadingAgencyAnalytics,
  } = useBagsByAgencyQuery();
  const {
    data: licenseSummary, isLoading: isLoadingLicenseSummary,
  } = useLicenseStatusSummaryQuery();

  const agencies = agenciesData || [];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gray-900 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Intelligence Dashboard</h2>
          </div>
          <p className="text-gray-500">Real-time fertilizer distribution analytics and compliance monitoring</p>
        </div>
        <div className="hidden md:flex gap-2">
          <DataBadge label="Status" value="Live" colorClass="text-green-600 bg-green-50 ring-1 ring-green-100" />
          <DataBadge label="Data Updated" value={new Date().toLocaleTimeString()} colorClass="text-gray-600 bg-gray-50 ring-1 ring-gray-200" />
        </div>
      </header>

      {/* Grid: Charts & Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* District Chart Card */}
        <Card className="lg:col-span-8 shadow-sm border-0 bg-white ring-1 ring-gray-100 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Top 5 Districts</CardTitle>
              <CardDescription>By total distribution volume</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingDistrictAnalytics && (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
            {!isLoadingDistrictAnalytics && bagsPerDistrict && bagsPerDistrict.length > 0 && (
              <SimpleBarChart
                data={bagsPerDistrict}
                title="Total distribution (25kg + 50kg)"
                labelKey="district"
                valueKey25="bags_25kg"
                valueKey50="bags_50kg"
              />
            )}
            {!isLoadingDistrictAnalytics && (!bagsPerDistrict || bagsPerDistrict.length === 0) && (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                <MapPin className="h-8 w-8 opacity-20" />
                <p className="text-sm font-medium">No distribution data found yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* High-Level Monitoring Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Dashboard Summary Mini-Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">
                    {isLoadingAgencies ? '...' : agencies.length}
                  </div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-tight">Active Agencies</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">
                    {isLoadingDealers ? '...' : (dealers?.length || 0)}
                  </div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-tight">Verified Dealers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Card */}
          <Card className="border-0 shadow-lg bg-gray-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <CardHeader className="z-10 relative">
              <CardTitle className="text-lg font-bold">Compliance Status</CardTitle>
              <CardDescription className="text-gray-400">Real-time licensing monitoring</CardDescription>
            </CardHeader>
            <CardContent className="z-10 relative">
              {isLoadingLicenseSummary ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-white/5 rounded w-full" />
                  <div className="h-8 bg-white/5 rounded w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center group cursor-help">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 ring-1 ring-green-900">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Fully Licensed</span>
                    </div>
                    <span className="text-xl font-bold">{licenseSummary?.active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-help">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-900/50 flex items-center justify-center text-red-400 ring-1 ring-red-900">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Expired/No License</span>
                    </div>
                    <span className="text-xl font-bold text-red-400">{licenseSummary?.expired || licenseSummary?.unlicensed || 0}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button type="button" className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white transition-colors group">
                      VIEW FULL COMPLIANCE LOG
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-0 bg-white ring-1 ring-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Agency Leaderboard</CardTitle>
            <CardDescription>Contribution by distribution volume</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAgencyAnalytics && (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
            {!isLoadingAgencyAnalytics && bagsPerAgency && bagsPerAgency.length > 0 && (
              <SimpleBarChart
                data={bagsPerAgency}
                title="Agency Total Volume"
                labelKey="agency"
                valueKey25="bags_25kg"
                valueKey50="bags_50kg"
              />
            )}
            {!isLoadingAgencyAnalytics && (!bagsPerAgency || bagsPerAgency.length === 0) && (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Building2 className="h-8 w-8 opacity-20" />
                <p className="text-sm font-medium">No agency data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips / System Info */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl ring-1 ring-white/20">
          <div className="absolute bottom-0 right-0 p-12 opacity-10">
            <BarChart3 className="h-48 w-48" />
          </div>
          <h3 className="text-2xl font-black mb-4 z-10 relative">System Status</h3>
          <p className="text-blue-100 mb-8 max-w-sm z-10 relative leading-relaxed">
            All systems are operational. Total verified users:
            {' '}
            <span className="text-white font-bold">{agencies.length + (dealers?.length || 0)}</span>
            . Last sync completed at
            {' '}
            <span className="text-white font-bold">{new Date().toLocaleTimeString()}</span>
            .
          </p>
          <Button className="bg-white text-blue-700 hover:bg-white/90 font-bold px-8 shadow-lg transition-transform active:scale-95 z-10 relative border-0">
            Download Global Summary
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
