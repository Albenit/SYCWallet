import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from './pages/StartPage';
import CreateNewPassword from './pages/CreateNewPassword';
import './App.css';
import SecretPhrases from "./pages/SecretPhrases";
import ConfirmSecretPhrase from "./pages/ConfirmSecretPhrase";
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import ImportWallet from "./pages/ImportWallet";
import History from "./pages/History";
import { WalletProvider } from "./context/WalletContext";
function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/import-wallet" element={<ImportWallet />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/createnewpassword" element={<CreateNewPassword />} />
          <Route path="/secret-phrases" element={<SecretPhrases />} />
          <Route path="/confirm-secret-phrase" element={<ConfirmSecretPhrase />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
        </Routes>

      </Router>
    </WalletProvider>
  );
}

export default App;
