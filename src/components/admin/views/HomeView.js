import React, { useState } from 'react';
import {
  Building2,
  Store,
  MapPin,
  Search,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../ui/card';
import { CustomSelect } from '../../ui/form-elements';

const HomeView = () => {
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h2>
        <p className="text-gray-500 mt-2">View fertilizer distribution analytics by agency and district</p>
      </header>

      <Card className="shadow-sm border border-gray-100 bg-white">
        <CardHeader className="pb-4 border-b border-gray-50">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Agency Distribution by District
          </CardTitle>
          <CardDescription className="text-gray-500">
            Select an agency and district to view detailed distribution data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <CustomSelect
                label="Agency"
                placeholder="Select agency"
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                options={[
                  'Northern District Agency',
                  'Southern District Agency',
                  'Eastern District Agency',
                  'Western District Agency',
                ]}
              />
            </div>
            <div className="md:col-span-5">
              <CustomSelect
                label="District"
                placeholder="Select district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                options={['District A', 'District B', 'District C']}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                className="w-full bg-gray-600 hover:bg-gray-700 text-white shadow-none"
                size="lg"
              >
                <Search className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dealers Active</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last week</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+1 new district</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeView;
