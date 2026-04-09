import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Palette, 
  Megaphone, 
  Database, 
  Smartphone, 
  Cpu,
  ChevronLeft,
  Star,
  Users,
  PlayCircle,
  Sparkles,
  Search,
  PlusCircle,
  TrendingUp,
  LayoutGrid,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../App';

const iconMap: Record<string, any> = {
  Code,
  Palette,
  Megaphone,
  Database,
  Smartphone,
  Cpu,
};

function SuggestedCourseCard({ course, categories }: { course: any, categories: any[] }) {
  return (
    <Link to={`/course/${course.id}`} className="group block glass-card rounded-[1.5rem] overflow-hidden min-w-[240px] w-[240px] shrink-0">
      <div className="relative aspect-video">
        <img 
          src={course.thumbnail || `https://picsum.photos/seed/${course.id}/800/450`} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 glass-dark px-2 py-0.5 rounded-lg text-[9px] font-bold text-purple-400">
          {categories.find(c => c.id === course.categoryId)?.name || course.categoryName || 'دورة'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-400 transition-colors line-clamp-1 leading-tight">
          {course.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-lg bg-purple-600/20 flex items-center justify-center text-[9px] font-bold text-purple-400">
              {course.instructorName?.charAt(0) || 'م'}
            </div>
            <span className="text-[10px] font-medium text-slate-400">{course.instructorName || 'مدرب معتمد'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-slate-300">{course.rating || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-500">الحالة</span>
          <span className="text-[10px] font-bold text-purple-400">{course.isPaid ? 'مدفوع' : 'مجاني'}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const isDemo = user.uid === 'demo-user';

    if (isDemo) {
      // Set dummy categories
      setCategories([
        { id: 'prog', name: 'برمجة', icon: 'Code' },
        { id: 'design', name: 'تصميم', icon: 'Palette' },
        { id: 'ai', name: 'ذكاء اصطناعي', icon: 'Cpu' },
        { id: 'marketing', name: 'تسويق', icon: 'Megaphone' },
      ]);
      
      const dummyCourses = [
        {
          id: 'freesocialbasics',
          title: 'أساسيات التسويق عبر وسائل التواصل الاجتماعي',
          description: 'تعلم الأساسيات الضرورية للبدء في عالم التسويق الرقمي عبر منصات التواصل الاجتماعي.',
          thumbnail: 'https://picsum.photos/seed/social/800/450',
          rating: 4.5,
          ratingCount: 15420,
          joinCount: 85000,
          instructorName: 'فريق Udemy',
          categoryId: 'marketing',
          categoryName: 'تسويق',
          isPaid: false,
          createdAt: new Date()
        },
        {
          id: 'dummy-1',
          title: 'أساسيات تصميم الواجهات الحديثة (UI/UX)',
          description: 'تعلم كيف تصمم واجهات مستخدم مذهلة باستخدام فيجما من الصفر.',
          thumbnail: 'https://picsum.photos/seed/ui/800/450',
          rating: 4.9,
          ratingCount: 120,
          joinCount: 1500,
          instructorName: 'أحمد علي',
          categoryId: 'design',
          categoryName: 'تصميم',
          isPaid: false,
          createdAt: new Date()
        }
      ];
      setCourses(dummyCourses);
      setSuggestedCourses(dummyCourses);
      setUserData({ displayName: 'زائر تجريبي', interests: ['prog', 'design'] });
      setLoading(false);
      return;
    }

    const qCat = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Categories listener error:", error);
    });

    const qCourse = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(12));
    const unsubscribeCourse = onSnapshot(qCourse, (snapshot) => {
      const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(allCourses);
      
      // If no courses exist, add dummy ones for demo
      if (allCourses.length === 0) {
        const dummyCourses = [
          {
            id: 'freesocialbasics',
            title: 'أساسيات التسويق عبر وسائل التواصل الاجتماعي',
            description: 'تعلم الأساسيات الضرورية للبدء في عالم التسويق الرقمي عبر منصات التواصل الاجتماعي.',
            thumbnail: 'https://picsum.photos/seed/social/800/450',
            rating: 4.5,
            ratingCount: 15420,
            joinCount: 85000,
            instructorName: 'فريق Udemy',
            categoryId: 'marketing',
            categoryName: 'تسويق',
            isPaid: false,
            createdAt: new Date()
          },
          {
            id: 'dummy-1',
            title: 'أساسيات تصميم الواجهات الحديثة (UI/UX)',
            description: 'تعلم كيف تصمم واجهات مستخدم مذهلة باستخدام فيجما من الصفر.',
            thumbnail: 'https://picsum.photos/seed/ui/800/450',
            rating: 4.9,
            ratingCount: 120,
            joinCount: 1500,
            instructorName: 'أحمد علي',
            categoryId: 'design',
            categoryName: 'تصميم',
            isPaid: false,
            createdAt: new Date()
          },
          {
            id: 'dummy-2',
            title: 'دورة تطوير تطبيقات الويب باستخدام React',
            description: 'احترف بناء تطبيقات الويب الحديثة والمتجاوبة باستخدام مكتبة ريآكت.',
            thumbnail: 'https://picsum.photos/seed/react/800/450',
            rating: 4.8,
            ratingCount: 85,
            joinCount: 950,
            instructorName: 'سارة محمد',
            categoryId: 'prog',
            categoryName: 'برمجة',
            isPaid: true,
            createdAt: new Date()
          }
        ];
        setCourses(dummyCourses);
        setSuggestedCourses(dummyCourses);
      }
      setLoading(false);
    }, (error) => {
      console.error("Courses listener error:", error);
      setLoading(false);
    });

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Fetch user data error:", error);
      }
    };
    fetchUserData();

    return () => {
      unsubscribeCat();
      unsubscribeCourse();
    };
  }, [user]);

  useEffect(() => {
    if (userData?.interests && courses.length > 0) {
      const suggested = courses.filter(course => 
        userData.interests.includes(course.categoryId)
      ).slice(0, 6);
      
      if (suggested.length > 0) {
        setSuggestedCourses(suggested);
      }
    }
  }, [userData, courses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-purple-500/20 rounded-full"></div>
          <div className="h-4 w-32 bg-purple-500/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <section className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            مرحباً بك يا <span className="text-gradient">{userData?.displayName || 'مبدع'}</span> 👋
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            جاهز لتطوير مهاراتك اليوم؟ اكتشف أفضل الدورات التعليمية المختارة بعناية لك.
          </p>
        </motion.div>
      </section>

      {/* Suggested Courses Slider (Horizontal) */}
      {suggestedCourses.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-purple-600/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">كورسات مقترحة لك</h2>
              <p className="text-xs text-slate-500">بناءً على اهتماماتك</p>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
            {suggestedCourses.map((course) => (
              <div key={course.id} className="snap-start">
                <SuggestedCourseCard course={course} categories={categories} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
        <Link to="/courses" className="glass p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
          <div className="h-10 w-10 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Search className="h-5 w-5 text-purple-400" />
          </div>
          <span className="text-sm font-bold text-white">تصفح الدورات</span>
        </Link>
        
        <button className="glass p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
          <div className="h-10 w-10 bg-emerald-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlusCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-white">أحدث الدورات</span>
        </button>

        <button className="glass p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
          <div className="h-10 w-10 bg-amber-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5 text-amber-400" />
          </div>
          <span className="text-sm font-bold text-white">الأكثر طلباً</span>
        </button>

        <button className="glass p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
          <div className="h-10 w-10 bg-violet-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutGrid className="h-5 w-5 text-violet-400" />
          </div>
          <span className="text-sm font-bold text-white">كل التصنيفات</span>
        </button>

        {isAdmin && (
          <Link to="/admin" className="glass p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-purple-600/20 transition-all group border-purple-500/30">
            <div className="h-10 w-10 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutDashboard className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm font-bold text-purple-400">لوحة التحكم</span>
          </Link>
        )}
      </div>

      {/* Categories Section */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">الأقسام التعليمية</h2>
          <p className="text-xs text-slate-500 mt-1">تصفح المجالات المتاحة</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, index) => {
            const Icon = iconMap[cat.icon] || Code;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="glass-card p-4 rounded-2xl text-center">
                  <div className="inline-flex p-3 bg-white/5 rounded-xl text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{cat.name}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Latest Courses Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">أحدث الدورات المضافة</h2>
            <p className="text-xs text-slate-500 mt-1">استكشف الجديد في عالم المعرفة</p>
          </div>
          <Link to="/courses" className="text-sm text-purple-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            عرض الكل <ChevronLeft className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} categories={categories} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course, index, categories }: { course: any, index: number, categories: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/course/${course.id}`} className="group block glass-card p-4 rounded-2xl hover:bg-white/5 transition-all border border-white/5 hover:border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded-lg">
            {categories.find(c => c.id === course.categoryId)?.name || course.categoryName || 'دورة'}
          </span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">{course.joinCount || 0}</span>
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-1 leading-tight">
          {course.title}
        </h3>
        
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400">
              {course.instructorName?.charAt(0) || 'م'}
            </div>
            <span className="text-[10px] font-medium text-slate-400">{course.instructorName || 'مدرب'}</span>
          </div>
          <span className="text-purple-400 font-bold text-[10px]">{course.isPaid ? 'مدفوع' : 'مجاناً'}</span>
        </div>
      </Link>
    </motion.div>
  );
}


