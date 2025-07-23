import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedLayout from "./components/ProtectedLayout";
import { useAuth } from "./contexts/useAuth";
import CustomersPage from "./pages/CustomersPage";

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
