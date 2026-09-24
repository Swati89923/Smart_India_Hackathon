import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, Package, PlusCircle, MessageSquareText, UserRound, Users, BarChart3, Settings, Boxes } from "lucide-react";
import { DashboardShell, BuyerShell, RequireRole } from "./components/Layouts";
import { Toaster } from "./components/ui";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/artisan/Onboarding";
import ArtisanDashboard from "./pages/artisan/Dashboard";
import AddProduct from "./pages/artisan/AddProduct";
import MyProducts from "./pages/artisan/MyProducts";
import ArtisanEnquiries from "./pages/artisan/Enquiries";
import { ArtisanProfilePage, PublicStorefrontPage } from "./pages/Storefront";
import { MarketHome, ProductList, ArtisanDirectory } from "./pages/buyer/Marketplace";
import { ProductDetail, BulkEnquiry } from "./pages/buyer/ProductDetail";
import { BuyerDashboard, BuyerChats } from "./pages/buyer/BuyerHome";
import { AdminOverview, AdminArtisans, AdminProducts, AdminAnalytics, AdminSettings } from "./pages/admin/Admin";

const ARTISAN_NAV = [
  { to: "/artisan", end: true, icon: LayoutDashboard, label: "Dashboard", hi: "डैशबोर्ड" },
  { to: "/artisan/products", icon: Package, label: "My Products", hi: "उत्पाद" },
  { to: "/artisan/add", icon: PlusCircle, label: "Add Product", hi: "जोड़ें", primary: true },
  { to: "/artisan/enquiries", icon: MessageSquareText, label: "Enquiries", hi: "पूछताछ" },
  { to: "/artisan/profile", icon: UserRound, label: "Profile", hi: "प्रोफ़ाइल" },
];

const ADMIN_NAV = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/artisans", icon: Users, label: "Artisans" },
  { to: "/admin/products", icon: Boxes, label: "Products" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/artisan/onboarding" element={<RequireRole role="artisan"><Onboarding /></RequireRole>} />
        <Route path="/artisan" element={<RequireRole role="artisan"><DashboardShell role="artisan" nav={ARTISAN_NAV} tone="green" /></RequireRole>}>
          <Route index element={<ArtisanDashboard />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="products" element={<MyProducts />} />
          <Route path="enquiries" element={<ArtisanEnquiries />} />
          <Route path="enquiries/:id" element={<ArtisanEnquiries />} />
          <Route path="profile" element={<ArtisanProfilePage />} />
        </Route>

        <Route element={<BuyerShell />}>
          <Route path="/market" element={<MarketHome />} />
          <Route path="/market/products" element={<ProductList />} />
          <Route path="/market/artisans" element={<ArtisanDirectory />} />
          <Route path="/market/artisan/:id" element={<PublicStorefrontPage />} />
          <Route path="/market/product/:id" element={<ProductDetail />} />
          <Route path="/market/product/:id/bulk" element={<RequireRole role="buyer"><BulkEnquiry /></RequireRole>} />
          <Route path="/buyer" element={<RequireRole role="buyer"><BuyerDashboard /></RequireRole>} />
          <Route path="/buyer/chats" element={<RequireRole role="buyer"><BuyerChats /></RequireRole>} />
          <Route path="/buyer/chats/:id" element={<RequireRole role="buyer"><BuyerChats /></RequireRole>} />
        </Route>

        <Route path="/admin" element={<RequireRole role="admin"><DashboardShell role="admin" nav={ADMIN_NAV} tone="navy" /></RequireRole>}>
          <Route index element={<AdminOverview />} />
          <Route path="artisans" element={<AdminArtisans />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
