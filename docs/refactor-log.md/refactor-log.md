# Refactor Log — 2026-05-17

## 本次重大調整

將電子合約系統改為 feature-based structure。

---

## 原本結構

client/src/
├── components
├── pages
├── hooks

所有合約功能混在一起。

---

## 新結構

client/src/contracts/
├── podcast/
├── music/
├── bgm/
└── interactive/

---

## 目前規則

### contracts/

每個資料夾代表一種合約模組。

例如：

- podcast = Podcast 製作報價/簽約
- music = 音樂製作合約
- bgm = 配樂製作
- interactive = 互動式系統服務

---

## 共用模組不移動

以下維持 shared：

- src/components
- src/hooks
- src/contexts
- src/lib

---

## 不可搬移內容

以下屬於整個 React/Vite project：

- package.json
- tsconfig.json
- vite.config.ts
- pnpm-lock.yaml

不要移入 contracts module。

---

## 目前 Podcast 已完成

Podcast 為目前正式運作中的電子合約模組。

後續其餘合約將複製 Podcast 架構延伸。

---

## 接下來目標

將 podcast 專屬：

- pages
- components
- pricing
- terms
- config

整理至：

client/src/contracts/podcast/

---

## 注意事項

不要建立新的 React project。

所有合約：

- 共用同一套 deploy
- 共用 API
- 共用簽名系統
- 共用 PDF 系統
- 共用 LINE LIFF

僅 route/module 不同。
