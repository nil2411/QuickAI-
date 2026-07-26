import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <div className='fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32'>
      <img
        src={assets.logo}
        alt=""
        className='w-32 sm:w-44 cursor-pointer'
        onClick={() => navigate('/')}
      />

      <div className='flex items-center gap-3'>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className='text-sm cursor-pointer text-white px-4 py-2.5'>Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className='flex gap-2 rounded-full items-center text-sm cursor-pointer bg-primary text-white px-10 py-2.5'>Get Started</button>
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