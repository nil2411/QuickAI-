import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useUser ,SignIn} from '@clerk/react';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setsidebar] = useState(false);
  const {user} = useUser();
  return user?(
    <div className='flex flex-col items-start justify-start h-screen'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img src={assets.logo} alt="" onClick={() => navigate('/')} className='cursor-pointer w-32 sm:w-44' />
        {
          sidebar ? <X onClick={() => setsidebar(false)} className='w-6 h-6 text-gray sm:hidden' /> : <Menu className='w-6 h-6 text-gray sm:hidden' onClick={() => setsidebar(true)}/>
        }
      </nav>

      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setsidebar={setsidebar}></Sidebar>
        <div className='flex-1 bg-[#F4F7FB]'>

      <Outlet></Outlet>
        </div>

      </div>

    </div>

  ):(
    <div className='flex items-center justify-center h-screen'>
      <SignIn/>

    </div>
  )
  
};

export default Layout