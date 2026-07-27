import { Check, Copy, Edit, Sparkles } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong'

const WriteArticle = () => {
  const articlelength = [
    { length: 800, text: 'Short(500-800 words)' },
    { length: 1200, text: 'Medium(800-1200 words)' },
    { length: 1600, text: 'Long(1200+ words)' },
  ]

  const [selectedLength, setSelectedlength] = useState(articlelength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  const { getToken } = useAuth()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Article copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy article')
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    const topic = input.trim()
    if (!topic) {
      toast.error('Please enter a topic')
      return
    }

    try {
      setLoading(true)

      const token = await getToken()
      if (!token) {
        toast.error('Please sign in to continue')
        return
      }

      const prompt = `Write a detailed article on the topic: "${topic}". The article should be ${selectedLength.text.toLowerCase()} and well-structured with an engaging introduction, informative body, and a concise conclusion. Format the response in clean Markdown using a # title, ## section headings, and well-spaced paragraphs. Make sure the content is original, clear, and informative.`

      const { data } = await axios.post(
        '/api/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setContent(data.content)
        toast.success('Article generated!')
      } else {
        toast.error(data.message || 'Failed to generate article')
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex h-full flex-col items-start gap-4 overflow-y-auto p-4 text-slate-700 sm:p-6 lg:flex-row'>
      <form onSubmit={onSubmitHandler} className='w-full lg:w-96 shrink-0 p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7Aff]' />
          <h1 className='text-lg font-semibold sm:text-xl'>Article configuration</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Article Topic</p>
        <input
          type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='The future of artificial intelligence is... '
          required
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />

        <p className='mt-4 text-sm font-medium'>Article Length</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {articlelength.map((item, index) => (
            <span
              key={index}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-500 border-gray-300'
                }`}
              onClick={() => setSelectedlength(item)}
            >
              {item.text}
            </span>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-70'
        >
          {loading ? (
            <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin' />
          ) : (
            <Edit className='w-5' />
          )}
          Generate Article
        </button>
      </form>

      <div className='flex min-h-[32rem] w-full min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white p-4 sm:min-h-[34rem] lg:max-h-[calc(100vh-7rem)]'>
        <div className='flex items-center justify-between gap-3 shrink-0'>
          <div className='flex items-center gap-3'>
            <Edit className='w-5 h-5 text-[#4A7AFF]' />
            <h1 className='text-lg font-semibold sm:text-xl'>Generated Article</h1>
          </div>

          {content && (
            <button
              type="button"
              onClick={handleCopy}
              className='flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#4A7AFF] border border-gray-200 hover:border-blue-200 rounded-lg px-3 py-1.5 transition-colors'
            >
              {copied ? <Check className='w-3.5 h-3.5 text-green-600' /> : <Copy className='w-3.5 h-3.5' />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Edit className='w-9 h-9 ' />
              <p className='px-3 text-center'>Enter a topic and click &quot;Generate Article&quot; to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex-1 overflow-y-auto pr-1'>
            <article className='article-prose'>
              <Markdown>{content}</Markdown>
            </article>
          </div>
        )}
      </div>
    </div>
  )
}

export default WriteArticle
