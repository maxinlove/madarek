import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Rocket, ArrowRight, User, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [step, setStep] = useState<'initial' | 'guest-form'>('initial');
  const [guestName, setGuestName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();

  const categories = [
    { id: 'prog', name: 'برمجة', icon: 'Code' },
    { id: 'design', name: 'تصميم', icon: 'Palette' },
    { id: 'ai', name: 'ذكاء اصطناعي', icon: 'Cpu' },
    { id: 'marketing', name: 'تسويق', icon: 'Megaphone' },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          role: 'user',
          createdAt: serverTimestamp(),
          onboarded: false, // They might need to pick interests later
          displayName: user.displayName || 'مستخدم جديد',
          email: user.email || '',
          isGuest: false,
          interests: []
        });
      }
      
      navigate('/');
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setError('حدث خطأ أثناء تسجيل الدخول بواسطة Google. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!guestName.trim()) {
      setError('يرجى إدخال اسمك أولاً');
      return;
    }
    if (selectedInterests.length === 0) {
      setError('يرجى اختيار اهتمام واحد على الأقل');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Check if we are already signed in (e.g. via Google but completing onboarding)
      let user = auth.currentUser;
      
      if (!user) {
        const result = await signInAnonymously(auth);
        user = result.user;
      }
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'user',
        createdAt: serverTimestamp(),
        onboarded: true,
        displayName: guestName,
        interests: selectedInterests,
        isGuest: !user.email,
        email: user.email || ''
      });
      
      navigate('/');
    } catch (err: any) {
      console.error("Sign-in failed:", err);
      if (err.code === 'auth/admin-restricted-operation') {
        setError(
          <div className="text-right space-y-3">
            <p className="font-bold text-red-400 text-xs">خطأ: الدخول المجهول غير مفعل في Firebase.</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              لحل هذه المشكلة، يرجى الذهاب إلى لوحة تحكم Firebase وتفعيل "Anonymous Auth":
            </p>
            <a 
              href={`https://console.firebase.google.com/project/gen-lang-client-0879599773/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-center text-[10px] text-red-300 hover:bg-red-500/30 transition-all"
            >
              فتح إعدادات Firebase
            </a>
            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] text-slate-500 mb-2">أو يمكنك الدخول في "وضع التجربة" لرؤية التصميم فقط:</p>
              <button 
                onClick={() => {
                  localStorage.setItem('madarek_demo_mode', 'true');
                  window.location.reload();
                }}
                className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-300 hover:bg-white/10 transition-all"
              >
                دخول (وضع التجربة)
              </button>
            </div>
          </div>
        );
      } else {
        setError('حدث خطأ أثناء الدخول. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0B0E14]">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-700/20 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-8 sm:p-10 rounded-[3rem] relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 'initial' ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="mb-10">
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="h-16 w-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-[1.2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-600/40"
                >
                  <Rocket className="h-8 w-8 text-white" />
                </motion.div>
                
                <h1 className="text-xl font-bold text-white mb-3 leading-tight">
                  ابدأ مسارك التعليمي <br /> 
                  <span className="text-gradient">وابني خبرة مميزة</span>
                </h1>
                
                <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mx-auto">
                  اكتشف مئات الدورات المجانية والمدفوعة في مختلف المجالات التقنية والمهنية.
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-4 px-8 py-4 bg-white text-slate-900 rounded-[1.2rem] font-bold text-sm hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>تسجيل الدخول بواسطة Google</span>
                    </>
                  )}
                </motion.button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="shrink-0 px-4 text-xs text-slate-500">أو</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('guest-form')}
                  disabled={loading}
                  className="w-full group flex items-center justify-center gap-4 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-[1.2rem] font-bold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>الدخول كزائر</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-[-4px] transition-transform rotate-180" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guest-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button 
                onClick={() => setStep('initial')}
                className="text-slate-500 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                رجوع
              </button>

              <h2 className="text-xl font-bold text-white mb-1">بيانات الزائر</h2>
              <p className="text-slate-400 text-xs mb-6">أخبرنا عنك لنخصص لك أفضل المحتويات</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">اسمك الكريم</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: أحمد علي"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">ما هي اهتماماتك؟</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => toggleInterest(cat.id)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-medium",
                          selectedInterests.includes(cat.id)
                            ? "bg-purple-600/20 border-purple-500 text-purple-300"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "h-4 w-4 rounded-md flex items-center justify-center shrink-0",
                          selectedInterests.includes(cat.id) ? "bg-purple-500 text-white" : "bg-white/10"
                        )}>
                          {selectedInterests.includes(cat.id) ? <Check className="h-2.5 w-2.5" /> : <Heart className="h-2.5 w-2.5" />}
                        </div>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold text-base hover:shadow-2xl transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'جاري التحميل...' : 'دخول الآن'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-bold"
          >
            {error}
          </motion.div>
        )}

        <p className="mt-8 text-center text-[10px] text-slate-500 leading-relaxed">
          بالبدء، أنت توافق على <span className="text-purple-400 cursor-pointer">شروط الخدمة</span> و <span className="text-purple-400 cursor-pointer">سياسة الخصوصية</span>.
        </p>
      </motion.div>
    </div>
  );
}

