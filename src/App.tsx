import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import { AnimatePresence } from 'framer-motion';

import Onboarding from './components/Onboarding';
import ErrorBoundary from './components/ErrorBoundary';

interface AuthContextType {
  user: User | null;
  userData: any;
  isAdmin: boolean;
  loading: boolean;
  onboarded: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, isAdmin: false, loading: true, onboarded: false });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      setUser(firebaseUser);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const data = userDoc.data();
      setUserData(data);
      setIsAdmin(data?.role === 'admin' || firebaseUser.email === 'hani.almufti@gmail.com');
      setOnboarded(data?.onboarded || false);
    } else {
      // Check for demo mode in localStorage
      const isDemo = localStorage.getItem('madarek_demo_mode') === 'true';
      if (isDemo) {
        setUser({ 
          uid: 'demo-user', 
          displayName: 'زائر تجريبي',
          isAnonymous: true 
        } as any);
        setUserData({
          displayName: 'زائر تجريبي',
          interests: ['برمجة', 'تسويق']
        });
        setIsAdmin(true); // Enable admin for demo user to allow testing
        setOnboarded(true);
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
        setOnboarded(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, checkAuth);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] light-mode:bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, userData, isAdmin, loading, onboarded }}>
        <Router>
          {user && !onboarded && !isAdmin && <Onboarding onComplete={() => setOnboarded(true)} />}
          <AnimatePresence mode="wait">
            <Routes>
              {/* Admin Routes - Separate Layout */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute isAdminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Login Route - No Layout */}
              <Route path="/login" element={<Login />} />

              {/* Main App Routes - Wrapped in Layout */}
              <Route 
                path="*" 
                element={
                  <Layout>
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <ProtectedRoute>
                            <Home />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/course/:id" 
                        element={
                          <ProtectedRoute>
                            <CourseDetails />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/my-courses" 
                        element={
                          <ProtectedRoute>
                            <MyCourses />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/explore" 
                        element={
                          <ProtectedRoute>
                            <Explore />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                } 
              />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

function ProtectedRoute({ children, isAdminOnly = false }: { children: React.ReactNode, isAdminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
