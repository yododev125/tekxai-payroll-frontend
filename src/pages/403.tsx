import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-[#F5F5FA]">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
        <ShieldOff size={40} />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">403</h1>
        <p className="text-lg font-bold text-gray-500 mt-2">Access Denied</p>
        <p className="text-sm text-gray-400 mt-1 max-w-sm">
          You don't have permission to view this page. Contact your administrator if you believe this is an error.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl bg-[#005CDA] text-white text-sm font-bold hover:bg-[#0047AB] transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
