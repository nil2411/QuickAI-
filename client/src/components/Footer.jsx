import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <footer className='w-full px-4 pt-8 text-gray-500 sm:px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex w-full flex-col justify-between gap-10 border-b border-gray-500/30 pb-6 md:flex-row'>
                <div className='md:max-w-96'>
                    <img src={assets.logo} alt='Logo' width={157} height={40} />

                    <p className='mt-6 text-sm'>
                        Quick.ai helps you create stunning content efficiently using the latest AI technology.
                        Write articles, generate images, and boost your creativity, all in one platform designed for creators.
                    </p>
                </div>

                <div className='flex flex-1 flex-wrap items-start gap-8 sm:gap-16 md:justify-end'>
                    <div>
                        <h2 className='mb-5 font-semibold text-gray-800'>Company</h2>
                        <ul className='space-y-2 text-sm'>
                            <li><a href='#'>Home</a></li>
                            <li><a href='#'>About us</a></li>
                            <li><a href='#'>Contact us</a></li>
                            <li><a href='#'>Privacy policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='mb-5 font-semibold text-gray-800'>Get in touch</h2>
                        <div className='space-y-2 text-sm'>
                            <p>+1-212-456-7890</p>
                            <a href='mailto:contact@quick.ai' className='hover:underline'>contact@quick.ai</a>
                        </div>
                    </div>
                </div>
            </div>

            <p className='pb-5 pt-4 text-center text-xs md:text-sm'>
                Copyright 2026 (c) <a href='https://quick.ai.com'>Quick.ai</a>. All Right Reserved.
            </p>
        </footer>
    )
}

export default Footer
