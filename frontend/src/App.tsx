import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CompareTray } from './components/CompareTray';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ComparePage } from './pages/ComparePage';
import { BudgetFinderPage } from './pages/BudgetFinderPage';
import { DealsPage } from './pages/DealsPage';
import { WishlistPage } from './pages/WishlistPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CompareProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/budget-finder" element={<BudgetFinderPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/preferences" element={<PreferencesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/methodology" element={<MethodologyPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <CompareTray />
            <Footer />
          </div>
        </Router>
      </CompareProvider>
    </AuthProvider>
  );
};

export default App;
