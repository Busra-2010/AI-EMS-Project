import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    date: '',
    check_in: '',
    check_out: '',
    status: 'present',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        api.get('/attendance/'),
        api.get('/employees/')
      ]);
      setAttendance(attRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/', {
        ...form,
        employee_id: parseInt(form.employee_id)
      });
      toast.success('Attendance marked successfully!');
      setShowForm(false);
      setForm({ employee_id: '', date: '', check_in: '', check_out: '', status: 'present' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance');
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  const statusColor = (status) => {
    if (status === 'present') return 'bg-green-100 text-green-700';
    if (status === 'absent') return 'bg-red-100 text-red-700';
    if (status === 'late') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-500 text-sm">Track daily employee attendance</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Mark Attendance'}
        </button>
      </div>

      {/* Mark Attendance Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Mark Attendance</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select
                required
                value={form.employee_id}
                onChange={e => setForm({ ...form, employee_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
              <input
                type="time"
                value={form.check_in}
                onChange={e => setForm({ ...form, check_in: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
              <input
                type="time"
                value={form.check_out}
                onChange={e => setForm({ ...form, check_out: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Mark Attendance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.map(att => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{getEmployeeName(att.employee_id)}</td>
                    <td className="px-6 py-4">{att.date}</td>
                    <td className="px-6 py-4">{att.check_in || 'N/A'}</td>
                    <td className="px-6 py-4">{att.check_out || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(att.status)}`}>
                        {att.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}