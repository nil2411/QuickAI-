import { Hash, Sparkles, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong'

const normalizeContent = (value) => {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map((item) => String(item)).join('\n').trim()
  return ''
}


const BlogTitles = () => {
  const blogCategories = [
    'General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'
  ]
  const [selectCategory, setSelectedCategory] = useState('General')

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { getToken } = useAuth()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Titles copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy titles')
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
      setErrorMessage('')

      const token = await getToken()
      if (!token) {
        const message = 'Please sign in to continue'
        setErrorMessage(message)
        toast.error(message)
        return
      }

      const prompt = `Generate 10 creative and catchy blog post titles about "${topic}" in the "${selectCategory}" category. Make sure each title is unique, engaging, and relevant to the topic. List only the titles in Markdown format as a simple numbered list.`
 

      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt, topic, category: selectCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const normalizedContent = normalizeContent(data?.content)

      if (data.success && normalizedContent) {
        setContent(normalizedContent)
        toast.success(data.fallback ? 'Showing fallback titles' : 'Titles generated!')
      } else {
        const message = data?.message || 'No titles were returned. Please try again.'
        setContent('')
        setErrorMessage(message)
        toast.error(message)
      }
    } catch (error) {
      const message = getErrorMessage(error)
      setContent('')
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='flex h-full flex-col items-start gap-4 overflow-y-auto p-4 text-slate-700 sm:p-6 lg:flex-row'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full lg:w-96 shrink-0 p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-lg font-semibold sm:text-xl'>Title configuration</h1>

        </div>
        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The future of artificial intelligence is... ' required onChange={(e) => setInput(e.target.value)} value={input} />

        <p className='mt-4 text-sm font-medium'>Category</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {blogCategories.map((item) => (
            <span
              key={item}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectCategory === item
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-500 border-gray-300'
              }`}
              onClick={() => setSelectedCategory(item)}
            >
              {item}
            </span>
          ))}
        </div>
   
        <br />
        <button
          type="submit"
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-70'
        >
          {loading ? (
            <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin' />
          ) : (
            <Hash className='w-5' />
          )}
          Generate Titles
        </button>


      </form>

      {/* right col */}
      <div className='flex min-h-80 w-full min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white p-4 sm:min-h-96 lg:max-h-[calc(100vh-7rem)]'>
        <div className='flex items-center justify-between gap-3 shrink-0'>
          <div className='flex items-center gap-3'>
            <Hash className='w-5 h-5 text-[#8E37EB]'/>
            <h1 className='text-lg font-semibold sm:text-xl'>Generated Titles</h1>
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
        {!content ?  (<div className='flex flex-1 justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
          <Hash className='w-9 h-9 '/>
          {errorMessage ? (
            <p className='max-w-sm text-center text-red-500'>{errorMessage}</p>
          ) : (
            <p className='px-3 text-center'>Enter a topic and click &quot;Generate Titles&quot; to get started</p>
          )}


          </div>

        </div>)
        :
        (
        <div className='mt-4 flex-1 overflow-y-auto pr-1'>
          <article className='article-prose'>
            <Markdown>{content}</Markdown>
          </article>
        </div>
   
        )

}
       
      </div>
    </div>
  )
}

export default BlogTitles
