import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Image as ImageIcon,
  Youtube
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { auth } from '../lib/firebase';
import { useAuth } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isDemo = user?.uid === 'demo-user';

  const sidebarItems = [
    { name: 'نظرة عامة', path: '/admin', icon: LayoutDashboard },
    { name: 'إدارة الدورات', path: '/admin/courses', icon: BookOpen },
    { name: 'إدارة الأقسام', path: '/admin/categories', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-arabic" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-purple-600 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">لوحة الإدارة</h2>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  location.pathname === item.path 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors w-full"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
            العودة للتطبيق
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600">
              <LayoutDashboard className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 hidden sm:block">
              {sidebarItems.find(i => i.path === location.pathname)?.name || 'لوحة التحكم'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="sm:hidden p-2 text-slate-600"
              title="العودة للتطبيق"
            >
              <ChevronLeft className="h-6 w-6 rotate-180" />
            </button>
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow p-4 lg:p-8 overflow-x-hidden">
          {isDemo && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">وضع التجربة (Demo Mode)</p>
                <p className="opacity-80">أنت تتصفح لوحة التحكم كزائر. لن تتمكن من حفظ أي تغييرات في قاعدة البيانات الحقيقية. لتفعيل الإدارة الكاملة، يرجى تسجيل الدخول بحساب المسؤول.</p>
              </div>
            </div>
          )}
          {/* Mobile Navigation Tabs */}
          <div className="lg:hidden mb-6 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                    location.pathname === item.path 
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" 
                      : "bg-white text-slate-600 border border-slate-200"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState({ courses: 0, categories: 0, users: 0 });

  useEffect(() => {
    const unsubCourses = onSnapshot(collection(db, 'courses'), (s) => setStats(prev => ({ ...prev, courses: s.size })));
    const unsubCategories = onSnapshot(collection(db, 'categories'), (s) => setStats(prev => ({ ...prev, categories: s.size })));
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setStats(prev => ({ ...prev, users: s.size })));
    return () => { unsubCourses(); unsubCategories(); unsubUsers(); };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">نظرة عامة</h1>
        <Link 
          to="/admin/courses"
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20 text-sm"
        >
          <Plus className="h-4 w-4" />
          إضافة دورة
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي الدورات', value: stats.courses, icon: BookOpen, color: 'purple' },
          { label: 'إجمالي الأقسام', value: stats.categories, icon: Layers, color: 'indigo' },
          { label: 'إجمالي الطلاب', value: stats.users, icon: CheckCircle2, color: 'green' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-xl inline-flex mb-4`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{item.value}</div>
            <div className="text-sm text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'courses'), orderBy('createdAt', 'desc')), (s) => {
      setCourses(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCat = onSnapshot(collection(db, 'categories'), (s) => {
      setCategories(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsub(); unsubCat(); };
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">إدارة الدورات</h1>
        <div className="flex gap-4">
          {categories.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-sm border border-amber-100">
              <AlertCircle className="h-4 w-4" />
              <span>يجب إضافة أقسام أولاً</span>
            </div>
          )}
          <button 
            onClick={() => { setEditingCourse(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="h-5 w-5" />
            إضافة دورة جديدة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">الدورة</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">القسم</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">الطلاب</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">التقييم</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={course.thumbnail || 'https://via.placeholder.com/150'} 
                      alt="" 
                      className="h-10 w-16 object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-slate-900 line-clamp-1">{course.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {categories.find(c => c.id === course.categoryId)?.name || 'غير مصنف'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{course.joinCount || 0}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{course.rating || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingCourse(course); setShowForm(true); }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <CourseForm 
            onClose={() => setShowForm(false)} 
            categories={categories} 
            editingCourse={editingCourse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CourseForm({ onClose, categories, editingCourse }: { onClose: () => void, categories: any[], editingCourse?: any }) {
  const [url, setUrl] = useState(editingCourse?.videoUrl || '');
  const [title, setTitle] = useState(editingCourse?.title || '');
  const [description, setDescription] = useState(editingCourse?.description || '');
  const [thumbnail, setThumbnail] = useState(editingCourse?.thumbnail || '');
  const [categoryId, setCategoryId] = useState(editingCourse?.categoryId || '');
  const [instructorName, setInstructorName] = useState(editingCourse?.instructorName || '');
  const [instructorBio, setInstructorBio] = useState(editingCourse?.instructorBio || '');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);

  const fetchMetadata = async () => {
    if (!url) return;
    setScraping(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract course metadata from this URL: ${url}. Return a JSON object with: title (Arabic), description (Arabic), thumbnail (URL), instructorName (Arabic). It is CRITICAL that you extract the actual thumbnail image URL (like og:image or twitter:image) from the provided URL. Do not use placeholders for the thumbnail.`,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              thumbnail: { type: Type.STRING },
              instructorName: { type: Type.STRING }
            },
            required: ["title", "description", "thumbnail", "instructorName"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setTitle(data.title);
      setDescription(data.description);
      setThumbnail(data.thumbnail);
      setInstructorName(data.instructorName);
    } catch (err) {
      console.error(err);
      alert('فشل جلب البيانات تلقائياً. يرجى إدخالها يدوياً.');
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const courseData = {
        title,
        description,
        thumbnail,
        videoUrl: url,
        categoryId,
        instructorName,
        instructorBio,
        updatedAt: serverTimestamp(),
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
      } else {
        await addDoc(collection(db, 'courses'), {
          ...courseData,
          rating: 0,
          ratingCount: 0,
          joinCount: 0,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err: any) {
      handleFirestoreError(err, editingCourse ? OperationType.UPDATE : OperationType.CREATE, editingCourse ? `courses/${editingCourse.id}` : 'courses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 rotate-180" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">رابط الدورة (YouTube, Udemy, etc.)</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <button 
                type="button"
                onClick={fetchMetadata}
                disabled={scraping}
                className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {scraping ? <div className="h-4 w-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div> : <Sparkles className="h-4 w-4" />}
                جلب تلقائي
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">عنوان الدورة</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">القسم</label>
              {categories.length > 0 ? (
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                >
                  <option value="">اختر قسماً</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="h-4 w-4" />
                    لا يوجد أقسام مضافة حالياً
                  </div>
                  <p className="text-xs opacity-80">يرجى الذهاب إلى صفحة "إدارة الأقسام" وإضافة قسم واحد على الأقل لتتمكن من إضافة دورة.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">رابط الصورة المصغرة</label>
            <div className="flex gap-4 items-center">
              <input 
                type="url" 
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {thumbnail && <img src={thumbnail} alt="Preview" className="h-12 w-20 object-cover rounded-lg border border-slate-100" referrerPolicy="no-referrer" />}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">وصف الدورة</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
              rows={4}
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم المحاضر</label>
              <input 
                type="text" 
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">نبذة عن المحاضر</label>
              <input 
                type="text" 
                value={instructorBio}
                onChange={(e) => setInstructorBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-grow bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الدورة'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Code');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'categories'), orderBy('createdAt', 'desc')), (s) => {
      setCategories(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'categories'), {
        name,
        icon,
        createdAt: serverTimestamp(),
      });
      setName('');
      setShowForm(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      }
    }
  };

  const handleInitialize = async () => {
    const defaults = [
      { name: 'برمجة', icon: 'Code' },
      { name: 'تصميم', icon: 'Palette' },
      { name: 'تسويق', icon: 'Megaphone' },
      { name: 'بيانات', icon: 'Database' },
      { name: 'تطبيقات', icon: 'Smartphone' },
      { name: 'ذكاء اصطناعي', icon: 'Cpu' },
    ];

    try {
      for (const cat of defaults) {
        await addDoc(collection(db, 'categories'), {
          ...cat,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">إدارة الأقسام</h1>
        <div className="flex gap-4">
          {categories.length === 0 && (
            <button 
              onClick={handleInitialize}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              تهيئة أقسام افتراضية
            </button>
          )}
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="h-5 w-5" />
            إضافة قسم جديد
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">لا يوجد أقسام بعد</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">ابدأ بإضافة أقسام لتتمكن من تصنيف الدورات التدريبية وتسهيل وصول الطلاب إليها.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20"
          >
            <Plus className="h-5 w-5" />
            أضف أول قسم الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-500">{cat.icon}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">إضافة قسم جديد</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم القسم</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الأيقونة (Lucide Icon Name)</label>
                  <select 
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Code">Code</option>
                    <option value="Palette">Palette</option>
                    <option value="Megaphone">Megaphone</option>
                    <option value="Database">Database</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Cpu">Cpu</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-grow bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">حفظ القسم</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
