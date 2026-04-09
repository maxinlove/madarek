import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { BookOpen, PlayCircle, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (user.uid === 'demo-user') {
      // Sample data for demo mode
      setCourses([
        {
          id: 'freesocialbasics',
          title: 'أساسيات التسويق عبر وسائل التواصل الاجتماعي',
          thumbnail: 'https://picsum.photos/seed/social/800/450',
          progress: 45,
          instructorName: 'فريق Udemy التعليمي',
          rating: 4.5
        }
      ]);
      setLoading(false);
      return;
    }

    // In a real app, we'd have a 'userCourses' collection or similar
    // For now, let's assume we fetch courses the user has joined
    // This is a simplified version
    const q = query(collection(db, 'courses'), where('joinedUsers', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/20">
          <BookOpen className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">دوراتي التعليمية</h1>
          <p className="text-xs text-slate-400">تابع تقدمك في الدورات التي التحقت بها</p>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[2rem] overflow-hidden border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <Link to={`/course/${course.id}`}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.thumbnail || `https://picsum.photos/seed/${course.id}/800/450`} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-3 right-3 bg-purple-600 text-white p-2 rounded-xl shadow-xl">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-purple-400">
                      {course.instructorName?.charAt(0) || 'م'}
                    </div>
                    <span>{course.instructorName || 'مدرب معتمد'}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500">التقدم</span>
                      <span className="text-purple-400">{course.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress || 0}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-800"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-[2rem] border-dashed border-white/10">
          <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">لم تلتحق بأي دورة بعد</h2>
          <p className="text-xs text-slate-500 mb-8 max-w-xs mx-auto">
            ابدأ رحلتك التعليمية اليوم واستكشف آلاف الدورات المجانية والمدفوعة في مختلف المجالات.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 text-sm"
          >
            استكشف الدورات
          </Link>
        </div>
      )}
    </div>
  );
}
