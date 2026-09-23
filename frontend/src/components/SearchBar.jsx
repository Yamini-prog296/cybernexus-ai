import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, placeholder = "Search events, entities, IPs, or resources..." }) {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 bg-[#0f1422] border border-[#1e293b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 transition-colors focus:outline-none"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
