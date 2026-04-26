import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const empRes = await api.get('/employees/');
    const employees = empRes.data;

    const deptRes = await api.get('/departments/');
    const departments = deptRes.data;

    const leaveRes = await api.get('/leaves/');
    const leaves = leaveRes.data;

    // ← Wrap payroll in try/catch separately
    // so it doesn't break everything if manager can't access it
    let payrolls = [];
    try {
      const payrollRes = await api.get('/payroll/');
      payrolls = payrollRes.data;
    } catch {
      payrolls = []; // manager gets 0, that's fine
    }

    setStats({
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      pendingLeaves: leaves.filter(l => l.status === 'pending').length,
      totalPayroll: payrolls.reduce((sum, p) => sum + p.net_pay, 0),
    });

    const deptChartData = departments.map(dept => ({
      name: dept.name,
      value: employees.filter(e => e.department_id === dept.id).length
    }));
    setDepartmentData(deptChartData);

    // ← Wrap attendance separately too
    let attendance = [];
    try {
      const attRes = await api.get('/attendance/');
      attendance = attRes.data;
    } catch {
      attendance = [];
    }

    const statusCount = {
      Present: attendance.filter(a => a.status === 'present').length,
      Absent: attendance.filter(a => a.status === 'absent').length,
      Late: attendance.filter(a => a.status === 'late').length,
      'Half Day': attendance.filter(a => a.status === 'half_day').length,
    };

    setAttendanceData(
      Object.entries(statusCount).map(([name, value]) => ({ name, value }))
    );

  } catch (err) {
    console.error('Dashboard error:', err);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.email} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening in your organization today.
          </p>
          <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} color="bg-blue-500" icon="👥" />
        <StatCard title="Departments" value={stats.totalDepartments} color="bg-green-500" icon="🏢" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} color="bg-yellow-500" icon="📅" />
        <StatCard title="Total Payroll" value={`₹${stats.totalPayroll.toLocaleString()}`} color="bg-red-500" icon="💰" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Attendance Overview</h2>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-10">No attendance data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Employees by Department</h2>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-10">No department data yet</p>
          )}
        </div>

      </div>

      {/* Summary table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-2">Metric</th>
                <th className="pb-2">Value</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3">Total Employees</td>
                <td className="py-3 font-medium">{stats.totalEmployees}</td>
                <td className="py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">Active</span></td>
              </tr>
              <tr>
                <td className="py-3">Pending Leave Requests</td>
                <td className="py-3 font-medium">{stats.pendingLeaves}</td>
                <td className="py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Needs Action</span></td>
              </tr>
              <tr>
                <td className="py-3">Total Departments</td>
                <td className="py-3 font-medium">{stats.totalDepartments}</td>
                <td className="py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span></td>
              </tr>
              <tr>
                <td className="py-3">Monthly Payroll</td>
                <td className="py-3 font-medium">₹{stats.totalPayroll.toLocaleString()}</td>
                <td className="py-3"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">This Month</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
      <div className={`${color} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}