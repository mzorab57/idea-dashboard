
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import ProtectedRoute from './components/shared/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuthStore } from './store/authStore';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const BooksList = lazy(() => import('./pages/BooksList'));
const BooksCreate = lazy(() => import('./pages/BooksCreate'));
const BooksEdit = lazy(() => import('./pages/BooksEdit'));
const AuthorsList = lazy(() => import('./pages/AuthorsList'));
const AuthorsCreate = lazy(() => import('./pages/AuthorsCreate'));
const AuthorsEdit = lazy(() => import('./pages/AuthorsEdit'));
const CategoriesList = lazy(() => import('./pages/CategoriesList'));
const CategoriesCreate = lazy(() => import('./pages/CategoriesCreate'));
const CategoriesEdit = lazy(() => import('./pages/CategoriesEdit'));
const SubcategoriesList = lazy(() => import('./pages/SubcategoriesList'));
const SubcategoriesCreate = lazy(() => import('./pages/SubcategoriesCreate'));
const SubcategoriesEdit = lazy(() => import('./pages/SubcategoriesEdit'));
const UsersList = lazy(() => import('./pages/UsersList'));
const UsersCreate = lazy(() => import('./pages/UsersCreate'));
const UsersEdit = lazy(() => import('./pages/UsersEdit'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RootIndex() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <QueryClientProvider  client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="h-[100vh] flex items-center justify-center">Loading…</div>}>
          <Routes>
          <Route path="/" element={<RootIndex />} />
          <Route  path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardOverview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/books"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BooksList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/books/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BooksCreate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/books/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BooksEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/authors"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AuthorsList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/authors/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AuthorsCreate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/authors/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AuthorsEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/categories"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CategoriesList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/categories/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CategoriesCreate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/categories/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CategoriesEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/subcategories"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SubcategoriesList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/subcategories/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SubcategoriesCreate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/subcategories/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SubcategoriesEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <UsersList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users/new"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <UsersCreate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users/:id/edit"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <UsersEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<RootIndex />} />
          </Routes>
        </Suspense>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
