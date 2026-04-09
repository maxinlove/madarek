import React from 'react';
import { Search, TrendingUp, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Explore() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/20">
          <Search className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">استكشف الدورات</h1>
          <p className="text-xs text-slate-400">ابحث عن الدورة المثالية لتبدأ رحلتك التعليمية</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="ابحث عن دورة، محاضر، أو مجال معين..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 text-base text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600"
        />
      </div>

      {/* Trending Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {['برمجة', 'تصميم', 'ذكاء اصطناعي', 'تسويق'].map((cat, i) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group text-center"
          >
            <div className="h-12 w-12 bg-purple-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-base font-bold text-white">{cat}</h3>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for results */}
      <div className="text-center py-16 text-slate-500 italic text-sm">
        ابدأ البحث لتظهر لك النتائج هنا...
      </div>
    </div>
  );
}
