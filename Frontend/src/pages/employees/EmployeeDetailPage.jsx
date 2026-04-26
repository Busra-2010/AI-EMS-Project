import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);

      if (res.data.department_id) {
        const deptRes = await api.get(`/departments/${res.data.department_id}`);
        setDepartment(deptRes.data);
      }
    } catch (err) {
      toast.error('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading employee...</p>
    </div>
  );

  if (!employee) return (
    <div className="p-6">
      <p className="text-red-500">Employee not found</p>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{employee.name}</h1>
          <p className="text-gray-500 text-sm">{employee.designation || 'No designation'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/employees/edit/${id}`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/employees')}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Back
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{employee.name}</p>
            <p className="text-gray-500 text-sm">{employee.email}</p>
            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
              employee.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {employee.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="Phone" value={employee.phone || 'N/A'} />
          <InfoRow label="Department" value={department?.name || 'N/A'} />
          <InfoRow label="Designation" value={employee.designation || 'N/A'} />
          <InfoRow label="Employment Type" value={employee.employment_type?.replace('_', ' ')} />
          <InfoRow label="Salary" value={`₹${employee.salary?.toLocaleString()}`} />
          <InfoRow label="Joining Date" value={employee.joining_date || 'N/A'} />
          <InfoRow label="Address" value={employee.address || 'N/A'} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 font-medium mt-1 capitalize">{value}</p>
    </div>
  );
}