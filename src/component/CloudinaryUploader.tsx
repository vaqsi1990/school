
"use client";

import { UploadButton } from "@/utils/uploadthing";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import ImageModal from "@/components/ImageModal";

type ImageUploadProps = {
  onChange: (urls: string[]) => void;
  value: string[];
};

const ImageUpload = ({ onChange, value }: ImageUploadProps): React.JSX.Element => {
  const [imageUrls, setImageUrls] = useState<string[]>(value || []);

  // Update local state when value prop changes
  useEffect(() => {
    setImageUrls(value || []);
  }, [value]);

  const handleUploadComplete = (res: { url: string }[]) => {
    const urls = res.map((file) => file.url);
    const newUrls = [...imageUrls, ...urls];
    setImageUrls(newUrls);
    onChange(newUrls); // ეს ატვირთული URL-ები გადავა form-ში
    if (urls.length === 1) {
      toast.success("1 სურათი წარმატებით ატვირთა!");
    } else {
      toast.success(`${urls.length} სურათი წარმატებით ატვირთა!`);
    }
  };

  return (
    <div className="bg-black text-white p-2 rounded">
      <UploadButton
        className="text-white font-bold py-1 px-3 rounded text-sm"
        endpoint="imageUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) => {
          toast.error(`შეცდომა! ${error.message}`);
        }}
        content={{
          button: "სურათების ატვირთვა",
          allowedContent: "ყველა ტიპის სურათი (PNG, JPG, GIF, WebP) - შეგიძლიათ რამდენიმე ატვირთოთ",
        }}
        appearance={{
          button: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm",
          allowedContent: "text-gray-400 text-xs mt-1",
        }}
      />

             {imageUrls.filter(url => url && url.trim() !== '').length > 0 ? (
         <div className="mt-2 space-y-1">
           <h2 className="text-sm font-semibold">ატვირთული სურათები ({imageUrls.filter(url => url && url.trim() !== '').length})</h2>
           <div className="grid grid-cols-3 gap-2">
             {imageUrls.filter(url => url && url.trim() !== '').map((url, index) => (
               <ImageModal  
                 key={index}
                 src={url}
                 alt={`ატვირთული ${index}`}
                 className="rounded border border-gray-500 w-[120px] h-[120px] object-cover"
               />
             ))}
           </div>
         </div>
       ) : (
         <p className="mt-1 text-gray-400 text-sm">სურათები ჯერ არ არის ატვირთული. შეგიძლიათ რამდენიმე სურათი ერთდროულად ატვირთოთ (Ctrl+Click ან Shift+Click).</p>
       )}
    </div>
  );
};

export default ImageUpload;
