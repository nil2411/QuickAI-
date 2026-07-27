import { dummyPublishedCreationData } from '../assets/assets'
import { useUser } from '@clerk/react';
import { Heart } from 'lucide-react';

const Community = () => {
  const creations = dummyPublishedCreationData;
  const { user } = useUser();

  return (
    <div className='h-full overflow-y-auto p-4 text-slate-700 sm:p-6'>
      <h1 className='mb-4 text-lg font-semibold sm:text-xl'>Creations</h1>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {creations.map((creation, index) => (
          <div key={index} className='group relative overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <img src={creation.content} alt="" className='aspect-[4/3] w-full object-cover' />
            <div className='absolute inset-0 flex items-end justify-between gap-3 bg-gradient-to-b from-transparent to-black/80 p-3 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100'>
              <p className='line-clamp-3 min-w-0 text-sm'>{creation.prompt}</p>
              <div className='flex items-center gap-1'>
                <p>{creation.likes.length}</p>
                <Heart className={`h-5 min-w-5 cursor-pointer hover:scale-110 ${creation.likes.includes(user?.id) ? 'fill-red-500 text-red-600' : 'text-white'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Community
