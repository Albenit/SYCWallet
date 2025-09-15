import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from './pages/StartPage';
import CreateNewPassword from './pages/CreateNewPassword';
import './App.css';
import SecretPhrases from "./pages/SecretPhrases";
import ConfirmSecretPhrase from "./pages/ConfirmSecretPhrase";
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from "./pages/Dashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
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
      </Routes>
    </Router>
  );
}

export default App;
