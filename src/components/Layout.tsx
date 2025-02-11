import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Users, Settings, UserCircle, ClipboardList, Building2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { user, role, setUser } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<{ name: string; app_name: string } | null>(null);
  const isSuperadmin = role === 'superadmin';

  const navigation = [
    { name: t('common.dashboard'), href: '/', icon: LayoutDashboard },
    ...(isSuperadmin ? [] : [
      { name: t('goals.pageTitle'), href: '/goals', icon: Target },
    ]),
    ...(role === 'company_admin' || role === 'superadmin' ? [{ name: t('admin.title'), href: '/admin', icon: Users }] : []),
    ...(role === 'manager' ? [{ name: t('admin.evaluation.subordinates'), href: '/evaluation', icon: ClipboardList }] : []),
  ];

  useEffect(() => {
    async function fetchOrgName() {
      if (user?.organization_id) {
        const { data, error } = await supabase
          .from('organizations')
          .select('name, app_name')
          .eq('id', user.organization_id)
          .single();
        
        if (data && !error) {
          setOrg(data);
        }
      }
    }
    
    fetchOrgName();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">{org?.app_name || 'HR Performance'}</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  {org?.name && (
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{org.name}</span>
                    </div>
                  )}
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                  <NavLink
                    to="/profile"
                    className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <UserCircle className="h-5 w-5 mr-1" />
                    {user.full_name || user.email}
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {t('common.logout')}
                  </button>
                </>
              )}
              {!user && (
                <NavLink
                  to="/login"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {t('common.login')}
                </NavLink>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 transition-colors duration-200">
        {children}
      </main>
    </div>
  );
}