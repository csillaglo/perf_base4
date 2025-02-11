import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { SuperAdmin } from './pages/SuperAdmin';
import { Evaluation } from './pages/Evaluation';
import { EvaluationDetail } from './pages/EvaluationDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { useThemeStore } from './stores/themeStore';

export default function App() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <Router>
        <div className={`${theme} transition-colors duration-200`}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <PrivateRoute excludeRoles={['superadmin']}>
                    <Layout>
                      <Goals title={t('goals.pageTitle')} />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRoles={['company_admin', 'superadmin']}>
                    <Layout>
                      <Admin />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/superadmin"
                element={
                  <PrivateRoute requiredRoles={['superadmin']}>
                    <Layout>
                      <SuperAdmin />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/evaluation"
                element={
                  <PrivateRoute requiredRoles={['manager']}>
                    <Layout>
                      <Evaluation />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/evaluation/:userId"
                element={
                  <PrivateRoute requiredRoles={['manager']}>
                    <Layout>
                      <EvaluationDetail />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}