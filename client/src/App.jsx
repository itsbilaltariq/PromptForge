import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home    from './pages/Home';
import History from './pages/History';
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </AuthProvider>
  );
}