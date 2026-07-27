import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <div className='fixed left-0 top-0 z-50 flex w-full items-center justify-between px-4 py-3 backdrop-blur-2xl sm:px-20 xl:px-32'>
      <img
        src={assets.logo}
        alt=""
        className='w-28 cursor-pointer sm:w-44'
        onClick={() => navigate('/')}
      />

      <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className='cursor-pointer whitespace-nowrap px-2 py-2.5 text-sm text-slate-700 sm:px-4'>Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className='flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm text-white sm:px-8 md:px-10'>Get Started</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </div>
  )
}

export default Navbar
