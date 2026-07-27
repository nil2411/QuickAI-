import { useState } from 'react'
import { assets } from '../assets/assets'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useUser, SignIn } from '@clerk/react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='flex h-screen flex-col overflow-hidden'>
      <nav className='z-50 flex h-14 min-h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8'>
        <img
          src={assets.logo}
          alt=''
          onClick={() => navigate('/')}
          className='w-28 cursor-pointer sm:w-36'
        />

        <button
          type='button'
          aria-label={sidebar ? 'Close menu' : 'Open menu'}
          className='-mr-2 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden'
          onClick={() => setSidebar((open) => !open)}
        >
          {sidebar ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
        </button>
      </nav>

      <div className='relative flex min-h-0 w-full flex-1 overflow-hidden'>
        <Sidebar sidebar={sidebar} setsidebar={setSidebar} />
        <main className='min-w-0 flex-1 overflow-hidden bg-[#F4F7FB]'>
          <Outlet />
        </main>
      </div>
    </div>
  ) : (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <SignIn />
    </div>
  )
}

export default Layout
