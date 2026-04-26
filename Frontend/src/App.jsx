import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth
import LoginPage from './pages/auth/LoginPage';
import CreateUserPage from './pages/auth/CreateUserPage';

// Admin/Manager pages
import DashboardPage from './pages/dashboard/DashboardPage';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import AddEmployeePage from './pages/employees/AddEmployeePage';
import EditEmployeePage from './pages/employees/EditEmployeePage';
import EmployeeDetailPage from './pages/employees/EmployeeDetailPage';
import DepartmentPage from './pages/departments/DepartmentPage';
import LeavePage from './pages/leaves/LeavePage';
import AttendancePage from './pages/attendance/AttendancePage';
import PayrollPage from './pages/payroll/PayrollPage';
import AppraisalPage from './pages/appraisals/AppraisalPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';

// Employee self-service pages
import MyProfilePage from './pages/employee-self/MyProfilePage';
import MyLeavesPage from './pages/employee-self/MyLeavesPage';
import MyAttendancePage from './pages/employee-self/MyAttendancePage';
import MyPayrollPage from './pages/employee-self/MyPayrollPage';
import MyAppraisalsPage from './pages/employee-self/MyAppraisalsPage';

import PrivateRoute from './components/layout/PrivateRoute';
import AdminRoute from './components/layout/AdminRoute';

export default function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin only */}
      <Route path="/create-user" element={<AdminRoute><CreateUserPage /></AdminRoute>} />
      <Route path="/employees/add" element={<AdminRoute><AddEmployeePage /></AdminRoute>} />
      <Route path="/employees/edit/:id" element={<AdminRoute><EditEmployeePage /></AdminRoute>} />
      <Route path="/payroll" element={<AdminRoute><PayrollPage /></AdminRoute>} />
      <Route path="/departments" element={<AdminRoute><DepartmentPage /></AdminRoute>} />

      {/* Admin + Manager */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/employees" element={<PrivateRoute><EmployeeListPage /></PrivateRoute>} />

      {/* ⚠️ /employees/:id must come AFTER /employees/edit/:id and /employees/add */}
      <Route path="/employees/:id" element={<PrivateRoute><EmployeeDetailPage /></PrivateRoute>} />

      <Route path="/leaves" element={<PrivateRoute><LeavePage /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/appraisals" element={<PrivateRoute><AppraisalPage /></PrivateRoute>} />
      <Route path="/chatbot" element={<PrivateRoute><ChatbotPage /></PrivateRoute>} />

      {/* Employee self-service */}
      <Route path="/my-profile" element={<PrivateRoute><MyProfilePage /></PrivateRoute>} />
      <Route path="/my-leaves" element={<PrivateRoute><MyLeavesPage /></PrivateRoute>} />
      <Route path="/my-attendance" element={<PrivateRoute><MyAttendancePage /></PrivateRoute>} />
      <Route path="/my-payroll" element={<PrivateRoute><MyPayrollPage /></PrivateRoute>} />
      <Route path="/my-appraisals" element={<PrivateRoute><MyAppraisalsPage /></PrivateRoute>} />

      {/* Default redirect based on role */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

function RoleRedirect() {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'employee') return <Navigate to="/my-profile" replace />;
  return <Navigate to="/dashboard" replace />;
}