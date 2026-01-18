import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Spaces from "./pages/Spaces";
import SpaceDetail from "./pages/SpaceDetail";
import CreateSpace from "./pages/CreateSpace";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data is fresh for 30 seconds
      gcTime: 60000, // Cache kept for 1 minute after becoming unused
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Only retry once on failure
    },
  },
});

// Clerk publishable key (safe to expose - it's public)
const CLERK_PUBLISHABLE_KEY = "pk_test_YXdhaXRlZC1hbmVtb25lLTc5LmNsZXJrLmFjY291bnRzLmRldiQ";

// Clerk routes wrapper component
function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      signInUrl="/login"
      signUpUrl="/signup"
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login/*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <SignIn
                  routing="path"
                  path="/login"
                  signUpUrl="/signup"
                  fallbackRedirectUrl="/dashboard"
                />
              </div>
            }
          />
          <Route
            path="/signup/*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <SignUp
                  routing="path"
                  path="/signup"
                  signInUrl="/login"
                  fallbackRedirectUrl="/dashboard"
                />
              </div>
            }
          />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/spaces" element={
            <ProtectedRoute>
              <Spaces />
            </ProtectedRoute>
          } />
          <Route path="/spaces/new" element={
            <ProtectedRoute>
              <CreateSpace />
            </ProtectedRoute>
          } />
          <Route path="/spaces/:id" element={
            <ProtectedRoute>
              <SpaceDetail />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ClerkProvider>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ClerkProviderWithRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
