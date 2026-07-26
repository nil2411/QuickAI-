import { FileText, Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  useEffect(() => {
    if (!input) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(input)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [input])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        toast.error("Please sign in to continue");
        return;
      }

      if (!input) {
        toast.error("Please upload a resume");
        return;
      }

      if (input.type !== "application/pdf" && !input.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF resume");
        return;
      }

      if (input.size > 5 * 1024 * 1024) {
        toast.error("Resume file size must be under 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post(
        "/api/ai/resume-review",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Resume reviewed!");
      } else {
        toast.error(data.message || "Failed to review resume");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6' style={{ color: '#1de9b6' }} />
          <h1 className='text-xl font-semibold '>Resume Review</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload Resume</p>
        <input
          type='file'
          accept='application/pdf,.pdf'
          className='w-full p-2 px-3 mt-2 outline-none text-sm text-gray-500 rounded-md border border-gray-300 file:text-sm file:font-semibold file:text-gray-700'
          required
          onChange={(e) => setInput(e.target.files[0] || null)}
        />

        {preview && input && (
          <iframe
            src={preview}
            title='Resume preview'
            className='mt-3 w-full h-48 rounded-md border border-gray-200'
          />
        )}

        <p className='mt-1 text-xs text-gray-500 font-light'>Supports PDF only (max 5MB)</p>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#19d3ae] to-[#009fd9] text-white px-4 py-3 mt-6 text-base rounded-xl cursor-pointer font-medium disabled:opacity-70"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <FileText className='w-5' />
          )}
          {loading ? "Reviewing..." : "Review Resume"}
        </button>
      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[36rem] h-[36rem]'>
        <div className='flex items-center gap-3 shrink-0'>
          <FileText className='w-5 h-5 text-[#1de9b6]'/>
          <h1 className='text-xl font-semibold'>Analysis Results</h1>
        </div>

        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400 text-center px-4'>
              <FileText className='w-9 h-9 '/>
              <p>Upload your resume and click &quot;Review Resume&quot; to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex-1 min-h-0 overflow-y-auto pr-1'>
            <article className='article-prose text-sm break-words'>
              <Markdown>{content}</Markdown>
            </article>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewResume
