import { Gem, Loader2, Sparkles } from 'lucide-react';
import { Show, useAuth } from '@clerk/react';
import CreationItem from '../components/CreationItem';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreations(data.creations || []);
      } else {
        toast.error(data.message || 'Failed to load creations');
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to load creations'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  return (
    <div className='h-full overflow-y-auto p-4 sm:p-6'>
      <div className='grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {/* Total creations card */}
        <div className='flex min-w-0 items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:px-6'>
          <div className='min-w-0 text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>
              {loading ? '—' : creations.length}
            </h2>
          </div>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>

        {/* Active Plan */}
        <div className='flex min-w-0 items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:px-6'>
          <div className='min-w-0 text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Show when={{ plan: 'premium' }} fallback="Free">
                Premium
              </Show>
            </h2>
          </div>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      <div className='mt-6 w-full max-w-5xl space-y-3'>
        <p className='mb-4 font-medium text-slate-700'>Recent Creations</p>

        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
          </div>
        ) : creations.length === 0 ? (
          <div className='rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-400'>
            <p>No creations yet. Start creating with the AI tools!</p>
          </div>
        ) : (
          creations.map((item) => <CreationItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default Dashboard;
