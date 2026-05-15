/**
 * Podcast 製作報價單 - Neo-Document Style
 * 
 * 兩種模式：
 * - 業務模式（預設）：可編輯所有欄位，填完後產生「客戶連結」
 * - 客戶模式（?mode=client&data=...）：唯讀，只能簽名或按疑慮按鈕
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Trash2, Printer, FileDown, ChevronDown, AlertCircle, Loader2, Link, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import SignaturePad from "@/components/SignaturePad";

// ===== ERP Product Database =====
const PRODUCTS = [
  { id: "P-008", name: "Podcast 製作", description: "Podcast 製作剪輯與優化 (15min)", price: 900 },
  { id: "P-009", name: "Podcast 製作", description: "Podcast 製作剪輯與優化 (20min)", price: 1000 },
  { id: "P-010", name: "Podcast 製作", description: "Podcast 製作剪輯與優化 (25min)", price: 1200 },
  { id: "P-011", name: "Podcast 製作", description: "方案A：每月4集（每集15分內，超出以10分鐘為一次，每次加收500元）", price: 3800 },
  { id: "P-012", name: "Podcast 製作", description: "方案B：每月8集（每集15分內，超出以10分鐘為一次，每次加收500元）", price: 7500 },
  { id: "P-003", name: "製作急件加收費用", description: "針對歌曲製作、錄音等服務之優先處理費用", price: 3000 },
  { id: "P-004", name: "錄音室加時費", description: "錄音室租借與工程師支援，每小時計算", price: 1000 },
];

interface QuoteItem {
  id: string;
  productId: string;
  name: string;
  content: string;
  unitPrice: number | string;
  quantity: number | string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()} / ${String(now.getMonth() + 1).padStart(2, "0")} / ${String(now.getDate()).padStart(2, "0")}`;
}

// Encode/decode quotation data for URL sharing
function encodeData(data: object): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}
function decodeData(str: string): Record<string, unknown> | null {
  try { return JSON.parse(decodeURIComponent(atob(str))); } catch { return null; }
}

export default function Home() {
  const documentRef = useRef<HTMLDivElement>(null);

  // Detect mode from URL
  const params = new URLSearchParams(window.location.search);
  const isClientMode = params.get("mode") === "client";
  const urlData = params.get("data") ? decodeData(params.get("data")!) : null;

  // Customer info
  const [customerName, setCustomerName] = useState((urlData?.customerName as string) || "");
  const [customerContact, setCustomerContact] = useState((urlData?.customerContact as string) || "");
  const [customerPhone, setCustomerPhone] = useState((urlData?.customerPhone as string) || "");
  const [customerEmail, setCustomerEmail] = useState((urlData?.customerEmail as string) || "");
  const [quoteDate, setQuoteDate] = useState((urlData?.quoteDate as string) || getTodayString());
  const [projectName, setProjectName] = useState((urlData?.projectName as string) || "Podcast 節目製作");

  // Quote items
  const defaultItems: QuoteItem[] = [
    { id: generateId(), productId: "", name: "", content: "", unitPrice: "", quantity: "1" },
    { id: generateId(), productId: "", name: "", content: "", unitPrice: "", quantity: "1" },
    { id: generateId(), productId: "", name: "", content: "", unitPrice: "", quantity: "1" },
    { id: generateId(), productId: "", name: "", content: "", unitPrice: "", quantity: "1" },
  ];
  const [items, setItems] = useState<QuoteItem[]>(
    urlData?.items ? (urlData.items as QuoteItem[]) : defaultItems
  );

  // Signatures
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isConcernSending, setIsConcernSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Signature dates
  const [customerSignDate, setCustomerSignDate] = useState("");
  const [authorizedSignDate] = useState(getTodayString());

  // Auto-fill sign date when customer signature is added, then trigger archive flow
  useEffect(() => {
    if (customerSignature && !customerSignDate) {
      setCustomerSignDate(getTodayString());
      handleContractSigned();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSignature]);

  const handleContractSigned = useCallback(async () => {
    setIsSigning(true);
    toast.info("合約已簽署，正在歸檔中...");
    try {
      const html = documentRef.current?.outerHTML || "";
      const res = await fetch("/api/sign-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;}</style></head><body>${html}</body></html>`,
          customerName, customerEmail, projectName,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("合約已歸檔並寄送至雙方信箱");
      } else {
        toast.warning("歸檔完成（部分功能需配置 SMTP）");
      }
    } catch {
      toast.warning("簽署完成（伺服器離線時歸檔功能暫停）");
    } finally {
      setIsSigning(false);
    }
  }, [customerName, customerEmail, projectName]);

  const handleConcern = useCallback(async () => {
    setIsConcernSending(true);
    try {
      await fetch("/api/notify-concern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerPhone, customerEmail }),
      });
      toast.success("已通知窗口，將盡快與您聯絡");
    } catch {
      toast.error("通知發送失敗，請直接聯絡 kayon@karbonxgaiaentertainment.com");
    } finally {
      setIsConcernSending(false);
    }
  }, [customerName, customerPhone, customerEmail]);

  // Generate client-facing URL with encoded data
  const handleGenerateLink = useCallback(() => {
    const data = encodeData({ customerName, customerContact, customerPhone, customerEmail, quoteDate, projectName, items });
    const url = `${window.location.origin}?mode=client&data=${data}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      toast.success("客戶連結已複製到剪貼簿！");
      setTimeout(() => setLinkCopied(false), 3000);
    }).catch(() => {
      toast.info("連結已產生，請手動複製：" + url);
    });
  }, [customerName, customerContact, customerPhone, customerEmail, quoteDate, projectName, items]);

  const addRow = useCallback(() => {
    setItems((prev) => [...prev, { id: generateId(), productId: "", name: "", content: "", unitPrice: "", quantity: "1" }]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) { toast.error("至少需要保留一列"); return prev; }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const updateItem = useCallback((id: string, field: keyof QuoteItem, value: string) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      if (field === "unitPrice" || field === "quantity") return { ...item, [field]: value.replace(/[^0-9.]/g, "") };
      return { ...item, [field]: value };
    }));
  }, []);

  const selectProduct = useCallback((itemId: string, productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) => prev.map((item) => item.id !== itemId ? item : {
      ...item, productId: product.id, name: product.name, content: product.description, unitPrice: String(product.price),
    }));
  }, []);

  const getSubtotal = (item: QuoteItem): number => {
    const price = typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
    const qty = typeof item.quantity === "string" ? parseFloat(item.quantity) || 0 : item.quantity;
    return price * qty;
  };

  const total = items.reduce((sum, item) => sum + getSubtotal(item), 0);
  const formatNumber = (num: number): string => num === 0 ? "" : num.toLocaleString("zh-TW");

  return (
    <div className="page-background min-h-screen bg-[#1a1a1a] py-8 px-4 flex flex-col items-center">
      {/* Toolbar */}
      <div className="no-print w-full max-w-[800px] mb-4 flex justify-between items-center gap-3">
        {/* Mode badge */}
        <div className={`text-xs px-3 py-1.5 rounded font-medium ${isClientMode ? "bg-blue-900/40 text-blue-300 border border-blue-700/40" : "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30"}`}>
          {isClientMode ? "📄 客戶檢視模式（唯讀）" : "✏️ 業務填寫模式"}
        </div>
        <div className="flex gap-2">
          {/* Generate client link - only in edit mode */}
          {!isClientMode && (
            <button
              onClick={handleGenerateLink}
              className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded hover:bg-[#b8963f] transition-all duration-200 text-sm font-medium"
            >
              {linkCopied ? <Check size={15} /> : <Link size={15} />}
              {linkCopied ? "已複製！" : "產生客戶連結"}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#C9A84C] border border-[#C9A84C]/30 rounded hover:bg-[#C9A84C] hover:text-white transition-all duration-200 text-sm font-medium"
          >
            <Printer size={16} />
            列印
          </button>
          <button
            onClick={() => { toast.info("請在列印對話框中選擇「另存為 PDF」"); setTimeout(() => window.print(), 500); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#C9A84C] border border-[#C9A84C]/30 rounded hover:bg-[#C9A84C] hover:text-white transition-all duration-200 text-sm font-medium"
          >
            <FileDown size={16} />
            匯出 PDF
          </button>
        </div>
      </div>

      {/* Client mode notice banner */}
      {isClientMode && (
        <div className="no-print w-full max-w-[800px] mb-3 bg-blue-950/60 border border-blue-700/40 rounded px-4 py-3 text-sm text-blue-200">
          此為報價單唯讀版本。如有任何疑問，請點擊下方「合約上有疑慮？」按鈕通知窗口。確認無誤後，請在下方進行電子簽名。
        </div>
      )}

      {/* Document */}
      <div
        ref={documentRef}
        className="print-document bg-white w-full max-w-[800px] shadow-2xl shadow-black/50 px-12 py-10"
        style={{ fontFamily: "Arial, 'Noto Sans TC', sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: "#1A1A1A", fontSize: "24px" }}>
            Podcast製作報價單
          </h1>
          <p className="text-sm mt-1" style={{ color: "#888888", fontSize: "12px" }}>Quotation</p>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>
              客戶資訊 &nbsp;Customer Info
            </h3>
            <div className="space-y-2">
              <ReadOrEdit isClient={isClientMode} value={customerName} onChange={setCustomerName} placeholder="客戶名稱" className="font-medium text-sm" />
              <div className="flex items-center gap-1">
                <span className="text-sm whitespace-nowrap" style={{ color: "#1A1A1A" }}>窗口：</span>
                <ReadOrEdit isClient={isClientMode} value={customerContact} onChange={setCustomerContact} placeholder="聯絡窗口姓名" className="text-sm flex-1" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm whitespace-nowrap" style={{ color: "#1A1A1A" }}>聯絡電話：</span>
                <ReadOrEdit isClient={isClientMode} value={customerPhone} onChange={setCustomerPhone} placeholder="請輸入電話" className="text-sm flex-1" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm whitespace-nowrap" style={{ color: "#1A1A1A" }}>Email：</span>
                <ReadOrEdit isClient={isClientMode} value={customerEmail} onChange={setCustomerEmail} placeholder="請輸入 Email" className="text-sm flex-1" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>
              報價資訊 &nbsp;Quotation Info
            </h3>
            <div className="flex items-center gap-1">
              <span className="text-sm whitespace-nowrap" style={{ color: "#888888" }}>報價日期：</span>
              <ReadOrEdit isClient={isClientMode} value={quoteDate} onChange={setQuoteDate} placeholder="YYYY / MM / DD" className="text-sm" />
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="mb-6">
          <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>
            專案資訊 &nbsp;Project
          </h3>
          <div className="px-3 py-2 inline-block" style={{ backgroundColor: "#FFF8E1" }}>
            <ReadOrEdit isClient={isClientMode} value={projectName} onChange={setProjectName} placeholder="專案名稱" className="font-bold text-base" style={{ color: "#1A1A1A" }} />
          </div>
        </div>

        {/* Quote Table */}
        <div className="mb-1">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#1A1A1A" }}>
                <th className="text-white text-xs font-bold py-2 px-2 text-center w-[22%]">項目</th>
                <th className="text-white text-xs font-bold py-2 px-2 text-center w-[30%]">內容</th>
                <th className="text-white text-xs font-bold py-2 px-2 text-center w-[16%]">單價 (NTD)</th>
                <th className="text-white text-xs font-bold py-2 px-2 text-center w-[10%]">數量</th>
                <th className="text-white text-xs font-bold py-2 px-2 text-center w-[16%]">小計 (NTD)</th>
                {!isClientMode && <th className="no-print w-[6%]"></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 group hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 px-1">
                    {isClientMode ? (
                      <span className="block text-center text-xs py-1" style={{ color: "#1A1A1A" }}>{item.name || "—"}</span>
                    ) : (
                      <ProductSelect value={item.productId} onChange={(pid) => selectProduct(item.id, pid)} displayValue={item.name} onManualChange={(v) => updateItem(item.id, "name", v)} />
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isClientMode ? (
                      <span className="block text-center text-xs py-1" style={{ color: "#1A1A1A" }}>{item.content || "—"}</span>
                    ) : (
                      <input type="text" value={item.content} onChange={(e) => updateItem(item.id, "content", e.target.value)} placeholder="—" className="w-full text-center text-xs bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none py-1" style={{ color: "#1A1A1A" }} />
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isClientMode ? (
                      <span className="block text-center text-xs py-1" style={{ color: "#1A1A1A" }}>{item.unitPrice || "0"}</span>
                    ) : (
                      <input type="text" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)} placeholder="0" className="w-full text-center text-xs bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none py-1" style={{ color: "#1A1A1A" }} />
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isClientMode ? (
                      <span className="block text-center text-xs py-1" style={{ color: "#1A1A1A" }}>{item.quantity}</span>
                    ) : (
                      <input type="text" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} placeholder="1" className="w-full text-center text-xs bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none py-1" style={{ color: "#1A1A1A" }} />
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-xs font-medium" style={{ color: "#1A1A1A" }}>
                    {formatNumber(getSubtotal(item))}
                  </td>
                  {!isClientMode && (
                    <td className="no-print py-2 px-1">
                      <button onClick={() => removeRow(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity" title="刪除此列">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row - edit mode only */}
        {!isClientMode && (
          <div className="no-print mb-4">
            <button onClick={addRow} className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#b8963f] transition-colors py-1">
              <Plus size={14} />新增項目
            </button>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 mb-8" style={{ backgroundColor: "#C9A84C" }}>
          <span className="text-white font-bold text-sm tracking-wide">總計 &nbsp;Total</span>
          <span className="text-white font-bold text-base">NTD {total.toLocaleString("zh-TW")}</span>
        </div>

        {/* Notes & Payment */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>備註 &nbsp;Notes</h3>
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
              <p>十一、因版權歸屬，音樂（效）需由客戶端提供，可挑選自己喜歡的網站進行購買並提供帳號給我方；若由我方提供，則需外加NT$500元起。</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>匯款資訊 &nbsp;Payment</h3>
            <div className="space-y-1 text-xs" style={{ color: "#444444" }}>
              <p>銀行｜國泰世華銀行 (013) 竹城分行</p>
              <p>戶名｜洪曜騏</p>
              <p>帳號｜2105-0630-7630</p>
            </div>
            <h3 className="text-xs font-bold mt-5 mb-3 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>承接方資訊 &nbsp;Contractor Info</h3>
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
          <p className="text-center text-xs mb-2" style={{ color: "#888888" }}>
            若客戶對合約金額有不清楚之處，請與負責窗口商討確認。
          </p>
          <p className="text-center text-xs mb-5" style={{ color: "#888888" }}>
            本報價單確認即視為同意以上製作與使用條款
          </p>
          <div className="grid grid-cols-2 gap-8">
            {/* Customer Signature */}
            <div>
              <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>
                客戶簽署 &nbsp;Customer Signature
              </h3>
              <SignaturePad label="客戶簽署" value={customerSignature} onChange={setCustomerSignature} allowUpload={true} />
              <div className="mt-3 flex items-center gap-1">
                <span className="text-sm" style={{ color: "#1A1A1A" }}>日期：</span>
                <span className="text-sm" style={{ color: "#1A1A1A" }}>{customerSignDate || "_______ / _______ / _______"}</span>
              </div>
            </div>
            {/* KAYON Fixed Signature */}
            <div>
              <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "#C9A84C", fontSize: "11px" }}>
                KAYON 簽署 &nbsp;Authorized Signature
              </h3>
              <div className="mt-2">
                <div className="border border-gray-200 rounded p-2 bg-white">
                  <img src="/signature_kayon.png" alt="KAYON 簽名" className="h-14 object-contain mx-auto" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <span className="text-sm" style={{ color: "#1A1A1A" }}>日期：</span>
                <span className="text-sm" style={{ color: "#1A1A1A" }}>{authorizedSignDate}</span>
              </div>
            </div>
          </div>

          {/* E-Signature Declaration */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs leading-relaxed" style={{ color: "#888888" }}>
              雙方同意以電子方式簽署本文件<br />
              並確認本電子文件與親筆簽名文件具有同等效力<br /><br />
              簽署完成後<br />本合約即視為正式成立
            </p>
            <p className="text-xs mt-4" style={{ color: "#C9A84C" }}>🔒 256-bit SSL encryption</p>

            {/* Concern button - always visible */}
            <div className="no-print mt-6">
              <button
                onClick={handleConcern}
                disabled={isConcernSending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-gray-300 rounded text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors disabled:opacity-50"
              >
                {isConcernSending ? <Loader2 size={13} className="animate-spin" /> : <AlertCircle size={13} />}
                合約上有疑慮？請負責窗口與我聯絡
              </button>
            </div>

            {isSigning && (
              <div className="no-print mt-3 flex items-center justify-center gap-2 text-xs" style={{ color: "#C9A84C" }}>
                <Loader2 size={13} className="animate-spin" />正在歸檔並寄送合約...
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="no-print text-xs text-gray-500 mt-4 text-center">
        {isClientMode ? "如有疑問請點擊上方「合約上有疑慮？」按鈕通知窗口" : "填寫完成後，點擊「產生客戶連結」傳送給客戶"}
      </p>
    </div>
  );
}

/* ===== Read-or-Edit field ===== */
function ReadOrEdit({ isClient, value, onChange, placeholder, className = "", style = {} }: {
  isClient: boolean; value: string; onChange: (v: string) => void;
  placeholder: string; className?: string; style?: React.CSSProperties;
}) {
  if (isClient) {
    return <span className={`${className} py-0.5`} style={{ color: "#1A1A1A", ...style }}>{value || <span style={{ color: "#aaa" }}>{placeholder}</span>}</span>;
  }
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`bg-transparent border-0 border-b border-transparent focus:border-[#C9A84C] focus:outline-none transition-colors placeholder:text-gray-400 ${className}`}
      style={{ color: "#1A1A1A", ...style }} />
  );
}

/* ===== Product Select Dropdown ===== */
function ProductSelect({ value, onChange, displayValue, onManualChange }: {
  value: string; onChange: (productId: string) => void; displayValue: string; onManualChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) { document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-0.5 cursor-pointer border-b border-transparent hover:border-[#C9A84C] transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <input type="text" value={displayValue} onChange={(e) => onManualChange(e.target.value)} placeholder="選擇品項"
          className="w-full text-center text-xs bg-transparent border-0 focus:outline-none py-1 cursor-pointer" style={{ color: "#1A1A1A" }} readOnly
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} />
        <ChevronDown size={12} className="no-print text-gray-400 shrink-0" />
      </div>
      {isOpen && (
        <div className="absolute z-40 top-full left-0 mt-1 w-[320px] bg-white border border-gray-200 rounded-md shadow-lg max-h-[240px] overflow-y-auto">
          {PRODUCTS.map((product) => (
            <button key={product.id} onClick={() => { onChange(product.id); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 hover:bg-[#FFF8E1] transition-colors border-b border-gray-50 last:border-0 ${value === product.id ? "bg-[#FFF8E1]" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "#1A1A1A" }}>{product.id}</span>
                <span className="text-xs font-bold" style={{ color: "#C9A84C" }}>NT${product.price.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">{product.description}</p>
            </button>
          ))}
          <button onClick={() => setIsOpen(false)} className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-xs text-gray-400 italic">
            自行輸入（關閉選單）
          </button>
        </div>
      )}
    </div>
  );
}
