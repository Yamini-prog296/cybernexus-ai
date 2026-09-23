import React from 'react';
import { Shield } from 'lucide-react';

export default function LoadingState({ message = "Processing threat intelligence stream..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
        <Shield className="w-5 h-5 text-blue-400 absolute" />
      </div>
      <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">{message}</p>
    </div>
  );
}
