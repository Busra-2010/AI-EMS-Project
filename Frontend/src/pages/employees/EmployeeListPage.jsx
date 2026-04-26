import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees/'),
        api.get('/departments/')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deactivated successfully');
      fetchData(); // refresh list
    } catch (err) {
      toast.error('Failed to deactivate employee');
    }
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'N/A';
  };

  // Filter employees by search and department
  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? emp.department_id === parseInt(filterDept) : true;
    return matchSearch && matchDept;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading employees...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 text-sm">Manage all employees in your organization</p>
        </div>
        <button
          onClick={() => navigate('/employees/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Employee count */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-800">{filtered.length}</span> employees
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                    <td className="px-6 py-4">{getDeptName(emp.department_id)}</td>
                    <td className="px-6 py-4">{emp.designation || 'N/A'}</td>
                    <td className="px-6 py-4">₹{emp.salary?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          className="text-yellow-600 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        {emp.is_active && (
                          <button
                            onClick={() => handleDeactivate(emp.id)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
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