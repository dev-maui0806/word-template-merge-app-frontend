import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import Form from './pages/Form.jsx';
import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx';
import Checkout from './pages/Checkout.jsx';
import Policy from './pages/Policy.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy_policy" element={<Policy />} />
              <Route path="/refund_policy" element={<Policy />} />
              <Route path="/terms-and-conditions" element={<Policy />} />
              <Route path="/T&C" element={<Policy />} />
              <Route path="/T%26C" element={<Policy />} />
              <Route path="/cookie_policy" element={<Policy />} />
              <Route path="/Cookie_Policy" element={<Policy />} />
              <Route path="/legal_disclaimer" element={<Policy />} />
              <Route path="/Legal_Disclaimer" element={<Policy />} />
              <Route path="/arrange-venue" element={<Navigate to="/form/arrange-venue" replace />} />
              <Route
                path="/form/:actionSlug"
                element={
                  <ProtectedRoute>
                    <Form />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
