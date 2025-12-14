import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FuelProvider } from "./contexts/FuelContext";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brutalist-charcoal halftone-bg flex items-center justify-center">
        <div className="font-display text-4xl text-brutalist-yellow animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />;
}

function App() {
  return (
    <AuthProvider>
      <FuelProvider>
        <AppContent />
      </FuelProvider>
    </AuthProvider>
  );
}

export default App;
