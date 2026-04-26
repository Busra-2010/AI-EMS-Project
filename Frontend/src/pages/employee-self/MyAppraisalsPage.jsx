import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyAppraisalsPage() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAppraisals();
  }, []);

  const fetchMyAppraisals = async () => {
    try {
      const empRes = await api.get('/employees/');
      const me = empRes.data.find(e => e.email === user?.email);
      if (me) {
        const res = await api.get(`/appraisals/employee/${me.id}`);
        setAppraisals(res.data);
      }
    } catch (err) {
      toast.error('Failed to load appraisals');
    } finally {
      setLoading(false);
    }
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

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Appraisals</h1>
        <p className="text-gray-500 text-sm">Your performance reviews</p>
      </div>

      {appraisals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-gray-400">No appraisals found yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appraisals.map(app => (
            <div key={app.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    Period: {app.period || 'N/A'}
                  </p>
                  <p className="text-yellow-500 text-lg mt-1">
                    {'⭐'.repeat(Math.round(app.rating))} ({app.rating}/5)
                  </p>
                </div>
                {app.sentiment && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${sentimentColor(app.sentiment)}`}>
                    {sentimentEmoji(app.sentiment)} {app.sentiment}
                    {app.sentiment_score && ` (${(app.sentiment_score * 100).toFixed(0)}%)`}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {app.feedback || 'No feedback provided'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}