import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";

interface PassportUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

/**
 * Two-step upload: ask the backend for a signed Cloudinary token (the API
 * secret never reaches the browser), then upload directly to Cloudinary
 * from here. The backend never sees the image bytes.
 */
export function PassportUpload({ value, onChange }: PassportUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large — please choose one under 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const { data: sig } = await api.get("/uploads/cloudinary-signature");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Upload failed");

      onChange(uploadData.secure_url);
      toast.success("Photo uploaded.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't upload the photo. Please try again."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">Passport photograph</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Passport preview" className="h-28 w-28 rounded-xl object-cover border border-navy-100" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1 text-white shadow-sm"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-navy-200 text-ink-400 transition-colors hover:border-action-400 hover:text-action-500 disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span className="text-xs">Add photo</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
