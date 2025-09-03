
"use client";

import { UploadButton } from "@/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

type ImageUploadProps = {
  onChange: (urls: string[]) => void;
  value: string[];
};

const ImageUpload = ({ onChange, value }: ImageUploadProps): React.JSX.Element => {
  const [imageUrls, setImageUrls] = useState<string[]>(value || []);

  const handleUploadComplete = (res: { url: string }[]) => {
    const urls = res.map((file) => file.url);
    const newUrls = [...imageUrls, ...urls];
    setImageUrls(newUrls);
    onChange(newUrls); // ეს ატვირთული URL-ები გადავა form-ში
    toast.success("ფაილები წარმატებით ატვირთა!");
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
      />

             {imageUrls.filter(url => url && url.trim() !== '').length > 0 ? (
         <div className="mt-2 space-y-1">
           <h2 className="text-sm font-semibold">ატვირთული სურათები</h2>
           <div className="grid grid-cols-3 gap-2">
             {imageUrls.filter(url => url && url.trim() !== '').map((url, index) => (
               <Image  
                 key={index}
                 src={url}
                 alt={`ატვირთული ${index}`}
                 className="rounded border border-gray-500"
                 width={120}
                 height={120}
               />
             ))}
           </div>
         </div>
       ) : (
         <p className="mt-1 text-gray-400 text-sm">სურათები ჯერ არ არის ატვირთული.</p>
       )}
    </div>
  );
};

export default ImageUpload;
