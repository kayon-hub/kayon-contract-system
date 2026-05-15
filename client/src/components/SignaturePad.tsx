/**
 * SignaturePad - 手寫板電子簽名元件
 * 點擊簽名區域彈出手寫板 Modal，可手寫簽名後確認或清除
 */

import { useRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, RotateCcw } from "lucide-react";

interface SignaturePadProps {
  label: string;
  value: string | null; // base64 image data
  onChange: (data: string | null) => void;
}

export default function SignaturePad({ label, value, onChange }: SignaturePadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sigRef = useRef<SignatureCanvas | null>(null);

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

            {/* Canvas area */}
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

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
              >
                <RotateCcw size={14} />
                清除重簽
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-xs text-white rounded transition-colors font-medium"
                  style={{ backgroundColor: "#C9A84C" }}
                >
                  確認簽名
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
