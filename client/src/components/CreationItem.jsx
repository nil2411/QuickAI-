import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { FileText, Hash, Image as ImageIcon, Sparkles, X } from 'lucide-react'

const typeConfig = {
  article: {
    label: 'Article',
    icon: FileText,
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'from-blue-500 to-cyan-500',
    previewBg: 'bg-blue-50/40',
  },
  'blog-title': {
    label: 'Blog Title',
    icon: Hash,
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'from-purple-500 to-violet-500',
    previewBg: 'bg-purple-50/40',
  },
  image: {
    label: 'Image',
    icon: ImageIcon,
    badge: 'bg-green-50 text-green-700 border-green-200',
    accent: 'from-emerald-500 to-green-500',
    previewBg: 'bg-green-50/40',
  },
  'resume-review': {
    label: 'Resume Review',
    icon: FileText,
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    accent: 'from-orange-500 to-amber-500',
    previewBg: 'bg-orange-50/40',
  },
}

const getDisplayPrompt = (item) => {
  const prompt = item.prompt || ''

  const quotedMatch = prompt.match(/following prompt:\s*['"]([^'"]+)['"]/i)
  if (quotedMatch) return quotedMatch[1]

  const topicMatch = prompt.match(/topic:\s*['"]([^'"]+)['"]/i)
  if (topicMatch) return topicMatch[1]

  const aboutMatch = prompt.match(/about\s*['"]([^'"]+)['"]/i)
  if (aboutMatch) return aboutMatch[1]

  if (prompt.length > 80) {
    return `${prompt.slice(0, 77)}...`
  }

  return prompt
}

const stripMarkdown = (content = '') =>
  content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()

const getPreviewLines = (content = '', maxLines = 4) => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => stripMarkdown(line))
    .filter(Boolean)

  return lines.slice(0, maxLines)
}

const CreationItem = ({ item }) => {
  const [open, setOpen] = useState(false)
  const config = typeConfig[item.type] || {
    label: item.type,
    icon: Sparkles,
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
    accent: 'from-gray-500 to-slate-500',
    previewBg: 'bg-gray-50/40',
  }
  const Icon = config.icon
  const displayPrompt = getDisplayPrompt(item)
  const previewLines = getPreviewLines(item.content)
  const previewText = stripMarkdown(item.content)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <>
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md'>
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='w-full text-left'
        >
          {item.type === 'image' ? (
            <div className='relative aspect-[4/3] overflow-hidden bg-gray-50'>
              <img
                src={item.content}
                alt={displayPrompt}
                className='h-full w-full object-cover transition duration-300 hover:scale-105'
              />
              <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3'>
                <p className='line-clamp-2 text-sm font-medium text-white'>{displayPrompt}</p>
              </div>
            </div>
          ) : (
            <>
              <div className={`bg-gradient-to-br ${config.accent} px-4 py-3 text-white`}>
                <div className='min-w-0'>
                  <div className='mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium'>
                    <Icon className='h-3.5 w-3.5' />
                    {config.label}
                  </div>
                  <p className='line-clamp-1 text-sm font-semibold'>{displayPrompt}</p>
                </div>
              </div>

              <div className={`min-h-[7.5rem] px-4 py-3 ${config.previewBg}`}>
                {item.type === 'blog-title' && previewLines.length > 0 ? (
                  <ul className='space-y-1.5 text-sm text-slate-600'>
                    {previewLines.map((line, index) => (
                      <li key={index} className='line-clamp-1 flex items-start gap-2'>
                        <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400' />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='line-clamp-5 text-sm leading-6 text-slate-600'>
                    {previewText || 'No preview available'}
                  </p>
                )}
              </div>
            </>
          )}

          <div className='flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3'>
            <p className='text-xs text-gray-500'>
              {new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config.badge}`}>
              {config.label}
            </span>
          </div>
        </button>
      </div>

      {open && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
          onClick={() => setOpen(false)}
        >
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />

          <div
            className='relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl'
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`bg-gradient-to-br ${config.accent} px-5 py-4 text-white`}>
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <div className='mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium'>
                    <Icon className='h-3.5 w-3.5' />
                    {config.label}
                  </div>
                  <h2 className='text-lg font-semibold'>{displayPrompt}</h2>
                  <p className='mt-1 text-sm text-white/80'>
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  className='rounded-full bg-white/20 p-2 transition hover:bg-white/30'
                  aria-label='Close'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-5'>
              {item.type === 'image' ? (
                <img
                  src={item.content}
                  alt={displayPrompt}
                  className='mx-auto max-h-[70vh] w-full rounded-lg object-contain'
                />
              ) : (
                <div className='text-sm text-slate-700'>
                  <div className='reset-tw'>
                    <Markdown>{item.content}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CreationItem
