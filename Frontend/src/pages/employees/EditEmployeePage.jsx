import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    designation: '',
    employment_type: 'full_time',
    salary: '',
    joining_date: '',
    department_id: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get('/departments/')
      ]);
      const emp = empRes.data;
      setForm({
        name: emp.name || '',
        phone: emp.phone || '',
        address: emp.address || '',
        designation: emp.designation || '',
        employment_type: emp.employment_type || 'full_time',
        salary: emp.salary || '',
        joining_date: emp.joining_date || '',
        department_id: emp.department_id || '',
        is_active: emp.is_active,
      });
      setDepartments(deptRes.data);
    } catch (err) {
      toast.error('Failed to load employee');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: parseFloat(form.salary),
        department_id: form.department_id ? parseInt(form.department_id) : null,
      };
      await api.put(`/employees/${id}`, payload);
      toast.success('Employee updated successfully!');
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
        <p className="text-gray-500 text-sm">Update employee details</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
              <input
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                name="joining_date"
                type="date"
                value={form.joining_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active Employee
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}