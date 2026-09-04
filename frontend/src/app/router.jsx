import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/shell/AppShell";
import { LabLayout } from "../motion/lab/LabLayout";
import { HeroesLab } from "../motion/lab/HeroesLab";
import { CardsLab } from "../motion/lab/CardsLab";
import { DrawersLab } from "../motion/lab/DrawersLab";
import { FlipLab } from "../motion/lab/FlipLab";
import { LabHome } from "../pages/LabHome";
import { HomePage } from "../pages/HomePage";
import { CatalogPage } from "../pages/CatalogPage";
import { ProductPage } from "../pages/ProductPage";
import { ContactPage } from "../pages/ContactPage";
import { FaqsPage } from "../pages/FaqsPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrderPage } from "../pages/OrderPage";
import { AccountPage } from "../pages/AccountPage";
import { SearchPage } from "../pages/SearchPage";
import { LegalPage } from "../pages/LegalPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RouteErrorPage } from "../pages/RouteErrorPage";
import { StudioLayout } from "../studio/StudioLayout";
import { StudioLogin } from "../studio/StudioLogin";
import { StudioDashboard } from "../studio/StudioDashboard";
import { StudioCarousels } from "../studio/StudioCarousels";
import { StudioProducts } from "../studio/StudioProducts";
import { StudioProductEdit } from "../studio/StudioProductEdit";
import { StudioOrders } from "../studio/StudioOrders";
import { StudioOrderDetail } from "../studio/StudioOrderDetail";
import { StudioSettings } from "../studio/StudioSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "catalog", element: <CatalogPage /> },
          { path: "catalog/men", element: <Navigate to="/catalog" replace /> },
          { path: "catalog/women", element: <Navigate to="/catalog" replace /> },
          { path: "product/:slug", element: <ProductPage /> },
          { path: "contact", element: <ContactPage /> },
          { path: "faqs", element: <FaqsPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "order/:number", element: <OrderPage /> },
          { path: "account", element: <AccountPage /> },
          { path: "search", element: <SearchPage /> },
          { path: "privacy", element: <LegalPage kind="privacy" /> },
          { path: "refund", element: <LegalPage kind="refund" /> },
          { path: "terms", element: <LegalPage kind="terms" /> },
          { path: "shipping", element: <LegalPage kind="shipping" /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    path: "/studio",
    element: <StudioLayout />,
    children: [
      { index: true, element: <StudioDashboard /> },
      { path: "login", element: <StudioLogin /> },
      { path: "products", element: <StudioProducts /> },
      { path: "products/:id", element: <StudioProductEdit /> },
      { path: "orders", element: <StudioOrders /> },
      { path: "orders/:number", element: <StudioOrderDetail /> },
      { path: "carousels", element: <StudioCarousels /> },
      { path: "settings", element: <StudioSettings /> },
    ],
  },
  {
    path: "/lab",
    element: <LabLayout />,
    children: [
      { index: true, element: <LabHome /> },
      { path: "heroes", element: <HeroesLab /> },
      { path: "cards", element: <CardsLab /> },
      { path: "drawers", element: <DrawersLab /> },
      { path: "flip", element: <FlipLab /> },
    ],
  },
]);
