import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Search, User, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../App';

export default function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: Search, label: 'استكشف', path: '/explore' },
    { icon: BookOpen, label: 'دوراتي', path: '/my-courses' },
    ...(isAdmin ? [{ icon: LayoutDashboard, label: 'الإدارة', path: '/admin' }] : []),
    { icon: User, label: 'حسابي', path: '/profile' },
  ];

  // Hide bottom nav on login page
  if (location.pathname === '/login') return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xs">
      <nav className="glass rounded-2xl p-1.5 flex items-center justify-around shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative group p-2 flex flex-col items-center gap-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative z-10 transition-all duration-300",
                  isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]")} />
              </motion.div>
              
              <span className={cn(
                "text-[9px] font-bold transition-all duration-300",
                isActive ? "text-purple-400 opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100"
              )}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-purple-500/10 rounded-2xl -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
