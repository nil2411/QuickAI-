import { Eraser, Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";

const RemoveBackground = () => {
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
        toast.error("Please upload an image");
        return;
      }

      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(data);

      if (data.success) {
        // Change this if your backend returns a different structure
        setContent(data.content);
        toast.success("Background removed!");
      } else {
        toast.error(data.message || "Failed to remove background");
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
          <Sparkles className='w-6 text-[#FF9800]' />

          <h1 className='text-xl font-semibold '>Background Removal</h1>

        </div>
        <p className='mt-6 text-sm font-medium'>Upload image</p>
        <input
          type='file'
          accept="image/*"
          className='w-full p-2 px-3 mt-2 outline-none text-sm text-gray-500 rounded-md border border-gray-300 file:text-sm file:font-semibold file:text-gray-700'
          required
          onChange={(e) => setInput(e.target.files[0] || null)}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 w-full max-h-48 object-contain rounded-md border border-gray-200"
          />
        )}

        <p className='mt-1 text-xs font-small text-gray-500 font-light'>Supports JPG,PNG and other image formats</p>
        {/* <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
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
        </div> */}

        <br />
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#FFB75E] to-[#FF5736] text-white px-4 py-3 mt-6 text-base rounded-xl cursor-pointer font-medium">

        {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Eraser className="w-5 h-5" />
          )}

          {loading ? "Removing..." : "Remove Background"}
        </button>


      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[36rem] h-[36rem]'>
        <div className='flex items-center gap-3 shrink-0'>
          <Eraser className='w-5 h-5 text-[#FF9800]' />

          <h1 className='text-xl font-semibold'>Processed images</h1>

        </div>
        {!content ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-gray-400">
              <Eraser className="mx-auto w-12 h-12 mb-4" />
              <p>Upload an image and click "Remove Background" to get started</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 mt-3 flex justify-center items-center overflow-hidden">
            <img
              src={content}
              alt="Removed Background"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground