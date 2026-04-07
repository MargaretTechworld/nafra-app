import React from 'react';
import PropTypes from 'prop-types';

const SidebarItem = ({
  icon: Icon, label, active = false, onClick = () => { }, collapsed = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-3'} py-2 text-sm font-medium rounded-md transition-colors ${active
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
    title={collapsed ? label : undefined}
  >
    <Icon className="h-5 w-5" />
    {!collapsed && <span>{label}</span>}
  </button>
);

SidebarItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  collapsed: PropTypes.bool,
};

SidebarItem.defaultProps = {
  active: false,
  onClick: () => { },
  collapsed: false,
};

export default SidebarItem;
