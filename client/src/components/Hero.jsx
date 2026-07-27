import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <div className='relative inline-flex min-h-screen w-full flex-col justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat px-4 pb-14 pt-24 sm:px-20 xl:px-32'>

            <div className='text-center mb-6'>
                <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2] '>
                    Create amazing content <br />
                    <span className='text-primary'>with AI tools</span>
                </h1>
                <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600'>
                    Transform your content creation with our suite of premium AI tools .write articles,
                    generate images, and enhance your workflow.
                </p>

            </div>
            <div className='mx-auto flex w-full max-w-sm flex-col justify-center gap-4 text-sm sm:max-w-none sm:flex-row'>
                <button className='w-full cursor-pointer rounded-lg bg-primary px-6 py-3 text-white transition hover:scale-102 active:scale-95 sm:w-auto sm:px-10' onClick={() => navigate('/ai')}>Start creating now</button>
                <button className='w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 text-black transition hover:scale-102 hover:bg-gray-100 active:scale-95 sm:w-auto sm:px-10'>
                    Watch demo
                </button>
           
            </div>

            <div className='mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-center text-sm text-gray-600 sm:gap-4'>
                <img src={assets.user_group} alt="" className='h-8' />Trusted by 10K+ people 
            </div>

        </div>
    )
}

export default Hero
