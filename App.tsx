
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import SuccessPage from './components/SuccessPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/admin" />;
};


const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HashRouter>
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </HashRouter>
      </main>
      <Footer />
    </div>
  );
};

export default App;