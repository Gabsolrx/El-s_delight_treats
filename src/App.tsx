import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchOverlay } from './components/SearchOverlay';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ToastProvider } from './components/ToastProvider';
import { ScrollToTop } from './components/ScrollToTop';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { BestSellersPage } from './pages/BestSellersPage';
import { CakesPage } from './pages/CakesPage';
import { TreatsPage } from './pages/TreatsPage';
import { OccasionsPage } from './pages/OccasionsPage';
import { CustomCakesPage } from './pages/CustomCakesPage';
import { CorporatePage } from './pages/CorporatePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0F0F12] text-stone-900 dark:text-stone-100 transition-colors duration-200">
          {/* Top Announcement Bar */}
          <AnnouncementBar />

          {/* Sticky Navigation Bar */}
          <Navbar />

          {/* Main Routing Content */}
          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/best-sellers" element={<BestSellersPage />} />
              <Route path="/cakes" element={<CakesPage />} />
              <Route path="/treats" element={<TreatsPage />} />
              <Route path="/occasions" element={<OccasionsPage />} />
              <Route path="/custom-cakes" element={<CustomCakesPage />} />
              <Route path="/corporate" element={<CorporatePage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/admin" element={<AdminPage />} />
              {/* Catch-all fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Global Interactive Overlays */}
          <CartDrawer />
          <QuickViewModal />
          <SearchOverlay />
          <FloatingWhatsApp />
          <ToastProvider />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
