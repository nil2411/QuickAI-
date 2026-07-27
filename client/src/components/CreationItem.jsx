import { useState } from 'react'
import Markdown from 'react-markdown'
import { ChevronDown, FileText, Hash, Image as ImageIcon, Sparkles } from 'lucide-react'

const typeConfig = {
  article: {
    label: 'Article',
    icon: FileText,
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'from-blue-500 to-cyan-500',
  },
  'blog-title': {
    label: 'Blog Title',
    icon: Hash,
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'from-purple-500 to-violet-500',
  },
  image: {
    label: 'Image',
    icon: ImageIcon,
    badge: 'bg-green-50 text-green-700 border-green-200',
    accent: 'from-emerald-500 to-green-500',
  },
  'resume-review': {
    label: 'Resume Review',
    icon: FileText,
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    accent: 'from-orange-500 to-amber-500',
  },
}

const getDisplayPrompt = (item) => {
  const prompt = item.prompt || ''

  const quotedMatch = prompt.match(/following prompt:\s*['"]([^'"]+)['"]/i)
  if (quotedMatch) return quotedMatch[1]

  const topicMatch = prompt.match(/topic:\s*['"]([^'"]+)['"]/i)
  if (topicMatch) return topicMatch[1]

  const aboutMatch = prompt.match(/about\s*['"]([^'"]+)['"]/i)
  if (aboutMatch) return `${aboutMatch[1]}${prompt.includes('category') ? '' : ''}`

  if (prompt.length > 80) {
    return `${prompt.slice(0, 77)}...`
  }

  return prompt
}

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[item.type] || {
    label: item.type,
    icon: Sparkles,
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
    accent: 'from-gray-500 to-slate-500',
  }
  const Icon = config.icon
  const displayPrompt = getDisplayPrompt(item)

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md'>
      <button
        type='button'
        onClick={() => setExpanded((prev) => !prev)}
        className='w-full text-left'
      >
        {item.type === 'image' ? (
          <div className='relative aspect-[4/3] overflow-hidden bg-gray-50'>
            <img
              src={item.content}
              alt={displayPrompt}
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3'>
              <p className='line-clamp-2 text-sm font-medium text-white'>{displayPrompt}</p>
            </div>
          </div>
        ) : (
          <div className={`bg-gradient-to-br ${config.accent} p-4 text-white`}>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <div className='mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium'>
                  <Icon className='h-3.5 w-3.5' />
                  {config.label}
                </div>
                <p className='line-clamp-2 text-sm font-medium'>{displayPrompt}</p>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        )}

        <div className='flex items-center justify-between gap-3 p-4'>
          <div className='min-w-0'>
            {item.type === 'image' && (
              <p className='line-clamp-1 text-sm font-medium text-slate-800'>{displayPrompt}</p>
            )}
            <p className='text-xs text-gray-500'>
              {new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config.badge}`}>
              {config.label}
            </span>
            {item.type === 'image' && (
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className='border-t border-gray-100 p-4'>
          {item.type === 'image' ? (
            <img
              src={item.content}
              alt={displayPrompt}
              className='mx-auto max-h-96 w-full max-w-md rounded-lg object-contain'
            />
          ) : (
            <div className='max-h-96 overflow-y-auto text-sm text-slate-700'>
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
