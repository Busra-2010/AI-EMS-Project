import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyPayrollPage() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => {
    fetchMyPayroll();
  }, []);

  const fetchMyPayroll = async () => {
    try {
      const empRes = await api.get('/employees/');
      const me = empRes.data.find(e => e.email === user?.email);
      if (me) {
        const [payRes, sumRes] = await Promise.all([
          api.get(`/payroll/employee/${me.id}`),
          api.get(`/payroll/employee/${me.id}/summary`)
        ]);
        setPayrolls(payRes.data);
        setSummary(sumRes.data);
      }
    } catch (err) {
      toast.error('Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Payslips</h1>
        <p className="text-gray-500 text-sm">Your salary and payroll history</p>
      </div>

      {/* Summary */}
      {summary && summary.total_months > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Months', value: summary.total_months, prefix: '' },
            { label: 'Total Earned', value: summary.total_net_pay?.toLocaleString(), prefix: '₹' },
            { label: 'Total Allowances', value: summary.total_allowances?.toLocaleString(), prefix: '₹' },
            { label: 'Total Deductions', value: summary.total_deductions?.toLocaleString(), prefix: '₹' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-4">
              <p className="text-gray-500 text-xs">{item.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {item.prefix}{item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Payslips table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Month/Year</th>
                <th className="px-6 py-4">Basic Salary</th>
                <th className="px-6 py-4">Allowances</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No payslips found
                  </td>
                </tr>
              ) : (
                payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{months[p.month - 1]} {p.year}</td>
                    <td className="px-6 py-4">₹{p.basic_salary?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-600">+₹{p.allowances?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-600">-₹{p.deductions?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">₹{p.net_pay?.toLocaleString()}</td>
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