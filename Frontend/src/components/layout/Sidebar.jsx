import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define nav items per role
const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/employees', label: 'Employees', icon: '👥' },
  { path: '/departments', label: 'Departments', icon: '🏢' },
  { path: '/leaves', label: 'Leave Management', icon: '📅' },
  { path: '/attendance', label: 'Attendance', icon: '🕐' },
  { path: '/payroll', label: 'Payroll', icon: '💰' },
  { path: '/appraisals', label: 'Appraisals', icon: '⭐' },
  { path: '/chatbot', label: 'AI Chatbot', icon: '🤖' },
  { path: '/create-user', label: 'Create User', icon: '➕' },
];

const managerNav = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/employees', label: 'Employees', icon: '👥' },
  { path: '/leaves', label: 'Leave Management', icon: '📅' },
  { path: '/attendance', label: 'Attendance', icon: '🕐' },
  { path: '/appraisals', label: 'Appraisals', icon: '⭐' },
  { path: '/chatbot', label: 'AI Chatbot', icon: '🤖' },
];

const employeeNav = [
  { path: '/my-profile', label: 'My Profile', icon: '👤' },
  { path: '/my-leaves', label: 'My Leaves', icon: '📅' },
  { path: '/my-attendance', label: 'My Attendance', icon: '🕐' },
  { path: '/my-payroll', label: 'My Payslips', icon: '💰' },
  { path: '/my-appraisals', label: 'My Appraisals', icon: '⭐' },
  { path: '/chatbot', label: 'AI Chatbot', icon: '🤖' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Pick nav items based on role
  const navItems =
    user?.role === 'admin' ? adminNav :
    user?.role === 'manager' ? managerNav :
    employeeNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 z-50">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">🏢 EMS</h1>
        <p className="text-gray-400 text-xs mt-1">Employee Management</p>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
              user?.role === 'admin' ? 'bg-red-600' :
              user?.role === 'manager' ? 'bg-yellow-600' :
              'bg-green-600'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-600 hover:text-white transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
}