import { useUser, Show, useClerk } from '@clerk/react'
import { Eraser, Hash, House, SquarePen, Image, Scissors, FileText, Users, LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
    { to: '/ai', label: 'Dashboard', Icon: House },
    { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
    { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
    { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
    { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
    { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
    { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
    { to: '/ai/community', label: 'Community', Icon: Users },
]

const SidebarContent = ({ user, signOut, openUserProfile, onNavigate, showCloseButton = false }) => (
    <>
        <div className='min-h-0 w-full flex-1 overflow-y-auto px-4 py-5'>
            {showCloseButton && (
                <div className='mb-3 flex justify-end sm:hidden'>
                    <button
                        type='button'
                        aria-label='Close sidebar'
                        className='rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700'
                        onClick={onNavigate}
                    >
                        <X className='h-5 w-5' />
                    </button>
                </div>
            )}

            <img src={user?.imageUrl} alt='user avatar' className='mx-auto h-12 w-12 rounded-full object-cover' />
            <h1 className='mt-2 truncate px-4 text-center text-sm font-medium text-slate-800'>{user?.fullName}</h1>

            <div className='mt-5 space-y-1 text-sm font-medium text-gray-600'>
                {navItems.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/ai'}
                        onClick={onNavigate}
                        className={({ isActive }) => `flex items-center gap-3 rounded-md px-3.5 py-2.5 transition-colors ${isActive ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white' : 'hover:bg-gray-100'}`}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                                <span className='truncate'>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>

        <div className='w-full border-t border-gray-200 p-4'>
            <div className='flex items-center justify-between gap-3'>
                <button type='button' className='flex min-w-0 flex-1 items-center gap-2 text-left' onClick={openUserProfile}>
                    <img src={user?.imageUrl} alt='' className='h-8 w-8 shrink-0 rounded-full object-cover' />
                    <div className='min-w-0'>
                        <h1 className='truncate text-sm font-medium'>{user?.fullName}</h1>
                        <p className='text-xs text-gray-500'>
                            <Show when={{ plan: 'premium' }} fallback='Free'>Premium</Show>
                            Plan
                        </p>
                    </div>
                </button>

                <button type='button' aria-label='Sign out' onClick={() => signOut()} className='rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700'>
                    <LogOut className='h-5 w-5' />
                </button>
            </div>
        </div>
    </>
)

const Sidebar = ({ sidebar, setsidebar }) => {
    const { user } = useUser()
    const { signOut, openUserProfile } = useClerk()
    const closeSidebar = () => setsidebar(false)

    return (
        <>
            <aside className='hidden h-full w-60 shrink-0 flex-col justify-between border-r border-gray-200 bg-white sm:flex'>
                <SidebarContent
                    user={user}
                    signOut={signOut}
                    openUserProfile={openUserProfile}
                    onNavigate={closeSidebar}
                />
            </aside>

            {sidebar && (
                <div className='fixed inset-x-0 bottom-0 top-14 z-40 sm:hidden'>
                    <button
                        type='button'
                        aria-label='Close sidebar overlay'
                        className='absolute inset-0 bg-slate-900/35'
                        onClick={closeSidebar}
                    />

                    <aside className='absolute bottom-0 left-0 top-0 flex w-72 max-w-[85vw] flex-col justify-between border-r border-gray-200 bg-white shadow-2xl'>
                        <SidebarContent
                            user={user}
                            signOut={signOut}
                            openUserProfile={openUserProfile}
                            onNavigate={closeSidebar}
                            showCloseButton
                        />
                    </aside>
                </div>
            )}
        </>
    )
}

export default Sidebar
