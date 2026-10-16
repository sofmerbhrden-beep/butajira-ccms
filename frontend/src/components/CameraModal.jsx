import React, { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw, Smartphone } from "lucide-react";

export default function CameraModal({ onCapture, onClose, mode = "document" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState(mode === "photo" ? "user" : "environment");
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let localStream = null;
    async function startCamera() {
      setError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: facingMode,
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 }
          },
          audio: false,
        });
        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error(err);
        setError("Could not access selected camera. Please check device permissions.");
      }
    }
    startCamera();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const isPhoto = mode === "photo";
    const targetRatio = isPhoto ? 3 / 4 : 4 / 3;
    const videoRatio = video.videoWidth / video.videoHeight;
    
    let cropWidth, cropHeight, offsetX, offsetY;
    
    if (videoRatio > targetRatio) {
      cropHeight = video.videoHeight;
      cropWidth = cropHeight * targetRatio;
      offsetX = (video.videoWidth - cropWidth) / 2;
      offsetY = 0;
    } else {
      cropWidth = video.videoWidth;
      cropHeight = cropWidth / targetRatio;
      offsetX = 0;
      offsetY = (video.videoHeight - cropHeight) / 2;
    }
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(
      video,
      offsetX, offsetY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `captured_${mode}_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Camera size={20} className="text-[#3C8DBC]" /> 
            {mode === "photo" ? "Applicant Passport Photo Capture" : "Document Scanner Camera"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-300"
              title="Switch between Front and Back Camera"
            >
              <RefreshCw size={14} className="text-slate-600" />
              <span>{facingMode === "user" ? "Switch to Back" : "Switch to Front"}</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-slate-900 flex-1 relative flex flex-col items-center justify-center min-h-[380px]">
          {error ? (
            <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <X size={24} />
              </div>
              <p className="text-rose-400 font-bold text-sm mb-2">{error}</p>
              <button
                onClick={toggleCamera}
                className="mt-2 text-xs font-bold text-sky-400 underline cursor-pointer"
              >
                Try Switching Camera
              </button>
            </div>
          ) : (
            <div className={`relative rounded-xl overflow-hidden shadow-2xl bg-black w-full max-w-[340px] ${mode === "photo" ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : "scale-x-1"}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {mode === "photo" && facingMode === "user" ? (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <svg className="w-full h-full text-black/40" viewBox="0 0 300 400" preserveAspectRatio="none">
                    <defs>
                      <mask id="face-mask">
                        <rect width="300" height="400" fill="white" />
                        <ellipse cx="150" cy="160" rx="65" ry="90" fill="black" />
                        <path d="M 40 400 C 40 300 260 300 260 400" fill="black" />
                      </mask>
                    </defs>
                    <rect width="300" height="400" fill="currentColor" mask="url(#face-mask)" />
                  </svg>
                  
                  <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 300 400" preserveAspectRatio="none">
                    <ellipse cx="150" cy="160" rx="65" ry="90" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6" className="opacity-70" />
                    <path d="M 40 400 C 40 300 260 300 260 400" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6" className="opacity-70" />
                    <text x="150" y="35" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">Align Face inside Outline</text>
                  </svg>
                </div>
              ) : (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between items-center">
                  <div className="w-full h-full border-2 border-dashed border-sky-400/80 rounded-lg flex items-center justify-center bg-sky-950/10">
                    <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-xs shadow-md">
                      Position Document Within Frame
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Smartphone size={15} className="text-slate-400" />
            <span>Mode: {facingMode === "user" ? "Front (Selfie)" : "Back (Scanner)"}</span>
          </div>

          <button
            onClick={handleCapture}
            disabled={!!error || !stream}
            className="flex items-center justify-center gap-2 bg-[#3C8DBC] hover:bg-[#357ca5] text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
          >
            <Camera size={18} /> Capture Photo
          </button>
        </div>
      </div>
    </div>
  );
}
