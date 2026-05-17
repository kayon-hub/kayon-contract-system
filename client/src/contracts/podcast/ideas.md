# Podcast 製作報價單 - 設計風格構思

## 需求核心
這是一份專業報價單的網頁版本，需要保留原始的黑金配色、專業簡約高級感。
主要功能：可編輯欄位、自動計算、列印/匯出 PDF。
目標：在瀏覽器中呈現如同正式紙本文件的質感。

---

<response>
<text>
## Idea 1: Neo-Document 新文件主義

**Design Movement**: Swiss International Style 結合現代 Document Design
**Core Principles**:
1. 紙張模擬 — 在螢幕上重現 A4 紙張的真實質感，帶有微妙的紙紋與陰影
2. 精確排版 — 嚴格遵循原始報價單的欄位對齊與比例
3. 功能隱藏 — 編輯功能在 hover 時才顯現，列印時完全隱藏

**Color Philosophy**: 
- 主黑 #1A1A1A 代表權威與專業
- 金色 #C9A84C 作為品牌識別與層級標示
- 灰色 #888888 用於次要資訊
- 白色背景模擬紙張

**Layout Paradigm**: 單頁 A4 比例的居中文件，外圍帶有深色背景形成對比

**Signature Elements**:
1. 金色細線分隔各區塊
2. 表頭的黑金漸層微光效果
3. 紙張邊緣的精緻投影

**Interaction Philosophy**: 點擊即編輯，無額外 UI 干擾文件閱讀體驗

**Animation**: 頁面載入時文件從上方輕微滑入(200ms)，編輯欄位獲得焦點時有金色底線動畫

**Typography System**: Arial 為主字體，保持與原始文件一致；標題加粗，正文 regular
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Idea 2: Luxury Stationery 奢華文具風

**Design Movement**: Art Deco 結合高端品牌視覺
**Core Principles**:
1. 材質感 — 深色大理石紋理背景，文件區域為象牙白
2. 裝飾性 — 金色幾何裝飾線條與角落紋樣
3. 層次感 — 多層陰影營造文件浮於桌面的效果

**Color Philosophy**:
- 背景使用深灰近黑 #0D0D0D 模擬高級桌面
- 文件區域為暖白 #FAFAF8
- 金色 #C9A84C 用於裝飾與強調
- 黑色 #1A1A1A 用於正文

**Layout Paradigm**: 深色全屏背景中央放置文件，文件本身帶有裝飾邊框

**Signature Elements**:
1. Art Deco 風格的金色角落裝飾
2. 文件頂部的金色裝飾線
3. 按鈕使用金色漸層與微妙光澤

**Interaction Philosophy**: 編輯時欄位邊框以金色高亮，操作按鈕以浮動工具列呈現

**Animation**: 文件載入時有優雅的淡入效果，金色裝飾線有微妙的閃光動畫

**Typography System**: 標題使用 Playfair Display 搭配 Arial 正文，營造高端感
</text>
<probability>0.05</probability>
</response>

<response>
<text>
## Idea 3: Minimal Professional 極簡專業

**Design Movement**: Minimalist Corporate Design
**Core Principles**:
1. 內容優先 — 零裝飾，讓資訊本身成為設計
2. 精準對齊 — 嚴格的網格系統確保每個元素都有呼吸空間
3. 列印友善 — 螢幕所見即列印所得

**Color Philosophy**:
- 純白背景 #FFFFFF 確保最佳可讀性
- 黑色 #1A1A1A 用於所有主要文字
- 金色 #C9A84C 僅用於區塊標題，作為唯一的色彩亮點
- 極淺灰 #F5F5F5 用於表格交替行

**Layout Paradigm**: 全寬響應式佈局，大螢幕時限制最大寬度模擬文件比例

**Signature Elements**:
1. 金色左邊框標示各區塊
2. 極細的分隔線
3. 大量留白

**Interaction Philosophy**: 欄位直接可編輯，以虛線底線暗示可輸入狀態

**Animation**: 幾乎無動畫，僅有焦點狀態的平滑過渡(150ms)

**Typography System**: 系統字體堆疊，依賴字重變化建立層級
</text>
<probability>0.07</probability>
</response>

---

## 選定方案：Idea 1 - Neo-Document 新文件主義

選擇理由：最符合用戶需求的「保留原始設計風格」與「像正式文件一樣」的要求。
在螢幕上模擬 A4 紙張，保持原始報價單的版面結構，同時加入現代互動體驗。
