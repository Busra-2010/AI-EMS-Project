import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyAttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const empRes = await api.get('/employees/');
      const me = empRes.data.find(e => e.email === user?.email);
      if (me) {
        const [attRes, summaryRes] = await Promise.all([
          api.get(`/attendance/employee/${me.id}`),
          api.get(`/attendance/employee/${me.id}/summary`)
        ]);
        setAttendance(attRes.data);
        setSummary(summaryRes.data);
      }
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-500 text-sm">Your attendance history and summary</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Days', value: summary.total_days, color: 'bg-blue-500' },
            { label: 'Present', value: summary.present, color: 'bg-green-500' },
            { label: 'Absent', value: summary.absent, color: 'bg-red-500' },
            { label: 'Late', value: summary.late, color: 'bg-yellow-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
              <div className={`${item.color} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {item.value}
              </div>
              <p className="text-gray-500 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance percentage */}
      {summary && (
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-blue-600">
            {summary.attendance_percentage}%
          </div>
          <div>
            <p className="font-medium text-gray-800">Attendance Rate</p>
            <p className="text-sm text-gray-500">Based on {summary.total_days} recorded days</p>
          </div>
        </div>
      )}

      {/* Attendance table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.map(att => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{att.date}</td>
                    <td className="px-6 py-4">{att.check_in || 'N/A'}</td>
                    <td className="px-6 py-4">{att.check_out || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(att.status)}`}>
                        {att.status?.replace('_', ' ')}
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