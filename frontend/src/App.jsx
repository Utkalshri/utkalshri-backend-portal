import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedLayout from "./components/ProtectedLayout";
import { useAuth } from "./contexts/useAuth";
import CustomersPage from "./pages/CustomersPage";
import CouponsPage from "./pages/CouponsPage";
import ReferralCodesPage from "./pages/ReferralCodesPage";
import ReferralUsagePage from "./pages/ReferralUsagePage";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ProductsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <OrdersPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CustomersPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CouponsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ReferralCodesPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/referral-usage"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ReferralUsagePage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
