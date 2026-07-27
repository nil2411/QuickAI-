import { Sparkles, Image, Download } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";

const GenerateImages = () => {
  const imageStyles = [
    "Realistic",
    "Ghibli",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Portrait style",
  ];

  const [selectStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleDownload = async () => {
    if (!content) return;

    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "generated-image.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download image");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        toast.error("Please sign in to continue");
        return;
      }

      const prompt = `Generate a highly detailed and visually evocative image description based on the following prompt: "${input}". The image should be in a "${selectStyle}" style. Use descriptive language to specify the subject, setting, mood, and any notable artistic qualities.`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        {
          prompt,
          publish,
        },
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
        toast.success("Image generated!");
      } else {
        toast.error(data.message || "Failed to generate image");
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
  };

  return (
    <div className="flex h-full flex-col items-start gap-4 overflow-y-auto p-4 text-slate-700 sm:p-6 xl:flex-row">
      {/* Left Side */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-4 xl:max-w-lg"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-lg font-semibold sm:text-xl">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Describe your image</p>

        <textarea
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 h-40 resize-none"
          placeholder="Describe what you want in the image..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />

        <p className="mt-4 text-sm font-medium">Style</p>

        <div className="mt-3 flex flex-wrap gap-3">
          {imageStyles.map((style) => (
            <span
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-1 rounded-full border text-xs cursor-pointer transition ${
                selectStyle === style
                  ? "bg-green-50 text-green-700 border-green-500"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {style}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="sr-only peer"
            />

            <div className="w-9 h-5 rounded-full bg-gray-300 peer-checked:bg-green-500 transition"></div>

            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>

          <p className="text-sm">Make this image public</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 rounded-lg"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Image className="w-5 h-5" />
          )}

          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>

      {/* Right Side */}
      <div className="min-h-[32rem] w-full max-w-xl rounded-lg border border-gray-200 bg-white p-4 sm:min-h-[34rem] xl:max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <Image className="w-5 h-5 text-[#00AD25]" />
          <h1 className="text-lg font-semibold sm:text-xl">Generated Image</h1>
        </div>

        {!content ? (
          <div className="flex min-h-[26rem] items-center justify-center">
            <div className="text-center text-gray-400">
              <Image className="mx-auto w-12 h-12 mb-4" />
              <p className="px-3">Describe your image and click Generate Image.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img
              src={content}
              alt="Generated"
              className="max-w-full max-h-[450px] w-auto h-auto object-contain rounded-lg border"
            />
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages;
