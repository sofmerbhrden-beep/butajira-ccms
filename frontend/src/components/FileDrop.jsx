import { useRef, useState } from "react";
import { Upload, CheckCircle2, Trash2, Camera } from "lucide-react";
import CameraModal from "./CameraModal.jsx";

export default function FileDrop({
  label,
  required,
  accept,
  hint,
  file,
  onChange,
  allowCamera = true,
}) {
  const inputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  function handleFiles(files) {
    if (files && files[0]) onChange(files[0]);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <label className="text-xs font-extrabold uppercase tracking-wider text-gray-900 shrink-0">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {hint && (
            <span className="text-[11px] font-medium text-gray-400 truncate">
              ({hint})
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {file && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-lg shadow-xs">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-900 truncate max-w-[180px]">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer ml-1"
                title="Remove"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-[#3C8DBC] hover:bg-[#357ca5] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md shadow-slate-900/25 hover:shadow-lg active:scale-[0.97] transition-all cursor-pointer border border-sky-600/30 shrink-0 whitespace-nowrap min-w-[110px]"
            >
              <Upload size={14} className="stroke-[2.5] shrink-0" />
              <span>{file ? "Change File" : "Browse"}</span>
            </button>
            
            {allowCamera && (
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md shadow-slate-900/25 hover:shadow-lg active:scale-[0.97] transition-all cursor-pointer border border-slate-700/30 shrink-0 whitespace-nowrap min-w-[110px]"
              >
                <Camera size={14} className="stroke-[2.5] shrink-0" />
                <span>{file ? "Retake" : "Take Photo"}</span>
              </button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        
      </div>

      {showCamera && (
        <CameraModal
          mode={label && label.toLowerCase().includes("photo") ? "photo" : "document"}
          onClose={() => setShowCamera(false)}
          onCapture={(capturedFile) => {
            onChange(capturedFile);
            setShowCamera(false);
          }}
        />
      )}
    </div>
  );
}
