import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import NovoPedido from './pages/NovoPedido';
import PedidoDetalhes from './pages/PedidoDetalhes';
import AdminLojas from './pages/AdminLojas';
import AdminUsers from './pages/AdminUsers';
import './App.css';

// Componente para rotas protegidas
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Componente para redirecionar se já estiver autenticado
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Footer />
        <Routes>
          {/* Rota pública */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Rotas de Pedidos */}
            <Route
              path="pedidos"
              element={
                <ProtectedRoute allowedRoles={['loja', 'departamento']}>
                  <Pedidos />
                </ProtectedRoute>
              }
            />
            <Route
              path="pedidos/novo"
              element={
                <ProtectedRoute allowedRoles={['loja']}>
                  <NovoPedido />
                </ProtectedRoute>
              }
            />
            <Route
              path="pedidos/:id"
              element={
                <ProtectedRoute allowedRoles={['loja', 'departamento']}>
                  <PedidoDetalhes />
                </ProtectedRoute>
              }
            />

            {/* Rotas de Administração */}
            <Route
              path="admin/lojas"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLojas />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
