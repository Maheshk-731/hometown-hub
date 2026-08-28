import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Communities from './pages/Communities';
import MyCommunities from './pages/MyCommunities';
import CommunityDetail from './pages/CommunityDetail';
import CreateCommunity from './pages/CreateCommunity';
import EditCommunity from './pages/EditCommunity';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import PostDetail from './pages/PostDetail';
import CommunityRequests from './pages/CommunityRequests';
import CommunityChat from './pages/CommunityChat';
import Events from './pages/Events';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/communities" element={<Communities />} />
              <Route
                path="/my-communities"
                element={
                  <ProtectedRoute>
                    <MyCommunities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities/new"
                element={
                  <ProtectedRoute>
                    <CreateCommunity />
                  </ProtectedRoute>
                }
              />
              <Route path="/communities/:slug" element={<CommunityDetail />} />
              <Route
                path="/communities/:slug/edit"
                element={
                  <ProtectedRoute>
                    <EditCommunity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities/:slug/events/new"
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities/:slug/requests"
                element={
                  <ProtectedRoute>
                    <CommunityRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communities/:slug/chat"
                element={
                  <ProtectedRoute>
                    <CommunityChat />
                  </ProtectedRoute>
                }
              />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<ComingSoon title="Page not found" />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;