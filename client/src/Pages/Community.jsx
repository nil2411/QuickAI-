import { useUser, useAuth } from '@clerk/react';
import { Heart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchPublishedCreations = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setCreations(data.creations);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load community creations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        '/api/user/toggle-like-creations',
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        fetchPublishedCreations();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPublishedCreations();
  }, []);

  return (
    <div className='h-full overflow-y-auto p-4 text-slate-700 sm:p-6'>
      <h1 className='mb-4 text-lg font-semibold sm:text-xl'>Community Creations</h1>

      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
        </div>
      ) : creations.length === 0 ? (
        <div className='flex items-center justify-center py-20 text-gray-400'>
          <p>No public creations yet. Be the first to share!</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {creations.map((creation) => (
            <div key={creation.id} className='group relative overflow-hidden rounded-lg border border-gray-200 bg-white'>
              <img src={creation.content} alt="" className='aspect-[4/3] w-full object-cover' />
              <div className='absolute inset-0 flex items-end justify-between gap-3 bg-gradient-to-b from-transparent to-black/80 p-3 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100'>
                <p className='line-clamp-3 min-w-0 text-sm'>{creation.prompt}</p>
                <div className='flex items-center gap-1'>
                  <p>{(creation.likes || []).length}</p>
                  <Heart
                    onClick={() => handleToggleLike(creation.id)}
                    className={`h-5 min-w-5 cursor-pointer hover:scale-110 ${(creation.likes || []).includes(user?.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Community
