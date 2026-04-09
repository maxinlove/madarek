import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Check, ChevronLeft, Sparkles, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.displayName || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    { id: 'prog', name: 'برمجة', icon: 'Code' },
    { id: 'design', name: 'تصميم', icon: 'Palette' },
    { id: 'marketing', name: 'تسويق', icon: 'Megaphone' },
    { id: 'data', name: 'بيانات', icon: 'Database' },
    { id: 'mobile', name: 'تطبيقات', icon: 'Smartphone' },
    { id: 'ai', name: 'ذكاء اصطناعي', icon: 'Cpu' },
    { id: 'business', name: 'إدارة أعمال', icon: 'Briefcase' },
    { id: 'language', name: 'لغات', icon: 'Languages' },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name,
        interests: selectedInterests,
        onboarded: true
      });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass p-8 sm:p-12 rounded-[2.5rem] relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="h-20 w-20 bg-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-purple-500/30">
                <UserIcon className="h-10 w-10 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">أهلاً بك في مدارك بلس</h1>
              <p className="text-slate-400 mb-8">كيف ناديك؟ يرجى إدخال اسمك لنتمكن من تخصيص تجربتك.</p>
              
              <div className="relative mb-8">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-center text-xl"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                المتابعة
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/30">
                  <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">ما هي اهتماماتك؟</h2>
                <p className="text-slate-400">سنقترح عليك دورات بناءً على اختياراتك</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {interestOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleInterest(cat.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all text-right flex items-center justify-between group",
                      selectedInterests.includes(cat.id)
                        ? "bg-purple-600/20 border-purple-500/50 text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <span className="font-medium">{cat.name}</span>
                    {selectedInterests.includes(cat.id) && (
                      <div className="bg-purple-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white/5 text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="h-6 w-6 rotate-180" />
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading || selectedInterests.length === 0}
                  className="flex-grow py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'ابدأ رحلتك التعليمية'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
