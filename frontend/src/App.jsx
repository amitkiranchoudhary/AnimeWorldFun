import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CustomCursor from './components/CustomCursor';
import FallingStars from './components/FallingStars';
import Navbar from './components/Navbar';
import FeedbackSection from './components/FeedbackSection';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import AnimeTracker from './pages/AnimeTracker';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import WriterDashboard from './pages/WriterDashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <FallingStars />
        <CustomCursor />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:slug" element={<BlogPost />} />
            <Route path="/anime-tracker" element={<AnimeTracker />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/writer" element={<WriterDashboard />} />
          </Routes>
        </main>
        <FeedbackSection />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
