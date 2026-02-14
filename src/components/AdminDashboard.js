import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Store,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { logOut } from '../features/auth/authSlice';

import SidebarItem from './admin/SidebarItem';
import HomeView from './admin/views/HomeView';
import AgenciesView from './admin/views/AgenciesView';
import SubmissionsView from './admin/views/SubmissionsView';
import AdminsView from './admin/views/AdminsView';
import DealersView from './admin/views/DealersView';
import DistrictsView from './admin/views/DistrictsView';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Manage Agency', icon: Building2 },
    { label: 'Manage Submissions', icon: FileText },
    { label: 'Manage Admins', icon: Users },
    { label: 'Manage Dealers', icon: Store },
    { label: 'Manage Districts', icon: MapPin },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out relative`}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-10"
          type="button"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <div>
          <div className={`border-b border-gray-100 mb-4 h-20 flex flex-col justify-center ${isSidebarCollapsed ? 'items-center' : 'px-6'}`}>
            {isSidebarCollapsed ? (
              <span className="text-xl font-bold text-gray-900 tracking-tight">FD</span>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">Fertilizer Distribution</p>
              </>
            )}
          </div>
          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.label}
                onClick={() => setActiveTab(item.label)}
                collapsed={isSidebarCollapsed}
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 overflow-hidden">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-4 transition-all duration-300 ease-in-out`}>
            {user?.name ? (
              <div
                className="h-10 w-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-lg"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-lg">
                A
              </div>
            )}

            {!isSidebarCollapsed && (
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'} text-red-600 hover:text-red-700 hover:bg-red-50`}
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className={`${isSidebarCollapsed ? 'mr-0' : 'mr-2'} h-4 w-4`} />
            {!isSidebarCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'Home' && <HomeView />}
        {activeTab === 'Manage Agency' && <AgenciesView />}
        {activeTab === 'Manage Submissions' && <SubmissionsView />}
        {activeTab === 'Manage Admins' && <AdminsView />}
        {activeTab === 'Manage Dealers' && <DealersView />}
        {activeTab === 'Manage Districts' && <DistrictsView />}
        {activeTab !== 'Home' && activeTab !== 'Manage Agency' && activeTab !== 'Manage Submissions' && activeTab !== 'Manage Admins' && activeTab !== 'Manage Dealers' && activeTab !== 'Manage Districts' && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Work in progress:
            {' '}
            {activeTab}
          </div>
        )}
      </main>
    </div>
  );
}
