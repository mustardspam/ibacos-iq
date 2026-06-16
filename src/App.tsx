
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { InspectionProvider } from "./contexts/InspectionContext";
import ProtectedRoute, { RoleRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Inspection from "./pages/Inspection";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Audits from "./pages/Audits";
import AuditDetail from "./pages/AuditDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const inspectorOrAdmin = ['admin', 'inspector'];
const adminOnly = ['admin'];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <InspectionProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={
                <ProtectedRoute><ChangePassword /></ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={inspectorOrAdmin}>
                    <Dashboard />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              <Route path="/inspection" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={inspectorOrAdmin}>
                    <Inspection />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              <Route path="/audits" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={inspectorOrAdmin}>
                    <Audits />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              <Route path="/audits/:id" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={inspectorOrAdmin}>
                    <AuditDetail />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute><Reports /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={adminOnly}>
                    <Admin />
                  </RoleRoute>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InspectionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
