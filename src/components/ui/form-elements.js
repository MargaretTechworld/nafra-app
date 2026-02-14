import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

export const CustomSelect = ({
  label, placeholder, options, value, onChange,
}) => {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-2 w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 block text-left">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 transition-colors"
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

CustomSelect.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export const InputField = ({
  label, placeholder, type = 'text', value, onChange,
}) => {
  const id = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return (
    <div className="space-y-2 w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 block text-left">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors placeholder:text-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

InputField.defaultProps = {
  placeholder: '',
  type: 'text',
  value: '',
  onChange: () => { },
};
