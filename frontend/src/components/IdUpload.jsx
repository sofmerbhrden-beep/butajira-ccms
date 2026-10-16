import { useEffect, useRef, useState } from "react";
import { RotateCw, AlertTriangle, CheckCircle2 } from "lucide-react";

async function getExifOrientation(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) return resolve(1);
      let offset = 2;
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) return resolve(1);
          const little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112)
              return resolve(view.getUint16(offset + i * 12 + 8, little));
          }
        } else if ((marker & 0xFF00) !== 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

async function analyseImage(file, orientation) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const W = 160, H = 100;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");


      ctx.save();
      if (orientation === 3) { ctx.translate(W, H); ctx.rotate(Math.PI); }
      else if (orientation === 6) { ctx.translate(W, 0); ctx.rotate(Math.PI / 2); }
      else if (orientation === 8) { ctx.translate(0, H); ctx.rotate(-Math.PI / 2); }
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();

      const { data } = ctx.getImageData(0, 0, W, H);
      let brightness = 0;
      let laplacian = 0;
      const pixels = W * H;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        brightness += gray;
      }
      brightness /= pixels;


      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = (y * W + x) * 4;
          const g = (px) => 0.299 * data[px] + 0.587 * data[px + 1] + 0.114 * data[px + 2];
          const lap = Math.abs(
            -g((y-1)*W*4+x*4) - g((y+1)*W*4+x*4) -
            g(y*W*4+(x-1)*4) - g(y*W*4+(x+1)*4) +
            4 * g(idx)
          );
          laplacian += lap;
        }
      }
      laplacian /= pixels;

      resolve({ brightness, sharpness: laplacian });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

async function rotateImage(file, degrees) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const swap = degrees === 90 || degrees === 270;
      const canvas = document.createElement("canvas");
      canvas.width  = swap ? img.height : img.width;
      canvas.height = swap ? img.width  : img.height;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: file.type || "image/png" }));
      }, file.type || "image/png", 1.0);
    };
    img.src = url;
  });
}

export default function IdUpload({ label, file, onChange, required }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [checking, setChecking] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); setWarnings([]); setRotation(0); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleFile(f) {
    if (!f) return;
    setChecking(true);
    setWarnings([]);
    setRotation(0);

    const orientation = await getExifOrientation(f);
    const analysis = await analyseImage(f, orientation);

    const w = [];
    if (analysis) {
      if (analysis.brightness < 40)  w.push("Image is too dark. Please retake in better lighting.");
      if (analysis.brightness > 230) w.push("Image is too bright / overexposed.");
      if (analysis.sharpness < 1.5)  w.push("Image appears blurry. Please retake with a steady hand.");
    }
    if (orientation === 6 || orientation === 8 || orientation === 3)
      w.push("Image appears rotated. Use the rotate button to fix it.");

    setWarnings(w);
    setChecking(false);
    onChange(f);
  }

  async function handleRotate() {
    if (!file) return;
    const rotated = await rotateImage(file, 90);
    setRotation((r) => (r + 90) % 360);

    const analysis = await analyseImage(rotated, 1);
    const w = [];
    if (analysis) {
      if (analysis.brightness < 40)  w.push("Image is too dark. Please retake in better lighting.");
      if (analysis.brightness > 230) w.push("Image is too bright / overexposed.");
      if (analysis.sharpness < 1.5)  w.push("Image appears blurry. Please retake with a steady hand.");
    }
    setWarnings(w);
    onChange(rotated);
  }

  const ok = file && warnings.length === 0 && !checking;

  return (
    <div>
      <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-gray-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !file && inputRef.current?.click()}
        className={`border border-dashed transition-colors ${
          file ? "border-gray-300 bg-paper-card cursor-default" : "border-gray-300 bg-paper-card hover:border-gray-400 cursor-pointer"
        }`}
      >
        {file && previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt=""
              style={{ imageRendering: "high-quality" }}
              className="w-auto max-w-full max-h-64 mx-auto object-contain bg-paper-card block p-1"
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-paper-card">
              <div className="flex items-center gap-2">
                {checking && <span className="font-mono text-[10px] text-gray-400">Checking…</span>}
                {!checking && ok && <CheckCircle2 size={14} className="text-emerald-500" />}
                {!checking && warnings.length > 0 && <AlertTriangle size={14} className="text-amber-500" />}
                <span className="font-sans text-[12px] text-gray-600 truncate max-w-[160px]">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="text-gray-400 hover:text-[#3C8DBC] transition-colors"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => { onChange(null); inputRef.current.value = ""; }}
                  className="font-mono text-[10px] uppercase text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 flex items-center gap-3">
            <p className="font-sans text-[12px] text-gray-400">Click to upload or drag & drop</p>
            <p className="font-mono text-[10px] text-gray-300">JPG, PNG</p>
          </div>
        )}
      </div>

{warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="flex items-center gap-1.5 font-sans text-[12px] text-amber-600">
              <AlertTriangle size={12} /> {w}
            </p>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
