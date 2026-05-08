import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Feed from "./pages/Feed.jsx";
import Explore from "./pages/Explore.jsx";
import Profile from "./pages/Profile.jsx";
import Teachers from "./pages/Teachers.jsx";
import TeacherDetail from "./pages/TeacherDetail.jsx";
import Community from "./pages/Community.jsx";
import QuestionDetail from "./pages/QuestionDetail.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";
import Collabs from "./pages/Collabs.jsx";
import CollabDetail from "./pages/CollabDetail.jsx";
import Messages from "./pages/Messages.jsx";
import EditProfile from "./pages/EditProfile.jsx";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="center-screen">Loading…</div>;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <Private>
            <Layout>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/u/:username" element={<Profile />} />
                <Route path="/settings/profile" element={<EditProfile />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/teachers/:id" element={<TeacherDetail />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/:id" element={<QuestionDetail />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<ListingDetail />} />
                <Route path="/collabs" element={<Collabs />} />
                <Route path="/collabs/:id" element={<CollabDetail />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:userId" element={<Messages />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Private>
        }
      />
    </Routes>
  );
}
