import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import YouTube from 'react-youtube';
import { 
  Star,
  Users, 
  Clock, 
  Award, 
  ChevronRight,
  Check,
  PlayCircle,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const isDemo = user.uid === 'demo-user';

    const fetchCourse = async () => {
      try {
        if (isDemo || id === 'freesocialbasics') {
          // Sample course data from Udemy URL
          setCourse({
            id: 'freesocialbasics',
            title: 'أساسيات التسويق عبر وسائل التواصل الاجتماعي: دليلك الشامل',
            description: `في هذه الدورة، ستتعلم الأساسيات الضرورية للبدء في عالم التسويق الرقمي عبر منصات التواصل الاجتماعي. 
            
سوف نغطي:
- كيفية اختيار المنصة المناسبة لعملك.
- استراتيجيات بناء المحتوى الجذاب.
- فهم الخوارزميات وكيفية استغلالها.
- قياس النتائج وتحليل الأداء.

هذه الدورة مصممة للمبتدئين الذين يرغبون في بناء حضور قوي وفعال على الإنترنت.`,
            videoUrl: 'https://www.youtube.com/watch?v=2v8v-XGq-S8', // Sample intro video
            instructorName: 'فريق Udemy التعليمي',
            instructorBio: 'خبراء في التسويق الرقمي مع سنوات من الخبرة في تدريب آلاف الطلاب حول العالم.',
            rating: 4.5,
            ratingCount: 15420,
            joinCount: 85000,
            isPaid: false,
            tags: ['تسويق', 'سوشيال ميديا', 'بيزنس', 'مبتدئين'],
            learningPoints: [
              'فهم أساسيات التسويق عبر السوشيال ميديا',
              'بناء استراتيجية محتوى ناجحة',
              'التعامل مع خوارزميات فيسبوك وإنستغرام',
              'تحليل البيانات وقياس العائد على الاستثمار'
            ],
            requirements: [
              'لا توجد متطلبات مسبقة',
              'رغبة في التعلم والتطور',
              'جهاز كمبيوتر أو هاتف ذكي'
            ],
            curriculum: [
              { title: 'مقدمة في التسويق الرقمي', duration: '15:00' },
              { title: 'اختيار المنصة المناسبة', duration: '22:30' },
              { title: 'صناعة المحتوى الجذاب', duration: '45:00' },
              { title: 'تحليل النتائج والتقارير', duration: '30:00' }
            ]
          });
          setLoading(false);
          return;
        }

        const docRef = doc(db, 'courses', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Fetch course error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  const handleJoinCourse = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowAd(true);
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowAd(false);
          // Logic for joining course
          if (user.uid !== 'demo-user') {
            updateDoc(doc(db, 'courses', id!), {
              joinCount: increment(1)
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleShare = async () => {
    const shareData = {
      title: course.title,
      text: course.description.substring(0, 100) + '...',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-white">الدورة غير موجودة</div>;

  const videoId = course.videoUrl.split('v=')[1]?.split('&')[0] || course.videoUrl.split('/').pop();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-purple-400 transition-colors">الرئيسية</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-white font-medium">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl mb-10 border border-white/10">
            <YouTube 
              videoId={videoId} 
              className="w-full h-full"
              opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
            />
          </div>

          {/* Course Info */}
          <div className="glass rounded-[2rem] p-6 sm:p-8 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{course.title}</h1>
            
            <div className="flex flex-wrap gap-6 mb-8 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-bold text-slate-200">{course.joinCount || 0} طالب ملتحق</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-200">{course.rating || 0} تقييم ({course.ratingCount || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span className="font-bold text-slate-200">محتوى دائم</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <h2 className="text-xl font-bold mb-4 text-white">عن الدورة</h2>
              <div className="text-slate-400 leading-relaxed text-base whitespace-pre-wrap mb-8">
                {course.description}
              </div>

              {course.learningPoints && (
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                  <h3 className="text-lg font-bold mb-4 text-white">ماذا ستتعلم في هذه الدورة؟</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningPoints.map((point: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.curriculum && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-white">محتوى الدورة</h3>
                  <div className="space-y-2">
                    {course.curriculum.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="h-4 w-4 text-purple-500" />
                          <span className="text-slate-200 font-medium text-sm">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{item.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.requirements && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-white">المتطلبات</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                    {course.requirements.map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3">
              {(course.tags || ['تعليم', 'تطوير', 'مهارات']).map((tag: string) => (
                <span key={tag} className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Native Ad Placeholder */}
          <div className="glass rounded-[2rem] p-6 mb-8 border border-dashed border-white/20 flex items-center justify-center min-h-[150px] bg-black/20">
            <span className="text-slate-500 text-sm font-bold">مساحة إعلانية (Native Ad)</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-8">
            {/* Action Card */}
            <div className="glass rounded-[2rem] p-6 shadow-2xl shadow-purple-900/20 border-white/20">
              <div className="text-3xl font-bold text-white mb-6">{course.isPaid ? 'مدفوع' : 'مجاناً'}</div>
              <button
                onClick={handleJoinCourse}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-600/40 transition-all mb-4"
              >
                ابدأ الكورس
              </button>
              
              <button
                onClick={handleShare}
                className={cn(
                  "w-full py-3 border rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-4",
                  isShared 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                    : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                )}
              >
                <Share2 className="h-4 w-4" />
                {isShared ? 'تم نسخ الرابط!' : 'مشاركة الكورس'}
              </button>

              <p className="text-center text-xs text-slate-500">
                ضمان الوصول مدى الحياة للمحتوى
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">المستوى</span>
                  <span className="font-bold text-white">مبتدئ - متوسط</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">اللغة</span>
                  <span className="font-bold text-white">العربية</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">الشهادة</span>
                  <span className="font-bold text-white">نعم</span>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="glass rounded-[2rem] p-6">
              <h3 className="font-bold text-white text-lg mb-4">عن المحاضر</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-600/20">
                  {course.instructorName?.charAt(0) || 'م'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{course.instructorName || 'مدرب معتمد'}</h4>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">خبير في المجال التعليمي</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                {course.instructorBio || 'محاضر ذو خبرة واسعة في تقديم المحتوى التعليمي التقني والمهني.'}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Ad Interstitial Modal */}
      <AnimatePresence>
        {showAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
            >
              <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">جاري تحضير دورتك...</h2>
              <p className="text-slate-500 mb-8">سيتم توجيهك إلى محتوى الدورة خلال ثوانٍ قليلة</p>
              
              <div className="relative h-24 w-24 mx-auto mb-8">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-slate-100 stroke-current" 
                    strokeWidth="8" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                  <circle 
                    className="text-purple-600 stroke-current transition-all duration-1000" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                    style={{ 
                      strokeDasharray: 251.2, 
                      strokeDashoffset: 251.2 - (251.2 * (5 - countdown)) / 5 
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-purple-600">
                  {countdown}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-400">
                إعلان: استمتع بتجربة تعليمية فريدة مع مدارك بلس
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
