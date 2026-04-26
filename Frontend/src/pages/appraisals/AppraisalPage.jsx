import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AppraisalPage() {
  const [appraisals, setAppraisals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    rating: '',
    feedback: '',
    period: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, empRes] = await Promise.all([
        api.get('/appraisals/'),
        api.get('/employees/')
      ]);
      setAppraisals(appRes.data);
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
      await api.post('/appraisals/', {
        ...form,
        employee_id: parseInt(form.employee_id),
        rating: parseFloat(form.rating),
      });
      toast.success('Appraisal submitted! AI analyzed the sentiment ✅');
      setShowForm(false);
      setForm({ employee_id: '', rating: '', feedback: '', period: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit appraisal');
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  const sentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'bg-green-100 text-green-700';
    if (sentiment === 'negative') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const sentimentEmoji = (sentiment) => {
    if (sentiment === 'positive') return '😊';
    if (sentiment === 'negative') return '😞';
    return '😐';
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
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
          <h1 className="text-2xl font-bold text-gray-800">Appraisals</h1>
          <p className="text-gray-500 text-sm">Performance reviews with AI sentiment analysis</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Appraisal'}
        </button>
      </div>

      {/* Add Appraisal Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Submit Appraisal</h2>
          <p className="text-xs text-blue-600 mb-4">
            🤖 AI will automatically analyze the sentiment of your feedback
          </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="5"
                step="0.5"
                value={form.rating}
                onChange={e => setForm({ ...form, rating: e.target.value })}
                placeholder="4.5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input
                type="text"
                value={form.period}
                onChange={e => setForm({ ...form, period: e.target.value })}
                placeholder="Q1 2024"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback *
              </label>
              <textarea
                required
                value={form.feedback}
                onChange={e => setForm({ ...form, feedback: e.target.value })}
                placeholder="Write detailed feedback about the employee's performance..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Submit & Analyze Sentiment 🤖
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appraisals Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Feedback</th>
                <th className="px-6 py-4">AI Sentiment</th>
                <th className="px-6 py-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appraisals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No appraisals found
                  </td>
                </tr>
              ) : (
                appraisals.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {getEmployeeName(app.employee_id)}
                    </td>
                    <td className="px-6 py-4">{app.period || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span title={`${app.rating}/5`}>
                        {renderStars(app.rating)} ({app.rating})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {app.feedback || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {app.sentiment ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sentimentColor(app.sentiment)}`}>
                          {sentimentEmoji(app.sentiment)} {app.sentiment}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {app.sentiment_score
                        ? `${(app.sentiment_score * 100).toFixed(1)}%`
                        : 'N/A'
                      }
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