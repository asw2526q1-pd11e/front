import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./components/AuthProvider";
import { SavedPostsProvider } from "./context/SavedPostContext";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import PostsPage from "./pages/PostsPage";
import PostDetailPage from "./pages/PostDetailPage";
import ComunitatsPage from "./pages/ComunitatsPage";
import CommunityDetail from "./pages/CommunityDetail";
import PerfilPage from "./pages/PerfilPage";
import LoginPage from "./pages/LoginPage";

import "./index.css";

// Component per protegir rutes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <SavedPostsProvider>
            <Routes>
              {/* Ruta de login (sense protecció) */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rutes protegides amb Navbar */}
              <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
              >
                <Route index element={<PostsPage />} />
                <Route path="posts/:id" element={<PostDetailPage />} />
                <Route path="comunitats" element={<ComunitatsPage />} />
                <Route path="comunitats/:id" element={<CommunityDetail />} />
                <Route path="perfil" element={<PerfilPage />} />
              </Route>

              {/* Redirigir qualsevol altra ruta a login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </SavedPostsProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
);