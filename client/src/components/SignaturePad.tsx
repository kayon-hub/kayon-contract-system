/**
 * SignaturePad - 手寫板電子簽名元件 + 上傳簽名圖片
 * 支援手寫簽名或上傳簽名檔
 */

import { useRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, RotateCcw, Upload } from "lucide-react";

interface SignaturePadProps {
  label: string;
  value: string | null; // base64 image data
  onChange: (data: string | null) => void;
  allowUpload?: boolean; // 是否允許上傳圖片
}

export default function SignaturePad({ label, value, onChange, allowUpload = false }: SignaturePadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const sigRef = useRef<SignatureCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
  }, []);

  const handleConfirm = useCallback(() => {
    if (sigRef.current?.isEmpty()) {
      onChange(null);
    } else {
      const dataUrl = sigRef.current?.getTrimmedCanvas().toDataURL("image/png");
      onChange(dataUrl || null);
    }
    setIsOpen(false);
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange(dataUrl);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  return (
    <>
      {/* Signature display area */}
      <div className="mt-2">
        <p className="text-sm mb-1" style={{ color: "#1A1A1A" }}>
          簽名：
        </p>
        {value ? (
          <div className="relative group">
            <div
              className="border border-gray-200 rounded p-2 bg-white cursor-pointer hover:border-[#C9A84C] transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <img src={value} alt="簽名" className="h-14 object-contain" />
            </div>
            <button
              onClick={handleRemove}
              className="no-print absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="移除簽名"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="no-print border border-dashed border-gray-300 rounded px-4 py-3 text-xs text-gray-400 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors w-full text-left"
          >
            點擊此處進行電子簽名
          </button>
        )}
        {/* Print fallback when no signature */}
        {!value && (
          <div className="hidden print:block border-b border-gray-400 w-full h-8 mt-1"></div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg shadow-2xl w-[90vw] max-w-[500px] overflow-hidden"
            style={{ fontFamily: "Arial, 'Noto Sans TC', sans-serif" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                {label}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode tabs */}
            {allowUpload && (
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setMode("draw")}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    mode === "draw"
                      ? "bg-[#FFF8E1] text-[#C9A84C] border-b-2 border-[#C9A84C]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  手寫簽名
                </button>
                <button
                  onClick={() => setMode("upload")}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    mode === "upload"
                      ? "bg-[#FFF8E1] text-[#C9A84C] border-b-2 border-[#C9A84C]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  上傳簽名檔
                </button>
              </div>
            )}

            {/* Canvas area (Draw mode) */}
            {mode === "draw" && (
              <div className="p-5">
                <div className="border border-gray-200 rounded bg-gray-50">
                  <SignatureCanvas
                    ref={sigRef}
                    penColor="#1A1A1A"
                    canvasProps={{
                      width: 440,
                      height: 180,
                      className: "w-full h-[180px] cursor-crosshair",
                      style: { width: "100%", height: "180px" },
                    }}
                    minWidth={1.5}
                    maxWidth={3}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  請在上方區域使用滑鼠或觸控筆簽名
                </p>
              </div>
            )}

            {/* Upload area (Upload mode) */}
            {mode === "upload" && (
              <div className="p-5">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#C9A84C] hover:bg-[#FFF8E1]/30 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">點擊上傳簽名檔</p>
                  <p className="text-xs text-gray-500 mt-1">支援 PNG、JPG、GIF 等圖片格式</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              {mode === "draw" && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                >
                  <RotateCcw size={14} />
                  清除重簽
                </button>
              )}
              {mode === "upload" && <div />}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                {mode === "draw" && (
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-xs text-white rounded transition-colors font-medium"
                    style={{ backgroundColor: "#C9A84C" }}
                  >
                    確認簽名
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
