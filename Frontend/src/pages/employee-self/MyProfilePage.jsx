import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      // Get all employees and find the one matching logged in email
      const res = await api.get('/employees/');
      const me = res.data.find(e => e.email === user?.email);
      if (me) {
        setEmployee(me);
        if (me.department_id) {
          const deptRes = await api.get(`/departments/${me.department_id}`);
          setDepartment(deptRes.data);
        }
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading profile...</p>
    </div>
  );

  if (!employee) return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
        <p className="text-yellow-700 font-medium">Profile not found</p>
        <p className="text-yellow-600 text-sm mt-1">
          Your employee profile hasn't been set up yet. Please contact HR.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm">Your personal and employment details</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{employee.name}</p>
            <p className="text-gray-500 text-sm">{employee.email}</p>
            <span className="inline-block mt-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {employee.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Phone', value: employee.phone || 'N/A' },
            { label: 'Department', value: department?.name || 'N/A' },
            { label: 'Designation', value: employee.designation || 'N/A' },
            { label: 'Employment Type', value: employee.employment_type?.replace('_', ' ') },
            { label: 'Salary', value: `₹${employee.salary?.toLocaleString()}` },
            { label: 'Joining Date', value: employee.joining_date || 'N/A' },
            { label: 'Address', value: employee.address || 'N/A' },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-gray-400 text-xs uppercase tracking-wide">{item.label}</p>
              <p className="text-gray-800 font-medium mt-1 capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}