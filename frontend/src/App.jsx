import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from './pages/StartPage';
import CreateNewPassword from './pages/CreateNewPassword';
import './App.css';
import SecretPhrases from "./pages/SecretPhrases";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/createnewpassword" element={<CreateNewPassword />} />
        <Route path="/secret-phrases" element={<SecretPhrases />} />
      </Routes>
    </Router>
  );
}

export default App;
