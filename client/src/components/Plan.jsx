import { PricingTable } from '@clerk/react'

const Plan = () => {
    return (
        <div className='z-20 mx-auto my-16 max-w-2xl px-4 sm:my-24 sm:px-6'>
            <div className='text-center'>
                <h2 className='text-3xl font-semibold text-slate-700 sm:text-[42px]'>Choose Your Plan</h2>

                <p className='text-gray-500 max-w-lg mx-auto'>Start your free and scale up as you grow. Find the perfect plan for your content creation needs</p>



            </div>
            <div className='mt-8 overflow-x-auto sm:mt-14'>
            <PricingTable /> 
            </div>

        </div>
    )
}

export default Plan
