import React, { useEffect, useState } from 'react';
import { Moon, Sun, ChevronRight, Shield, Bell, Eye, Globe, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return !document.documentElement.classList.contains('light-mode');
  });

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('madarek_theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('madarek_theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('madarek_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.remove('light-mode');
      setIsDarkMode(true);
    }
  }, []);

  const settingsGroups = [
    {
      title: 'التفضيلات',
      items: [
        { 
          icon: isDarkMode ? Moon : Sun, 
          label: 'المظهر', 
          value: isDarkMode ? 'الوضع الليلي' : 'الوضع النهاري',
          action: (
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-purple-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-1' : 'translate-x-6'}`} />
            </button>
          )
        },
        { icon: Globe, label: 'اللغة', value: 'العربية', path: '#' },
      ]
    },
    {
      title: 'عن التطبيق',
      items: [
        { icon: Smartphone, label: 'الإصدار', value: '1.0.2', path: '#' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/20">
          <ChevronRight className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">الإعدادات</h1>
          <p className="text-xs text-slate-400">خصص تجربتك التعليمية في مدارك بلس</p>
        </div>
      </div>

      <div className="space-y-8">
        {settingsGroups.map((group, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-bold text-slate-500 mb-4 px-2 uppercase tracking-wider">{group.title}</h2>
            <div className="space-y-3">
              {group.items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx * 3 + i) * 0.05 }}
                  className="glass p-4 rounded-2xl border-white/5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="h-5 w-5 text-slate-400 group-hover:text-purple-400" />
                    </div>
                    <div>
                      <span className="text-base font-bold text-slate-200 block">{item.label}</span>
                      {item.value && <span className="text-[10px] text-slate-500">{item.value}</span>}
                    </div>
                  </div>
                  
                  {item.action ? (
                    item.action
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
