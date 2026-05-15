/**
 * Podcast 製作報價單 - Neo-Document Style
 * Design: Black-gold color scheme, A4 paper simulation, professional & minimal
 * Colors: #1A1A1A (black), #C9A84C (gold), #888888 (gray), #FFFFFF (white)
 */

import { useState, useCallback, useRef } from "react";
import { Plus, Trash2, Printer, FileDown } from "lucide-react";
import { toast } from "sonner";

interface QuoteItem {
  id: string;
  name: string;
  content: string;
  unitPrice: number | string;
  quantity: number | string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function Home() {
  const documentRef = useRef<HTMLDivElement>(null);

  // Editable fields state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quoteDate, setQuoteDate] = useState("");
  const [projectName, setProjectName] = useState("Podcast 節目製作");

  // Quote items
  const [items, setItems] = useState<QuoteItem[]>([
    { id: generateId(), name: "", content: "", unitPrice: "", quantity: "" },
    { id: generateId(), name: "", content: "", unitPrice: "", quantity: "" },
    { id: generateId(), name: "", content: "", unitPrice: "", quantity: "" },
    { id: generateId(), name: "", content: "", unitPrice: "", quantity: "" },
  ]);

  const addRow = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), name: "", content: "", unitPrice: "", quantity: "" },
    ]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) {
        toast.error("至少需要保留一列");
        return prev;
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const updateItem = useCallback(
    (id: string, field: keyof QuoteItem, value: string) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          if (field === "unitPrice" || field === "quantity") {
            // Allow empty or numeric
            const cleaned = value.replace(/[^0-9.]/g, "");
            return { ...item, [field]: cleaned };
          }
          return { ...item, [field]: value };
        })
      );
    },
    []
  );

  const getSubtotal = (item: QuoteItem): number => {
    const price = typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
    const qty = typeof item.quantity === "string" ? parseFloat(item.quantity) || 0 : item.quantity;
    return price * qty;
  };

  const total = items.reduce((sum, item) => sum + getSubtotal(item), 0);

  const formatNumber = (num: number): string => {
    if (num === 0) return "";
    return num.toLocaleString("zh-TW");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Use print dialog as PDF export (Save as PDF option)
    toast.info("請在列印對話框中選擇「另存為 PDF」");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="page-background min-h-screen bg-[#1a1a1a] py-8 px-4 flex flex-col items-center">
      {/* Toolbar */}
      <div className="no-print w-full max-w-[800px] mb-4 flex justify-end gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#C9A84C] border border-[#C9A84C]/30 rounded hover:bg-[#C9A84C] hover:text-white transition-all duration-200 text-sm font-medium"
        >
          <Printer size={16} />
          列印
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded hover:bg-[#b8963f] transition-all duration-200 text-sm font-medium"
        >
          <FileDown size={16} />
          匯出 PDF
        </button>
      </div>

      {/* Document */}
      <div
        ref={documentRef}
        className="print-document bg-white w-full max-w-[800px] shadow-2xl shadow-black/50 px-12 py-10"
        style={{ fontFamily: "Arial, 'Noto Sans TC', sans-serif" }}
      >
        {/* Header / Title */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ color: "#1A1A1A", fontSize: "24px" }}
          >
            Podcast製作報價單
          </h1>
          <p className="text-sm mt-1" style={{ color: "#888888", fontSize: "12px" }}>
            Quotation
          </p>
        </div>

        {/* Info Section - Two columns */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Left: Customer Info */}
          <div>
            <h3
              className="text-xs font-bold mb-2 uppercase tracking-wider"
              style={{ color: "#C9A84C", fontSize: "11px" }}
            >
              客戶資訊 &nbsp;Customer Info
            </h3>
            <div className="space-y-2">
              <EditableField
                value={customerName}
                onChange={setCustomerName}
                placeholder="客戶名稱"
                className="font-medium text-sm"
              />
              <div className="flex items-center gap-1">
                <span className="text-sm" style={{ color: "#1A1A1A" }}>
                  聯絡電話：
                </span>
                <EditableField
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  placeholder="請輸入電話"
                  className="text-sm flex-1"
                />
              </div>
            </div>
          </div>

          {/* Right: Quotation Info */}
          <div>
            <h3
              className="text-xs font-bold mb-2 uppercase tracking-wider"
              style={{ color: "#C9A84C", fontSize: "11px" }}
            >
              報價資訊 &nbsp;Quotation Info
            </h3>
            <div className="flex items-center gap-1">
              <span className="text-sm" style={{ color: "#888888" }}>
                報價日期：
              </span>
              <EditableField
                value={quoteDate}
                onChange={setQuoteDate}
                placeholder="YYYY / MM / DD"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-6">
          <h3
            className="text-xs font-bold mb-2 uppercase tracking-wider"
            style={{ color: "#C9A84C", fontSize: "11px" }}
          >
            專案資訊 &nbsp;Project
          </h3>
          <div
            className="px-3 py-2 inline-block"
            style={{ backgroundColor: "#FFF8E1" }}
          >
            <EditableField
              value={projectName}
              onChange={setProjectName}
              placeholder="專案名稱"
              className="font-bold text-base"
              style={{ color: "#1A1A1A" }}
            />
          </div>
        </div>

        {/* Quote Table */}
        <div className="mb-1">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#1A1A1A" }}>
                <th className="text-white text-xs font-bold py-2 px-3 text-center w-[18%]">
                  項目
                </th>
                <th className="text-white text-xs font-bold py-2 px-3 text-center w-[32%]">
                  內容
                </th>
                <th className="text-white text-xs font-bold py-2 px-3 text-center w-[18%]">
                  單價 (NTD)
                </th>
                <th className="text-white text-xs font-bold py-2 px-3 text-center w-[12%]">
                  數量
                </th>
                <th className="text-white text-xs font-bold py-2 px-3 text-center w-[18%]">
                  小計 (NTD)
                </th>
                <th className="no-print w-[2%]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, "name", e.target.value)
                      }
                      placeholder="—"
                      className="w-full text-center text-sm bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none transition-colors py-1"
                      style={{ color: "#1A1A1A" }}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) =>
                        updateItem(item.id, "content", e.target.value)
                      }
                      placeholder="—"
                      className="w-full text-center text-sm bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none transition-colors py-1"
                      style={{ color: "#1A1A1A" }}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, "unitPrice", e.target.value)
                      }
                      placeholder="0"
                      className="w-full text-center text-sm bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none transition-colors py-1"
                      style={{ color: "#1A1A1A" }}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                      placeholder="0"
                      className="w-full text-center text-sm bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none transition-colors py-1"
                      style={{ color: "#1A1A1A" }}
                    />
                  </td>
                  <td className="py-2 px-3 text-center text-sm font-medium" style={{ color: "#1A1A1A" }}>
                    {formatNumber(getSubtotal(item))}
                  </td>
                  <td className="no-print py-2 px-1">
                    <button
                      onClick={() => removeRow(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                      title="刪除此列"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row button */}
        <div className="no-print mb-4">
          <button
            onClick={addRow}
            className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#b8963f] transition-colors py-1"
          >
            <Plus size={14} />
            新增項目
          </button>
        </div>

        {/* Total Row */}
        <div
          className="flex items-center justify-between px-4 py-3 mb-8"
          style={{ backgroundColor: "#C9A84C" }}
        >
          <span className="text-white font-bold text-sm tracking-wide">
            總計 &nbsp;Total
          </span>
          <span className="text-white font-bold text-base">
            NTD {total.toLocaleString("zh-TW")}
          </span>
        </div>

        {/* Notes & Payment - Two columns */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-8 mb-8">
          {/* Left: Notes */}
          <div>
            <h3
              className="text-xs font-bold mb-3 uppercase tracking-wider"
              style={{ color: "#C9A84C", fontSize: "11px" }}
            >
              備註 &nbsp;Notes
            </h3>
            <div className="space-y-1.5 text-xs leading-relaxed" style={{ color: "#444444" }}>
              <p>一、製作流程｜確認需求 → 簽約 → 訂金60% → 製作 → 初版確認 → 修改 → 定稿 → 尾款 → 交付</p>
              <p>二、節目企劃提供一版，附2-3種風格方向供選擇，選定後不可跨版本混搭。</p>
              <p>三、共兩次免費修改，每次間隔約4個工作天；第三次加收NT$500，第四次加收NT$1,000。</p>
              <p>四、封面設計以靜態圖片素材為主，動態影像素材需另外報價。</p>
              <p>五、簽約後3天內且製作未啟動可申請取消，退還訂金50%；製作啟動後取消訂金不退。</p>
              <p>六、成品交付後如有問題，需於3個工作天內（週一至週五，不含國定假日）提出，逾期視為驗收完成。</p>
              <p>七、客戶提供之素材若涉及版權問題，責任由提供方自負。</p>
              <p>八、版權歸客戶所有，承接方保有作品集展示權；如需公開發佈請自行取得相關授權。</p>
              <p>九、付款｜簽約後兩個工作日內轉帳訂金方啟動製作，尾款於最終檔案交付前完成支付。</p>
              <p>十、製作時程｜訂金確認後約21個工作天完成，急件需提前告知。</p>
            </div>
          </div>

          {/* Right: Payment & Contractor */}
          <div>
            <h3
              className="text-xs font-bold mb-3 uppercase tracking-wider"
              style={{ color: "#C9A84C", fontSize: "11px" }}
            >
              匯款資訊 &nbsp;Payment
            </h3>
            <div className="space-y-1 text-xs" style={{ color: "#444444" }}>
              <p>銀行｜國泰世華銀行 (013) 竹城分行</p>
              <p>戶名｜洪曜騏</p>
              <p>帳號｜2105-0630-7630</p>
            </div>

            <h3
              className="text-xs font-bold mt-5 mb-3 uppercase tracking-wider"
              style={{ color: "#C9A84C", fontSize: "11px" }}
            >
              承接方資訊 &nbsp;Contractor Info
            </h3>
            <div className="space-y-1 text-xs" style={{ color: "#444444" }}>
              <p>姓名｜洪曜騏</p>
              <p>電話｜0978-006-771</p>
              <p>Email｜kayon@karbonxgaiaentertainment.com</p>
              <p>地址｜新竹市東大路四段106號3F</p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-xs mb-5" style={{ color: "#888888" }}>
            本報價單確認即視為同意以上製作與使用條款
          </p>
          <div className="grid grid-cols-2 gap-8">
            {/* Customer Signature */}
            <div>
              <h3
                className="text-xs font-bold mb-4 uppercase tracking-wider"
                style={{ color: "#C9A84C", fontSize: "11px" }}
              >
                客戶簽署 &nbsp;Customer Signature
              </h3>
              <div className="space-y-4 text-sm" style={{ color: "#1A1A1A" }}>
                <p>簽名：___________________________</p>
                <p>日期：_______ / _______ / _______</p>
              </div>
            </div>

            {/* Authorized Signature */}
            <div>
              <h3
                className="text-xs font-bold mb-4 uppercase tracking-wider"
                style={{ color: "#C9A84C", fontSize: "11px" }}
              >
                KAYON 簽署 &nbsp;Authorized Signature
              </h3>
              <div className="space-y-4 text-sm" style={{ color: "#1A1A1A" }}>
                <p>簽名：___________________________</p>
                <p>日期：_______ / _______ / _______</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer credit */}
      <p className="no-print text-xs text-gray-500 mt-4 text-center">
        填寫完成後，點擊「列印」或「匯出 PDF」即可產出正式報價單
      </p>
    </div>
  );
}

/* Editable inline field component */
function EditableField({
  value,
  onChange,
  placeholder,
  className = "",
  style = {},
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none transition-colors placeholder:text-gray-400 ${className}`}
      style={{ color: "#1A1A1A", ...style }}
    />
  );
}
