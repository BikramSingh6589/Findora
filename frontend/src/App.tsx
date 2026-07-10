import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { OtpVerification } from './pages/Auth/OtpVerification';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { AdminLogin } from './pages/Auth/AdminLogin';
import { Profile } from './pages/Profile';
import { ReportSelection } from './pages/Report/ReportSelection';
import { ReportFound } from './pages/Report/ReportFound';
import { ReportLost } from './pages/Report/ReportLost';
import { ClaimOwnership } from './pages/Claim/ClaimOwnership';
import { CommunityBoard } from './pages/Community/CommunityBoard';
import { FinderChat } from './pages/Chat/FinderChat';
import { ChatHistory } from './pages/Chat/ChatHistory';
import { QRHandover } from './pages/Handover/QRHandover';
import { QRScan } from './pages/Handover/QRScan';
import { ItemDetail } from './pages/Item/ItemDetail';
import { AIMatches } from './pages/Matches/AIMatches';
import { Leaderboard } from './pages/Leaderboard/Leaderboard';
import { SuggestOwner } from './pages/SuggestOwner/SuggestOwner';
import { Settings } from './pages/Settings/Settings';
import { HelpSupport } from './pages/Help/HelpSupport';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminClaimManagement } from './pages/Admin/AdminClaimManagement';
import { AdminItemModeration } from './pages/Admin/AdminItemModeration';
import { AdminUserManagement } from './pages/Admin/AdminUserManagement';
import { AdminCommModeration } from './pages/Admin/AdminCommModeration';
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="claims" element={<AdminClaimManagement />} />
            <Route path="items" element={<AdminItemModeration />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="community" element={<AdminCommModeration />} />
          </Route>
        </Route>

        {/* User App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="report" element={<ReportSelection />} />
            <Route path="report/found" element={<ReportFound />} />
            <Route path="report/lost" element={<ReportLost />} />
            <Route path="claim/:itemId" element={<ClaimOwnership />} />
            <Route path="claim" element={<ClaimOwnership />} />
            <Route path="community" element={<CommunityBoard />} />
            <Route path="item/:itemId" element={<ItemDetail />} />
            <Route path="matches" element={<AIMatches />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="suggest/:itemId" element={<SuggestOwner />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpSupport />} />
            {/* Handover Flow */}
            <Route path="chats" element={<ChatHistory />} />
            <Route path="chat/finder/:itemId" element={<FinderChat />} />
            <Route path="handover/qr/:itemId" element={<QRHandover />} />
            <Route path="handover/scan/:itemId" element={<QRScan />} />
            {/* Collection Point — page to be built */}
            <Route path="collect-item/:claimId" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl">📍</div>
                <h2 className="text-2xl font-extrabold text-text-primary">Collection Point</h2>
                <p className="text-text-secondary text-sm max-w-sm">
                  This page is coming soon. You'll be able to set the collection location, time, and contact details for the handover.
                </p>
                <a href="/" className="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                  Back to Dashboard
                </a>
              </div>
            } />
            <Route path="*" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Coming Soon</h2></div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
