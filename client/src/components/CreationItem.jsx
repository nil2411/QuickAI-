import { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({item}) => {

    const [expanded ,setExpanded] = useState(false);
  return (
    <div className='w-full max-w-5xl cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-sm' onClick={() => setExpanded(!expanded)}>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0'>
                <h2 className='break-words font-medium text-slate-800'>{item.prompt}</h2>
                <p className='text-gray-500'>{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
            </div>
            <button className='max-w-full shrink-0 self-start break-words rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-1 text-[#1E40AF]'>{item.type}</button>

        </div>

        {
            expanded && (
                <div className='mt-3'>
                    {item.type === 'image' ? (
                        <div>
                            <img src={item.content} alt="" className='w-full max-w-md rounded-md'/>
                        </div>

                    ): (
                        <div className='max-h-96 overflow-y-auto text-sm text-slate-700'>
                            <div className='reset-tw'>
                                <Markdown>{item.content}</Markdown>
                            </div>
                            

                        </div>
                    )} 
                </div>
            )
        }

    </div>
  )
}

export default CreationItem
