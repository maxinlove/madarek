import React from 'react';
import { User, Settings, Award, LogOut, Shield, Bell, HelpCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, userData, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('madarek_demo_mode');
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;

  const menuItems = [
    ...(isAdmin ? [{ icon: LayoutDashboard, label: 'لوحة التحكم (الإدارة)', path: '/admin' }] : []),
    { icon: Settings, label: 'إعدادات الحساب', path: '/settings' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Profile Header */}
      <div className="glass rounded-[2rem] p-8 mb-8 text-center relative overflow-hidden border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600/20 to-purple-800/20 blur-3xl -z-10" />
        
        <div className="relative inline-block mb-6">
          <div className="h-24 w-24 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-purple-600/40 border-4 border-white/10">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-xl border-4 border-slate-900 flex items-center justify-center shadow-xl">
            <Shield className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{user.displayName || 'مستخدم جديد'}</h1>
        <p className="text-slate-400 text-base mb-6">{user.email}</p>

        <div className="flex flex-wrap justify-center gap-3">
          {userData?.interests?.map((interest: string) => (
            <span key={interest} className="px-4 py-1.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(item.path)}
            className="glass p-4 rounded-2xl border-white/5 hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon className="h-5 w-5 text-slate-400 group-hover:text-purple-400" />
              </div>
              <span className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">{item.label}</span>
            </div>
            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
              <Shield className="h-3 w-3 text-slate-600 group-hover:text-purple-400 rotate-180" />
            </div>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
          onClick={handleLogout}
          className="w-full glass p-4 rounded-2xl border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center gap-4 group"
        >
          <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogOut className="h-5 w-5 text-red-500" />
          </div>
          <span className="text-base font-bold text-red-500">تسجيل الخروج</span>
        </motion.button>
      </div>
    </div>
  );
}
