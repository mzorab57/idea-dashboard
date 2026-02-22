
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import ProtectedRoute from './components/shared/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import BooksList from './pages/BooksList';
import BooksCreate from './pages/BooksCreate';
import BooksEdit from './pages/BooksEdit';
import AuthorsList from './pages/AuthorsList';
import AuthorsCreate from './pages/AuthorsCreate';
import AuthorsEdit from './pages/AuthorsEdit';
import CategoriesList from './pages/CategoriesList';
import CategoriesCreate from './pages/CategoriesCreate';
import CategoriesEdit from './pages/CategoriesEdit';
import SubcategoriesList from './pages/SubcategoriesList';
import SubcategoriesCreate from './pages/SubcategoriesCreate';
import SubcategoriesEdit from './pages/SubcategoriesEdit';
import UsersList from './pages/UsersList';
import UsersCreate from './pages/UsersCreate';
import UsersEdit from './pages/UsersEdit';
import SettingsPage from './pages/SettingsPage';
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
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersCreate />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users/:id/edit"
            element={
              <ProtectedRoute>
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
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
