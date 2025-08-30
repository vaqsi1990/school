
"use client";

import { UploadButton } from "@/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";
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
    alert("Files uploaded successfully!");
  };

  return (
    <div className="bg-black text-white p-4 rounded">
      <UploadButton
        className="text-white font-bold py-2 px-4 rounded"
        endpoint="imageUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />

      {imageUrls.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h2 className="text-lg font-semibold">Uploaded Images</h2>
          <div className="grid grid-cols-2 gap-4">
            {imageUrls.map((url, index) => (
              <Image  
                key={index}
                src={url}
                alt={`Uploaded ${index}`}
                className="rounded border border-gray-500"
                width={200}
                height={200}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-400">No images uploaded yet.</p>
      )}
    </div>
  );
};

export default ImageUpload;
