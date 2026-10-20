import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Emergency from './pages/Emergency';
import Hospitals from './pages/Hospitals';
import ChatAgent from './pages/ChatAgent';
import Reminders from './pages/Reminders';
import ConfirmReminders from './pages/ConfirmReminders';
import EditReport from './pages/EditReport';
import Lifestyle from './pages/Lifestyle';
import SymptomAnalyzer from './pages/SymptomAnalyzer';
import DeviceHealth from './pages/DeviceHealth';
import Community from './pages/Community';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        {/* 1. The Emergency Page is now the absolute first screen! */}
        <Route path="/" element={<Emergency />} />

        {/* 2. Login is moved to its own page */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES: Wrapped inside the ProtectedRoute and then MainLayout frame */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hospitals" element={<Hospitals />} />          {/* We also keep Emergency available inside the dashboard just in case */}
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/chat" element={<ChatAgent />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/confirm-reminders" element={<ConfirmReminders />} />
            <Route path="/edit/:id" element={<EditReport />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/symptom-analyzer" element={<SymptomAnalyzer />} />
            <Route path="/device-health" element={<DeviceHealth />} />
            <Route path="/community" element={<Community />} />
          </Route>
        </Route>

        {/* Catch-all redirects back to the emergency home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;