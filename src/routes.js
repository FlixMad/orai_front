import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/Dashboard';
import Profile from './pages/profile/Profile';
import PasswordChange from './pages/auth/PasswordChange';
import Notifications from './pages/notifications/Notifications';
import Calendar from './pages/calendar/Calendar';
import ChatRoom from './pages/chat/ChatRoom';
import ChatList from './pages/chat/ChatList';
import CreateChatRoom from './pages/chat/CreateChatRoom';
import Organization from './pages/organization/Organization';
import Emergency from './pages/emergency/Emergency';
import LeaveManagement from './pages/leave/LeaveManagement';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/notifications" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/password/change" element={<PasswordChange />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/chat" element={<CreateChatRoom />} />
      <Route path="/chat/:chatRoomId" element={<ChatRoom />} />
      <Route path="/chat/list" element={<ChatList />} />
      <Route path="/organization" element={<Organization />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/leave" element={<LeaveManagement />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
