import { Scissors, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObjects = () => {
  const [input, setInput] = useState(null)
  const [objectText, setObjectText] = useState("")
  const [preview, setPreview] = useState(null)
  const previewUrlRef = useRef(null)
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreview(null)
  }

  const handleFileChange = (file) => {
    clearPreview()
    setInput(file)

    if (file) {
      const url = URL.createObjectURL(file)
      previewUrlRef.current = url
      setPreview(url)
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

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
        toast.error("Please upload an image");
        return;
      }

      const objectDesc = (typeof objectText === "string" ? objectText : "").trim();
      if (!objectDesc) {
        toast.error("Please describe the object to remove");
        return;
      }

      if (objectDesc.split(" ").length > 4) {
        toast.error("Please keep the object description short (max 4 words)");
        return;
      }

      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", objectDesc);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Object removed!");
      } else {
        toast.error(data.message || "Failed to remove object");
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
    <div className='flex h-full flex-col items-start gap-4 overflow-y-auto p-4 text-slate-700 sm:p-6 xl:flex-row'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl rounded-lg border border-gray-200 bg-white p-4 xl:max-w-lg'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#3B82F6]' />
          <h1 className='text-lg font-semibold sm:text-xl'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload image</p>
        <input
          type='file'
          accept="image/*"
          className='w-full p-2 px-3 mt-2 outline-none text-sm text-gray-500 rounded-md border border-gray-300 file:text-sm file:font-semibold file:text-gray-700'
          required
          onChange={(e) => handleFileChange(e.target.files[0] || null)}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 w-full max-h-48 object-contain rounded-md border border-gray-200"
          />
        )}

        <p className='mt-1 text-xs text-gray-500 font-light'>Supports JPG, PNG and other image formats</p>

        <p className='mt-6 text-sm font-medium'>Describe object to remove</p>
        <textarea
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 h-24 resize-none'
          placeholder='e.g. car in background, watch on wrist'
          required
          onChange={(e) => setObjectText(String(e.target.value))}
          value={typeof objectText === "string" ? objectText : ""}
          rows={4}
        />
        <p className='mt-1 text-xs text-gray-500 font-light'>Be specific about what you want to remove (max 4 words)</p>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#00C6FB] px-4 py-3 text-base font-medium text-white disabled:opacity-70"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Scissors className='w-5' />
          )}
          {loading ? "Removing..." : "Remove Object"}
        </button>
      </form>

      {/* right col */}
      <div className='flex min-h-80 w-full max-w-xl flex-col rounded-lg border border-gray-200 bg-white p-4 sm:min-h-[32rem] xl:h-[36rem] xl:max-w-lg'>
        <div className='flex items-center gap-3 shrink-0'>
          <Scissors className='w-5 h-5 text-[#3B82F6]'/>
          <h1 className='text-lg font-semibold sm:text-xl'>Processed images</h1>
        </div>

        {!content ? (
          <div className='flex flex-1 justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400 text-center px-4'>
              <Scissors className='w-9 h-9 '/>
              <p>Upload an image and describe what to remove</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 mt-3 flex justify-center items-center overflow-hidden">
            <img
              src={content}
              alt="Object removed"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveObjects
