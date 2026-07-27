import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Aitools = () => {
  const navigate = useNavigate();
  return (
    <div className='my-16 px-4 sm:my-24 sm:px-8 lg:px-20 xl:px-32'>
      <div className='text-center'>
        <h2 className='text-3xl font-semibold text-slate-700 sm:text-[42px]'>
          Powerful AI Tools 
        </h2>
        <p className='text-gray-500 max-w-lg mx-auto'>
          Everything you need to create ,enhance, and optimize your content with cutting-edge AI technology
        </p>
      </div>

      <div className='mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {AiToolsData.map((tool,index) => (
          <div key = {index} className='w-full cursor-pointer rounded-lg border border-gray-100 bg-[#FDFDFE] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 sm:p-8' onClick={() => navigate(tool.path)}>
            <tool.Icon className='w-12 h-12 p-3 text-white rounded-xl' style = {{background : `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`}}/>
            <h3 className='mt-6 mb-3 text-lg font-semibold'>{tool.title}</h3>
            <p className='text-gray-400 text-sm max-w-[95%]'>{tool.description}</p>

          </div>

        ))}

      </div>

    </div>
  )
}

export default Aitools
