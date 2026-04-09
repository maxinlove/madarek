import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, BookOpen, User as UserIcon, Search, LayoutDashboard, Home } from 'lucide-react';
import { useAuth } from '../App';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('madarek_demo_mode');
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'استكشف', path: '/explore', icon: Search },
    { name: 'دوراتي', path: '/my-courses', icon: BookOpen },
    ...(isAdmin ? [{ name: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col font-arabic text-slate-100 light-mode:text-slate-900" dir="rtl">
      {/* Header */}
      {location.pathname !== '/login' && (
        <header className="header-main sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-xl shadow-lg shadow-purple-600/20">
                    <BookOpen className="h-5 w-5 text-white!" />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">Madarek +</span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium transition-all duration-300",
                        location.pathname === item.path 
                          ? "text-purple-400" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link to="/profile" className="hidden sm:flex flex-col items-end hover:opacity-80 transition-opacity">
                      <span className="text-xs font-bold text-white">{user.displayName || 'مستخدم'}</span>
                      <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">{isAdmin ? 'مسؤول' : 'طالب'}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="تسجيل الخروج"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-xs font-bold shadow-lg shadow-purple-600/20"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    تسجيل الدخول
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow pb-32">
        {children}
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Banner Ad Placeholder */}
      <div className="bg-black/20 py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="glass-card w-full max-w-[728px] h-[90px] flex items-center justify-center text-slate-500 text-xs font-bold rounded-2xl border border-dashed border-white/10">
            مساحة إعلانية (Banner Ad)
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-main py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <span className="text-xl font-bold text-white">Madarek +</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} مدارك بلس. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}

