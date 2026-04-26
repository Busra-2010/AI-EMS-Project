import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments/'),
        api.get('/employees/')
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        // Update existing department
        await api.put(`/departments/${editDept.id}`, form);
        toast.success('Department updated successfully!');
      } else {
        // Create new department
        await api.post('/departments/', form);
        toast.success('Department created successfully!');
      }
      setShowForm(false);
      setEditDept(null);
      setForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setEditDept(dept);
    setForm({ name: dept.name, description: dept.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete department');
    }
  };

  const getEmployeeCount = (deptId) => {
    return employees.filter(e => e.department_id === deptId).length;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading departments...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
          <p className="text-gray-500 text-sm">
            Manage your organization's departments
          </p>
        </div>
        <button
          onClick={() => {
            setEditDept(null);
            setForm({ name: '', description: '' });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editDept ? 'Edit Department' : 'Add New Department'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name *
              </label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Engineering, Marketing, HR"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this department..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                {editDept ? 'Update Department' : 'Create Department'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditDept(null);
                  setForm({ name: '', description: '' });
                }}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="bg-blue-500 text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center">
            🏢
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Departments</p>
            <p className="text-2xl font-bold text-gray-800">{departments.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="bg-green-500 text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center">
            👥
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Employees</p>
            <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="bg-yellow-500 text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center">
            📊
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg per Department</p>
            <p className="text-2xl font-bold text-gray-800">
              {departments.length > 0
                ? (employees.length / departments.length).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Department cards */}
      {departments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-gray-400 text-lg">No departments found</p>
          <p className="text-gray-400 text-sm mt-1">
            Click "Add Department" to create your first department
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
            >
              {/* Dept header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="text-yellow-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Dept info */}
              <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {dept.description || 'No description provided'}
              </p>

              {/* Employee count */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Employees</span>
                <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                  {getEmployeeCount(dept.id)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}