import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    month: '',
    year: new Date().getFullYear(),
    basic_salary: '',
    allowances: 0,
    deductions: 0,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payRes, empRes] = await Promise.all([
        api.get('/payroll/'),
        api.get('/employees/')
      ]);
      setPayrolls(payRes.data);
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
      await api.post('/payroll/', {
        ...form,
        employee_id: parseInt(form.employee_id),
        month: parseInt(form.month),
        year: parseInt(form.year),
        basic_salary: parseFloat(form.basic_salary),
        allowances: parseFloat(form.allowances),
        deductions: parseFloat(form.deductions),
      });
      toast.success('Payroll generated successfully!');
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate payroll');
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
          <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
          <p className="text-gray-500 text-sm">Generate and manage employee payslips</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Generate Payroll'}
        </button>
      </div>

      {/* Generate Payroll Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Generate Payroll</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <select
                required
                value={form.month}
                onChange={e => setForm({ ...form, month: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Month</option>
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                required
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₹) *</label>
              <input
                type="number"
                required
                value={form.basic_salary}
                onChange={e => setForm({ ...form, basic_salary: e.target.value })}
                placeholder="75000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (₹)</label>
              <input
                type="number"
                value={form.allowances}
                onChange={e => setForm({ ...form, allowances: e.target.value })}
                placeholder="5000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (₹)</label>
              <input
                type="number"
                value={form.deductions}
                onChange={e => setForm({ ...form, deductions: e.target.value })}
                placeholder="2000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. March 2024 salary"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Generate Payslip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Month/Year</th>
                <th className="px-6 py-4">Basic</th>
                <th className="px-6 py-4">Allowances</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Pay</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{getEmployeeName(p.employee_id)}</td>
                    <td className="px-6 py-4">{months[p.month - 1]} {p.year}</td>
                    <td className="px-6 py-4">₹{p.basic_salary?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-600">+₹{p.allowances?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-600">-₹{p.deductions?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">₹{p.net_pay?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">{p.notes || 'N/A'}</td>
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