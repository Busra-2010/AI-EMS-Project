import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const empRes = await api.get('/employees/');
      const me = empRes.data.find(e => e.email === user?.email);
      if (me) {
        setEmployeeId(me.id);
        const leaveRes = await api.get(`/leaves/my/${me.id}`);
        setLeaves(leaveRes.data);
      }
    } catch (err) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves/', { ...form, employee_id: employeeId });
      toast.success('Leave applied successfully!');
      setShowForm(false);
      setForm({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
      fetchMyData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to apply leave');
    }
  };

  const statusColor = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Leaves</h1>
          <p className="text-gray-500 text-sm">Apply and track your leave requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Apply Leave'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Apply for Leave</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={form.leave_type}
                onChange={e => setForm({ ...form, leave_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="earned">Earned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date" required
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date" required
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Reason for leave"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">From</th>
                <th className="px-6 py-4">To</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 capitalize">{leave.leave_type}</td>
                    <td className="px-6 py-4">{leave.start_date}</td>
                    <td className="px-6 py-4">{leave.end_date}</td>
                    <td className="px-6 py-4 text-gray-500">{leave.reason || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{leave.manager_comment || 'N/A'}</td>
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