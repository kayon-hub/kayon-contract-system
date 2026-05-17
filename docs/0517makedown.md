# KAYON STUDIO ERP SYSTEM SPEC

## SINGLE SOURCE OF TRUTH

All pricing, project data, payment rules, and workflow data must originate from Google Sheets.

Do not hardcode values inside templates, scripts, Apps Script, or automation workflows.

Google Sheets acts as the primary database for:

* products
* quotes
* clients
* payment tracking
* project workflow

---

# GOOGLE SHEETS STRUCTURE

## 產品資料庫

Stores all products and services.

Recommended fields:

* product_id
* category
* service_name
* base_price
* pricing_type
* active

Example:

* POD001
* MUS001
* CRS001

Product IDs must remain fixed and unique.

---

## 04_案件紀錄表

Primary project tracking database.

Recommended fields:

* quote_id
* client_name
* project_name
* confirm_date
* revenue
* total_cost
* estimated_profit
* case_status
* owner
* delivery_days
* delivery_note
* revision_limit
* deposit_status
* deposit_date
* final_status
* final_date

This sheet acts as:

* project tracker
* workflow tracker
* payment tracker

---

## 06_系統設定

System-wide settings only.

Recommended structure:

| type | key | value |

Examples:

| company | company_name | KAYON STUDIO ｜ KARBØN X GAIA ENTERTAINMENT |
| company | tax_rate | 0.05 |
| quote | prefix | KGE- |
| payment | default_terms | 訂金50%／尾款50% |

Do not store project-specific delivery timelines here.

---

# CASE STATUS RULES

Allowed case status values:

* 洽談中
* 已送報價
* 已簽約
* 製作中
* 初版確認
* 修改中
* 已交付
* 已完成
* 已取消

All status names must remain standardized.

Do not create custom variations.

---

# PAYMENT STATUS RULES

Deposit status options:

* 未收款
* 已收款
* 已退款

Final payment status options:

* 未收款
* 已收款
* 已退款

Payment status must remain separate from case status.

---

# DELIVERY RULES

Delivery timelines are project-specific.

Do not use a global fixed delivery time.

Each project must contain:

* delivery_days
* delivery_note

Examples:

* 2 working days
* 7 working days
* 21 working days

delivery_days should use numeric values only.

Examples:

* 2
* 7
* 21

delivery_note is the human-readable text shown in contracts and quotations.

Example:
"訂金確認後約21個工作天完成"

---

# DATE RULES

All payment dates must use Google Sheets date format.

Do not combine payment status and dates in the same field.

Correct structure:

* deposit_status
* deposit_date
* final_status
* final_date

Google Sheets date picker should be enabled for all date fields.

---

# REVISION RULES

revision_limit must be project-specific.

Do not hardcode revision limits globally.

Examples:

* Podcast editing = 2 revisions
* Large projects = custom revisions

---

# AUTOMATION PRINCIPLES

Human handles:

* approval
* status updates
* project decisions

Automation handles:

* document generation
* notifications
* workflow triggers
* dashboard updates
* payment reminders

---

# WORKFLOW OVERVIEW

Client Inquiry
→ Quotation Generated
→ Contract Confirmation
→ Deposit Received
→ Production
→ First Review
→ Revisions
→ Final Delivery
→ Final Payment
→ Project Completed

---

# DEVELOPMENT PRINCIPLES

* Keep sheets simple
* Avoid duplicate data
* Avoid hardcoded values
* Avoid creating unnecessary sheets
* Prefer centralized structured data
* Preserve backward compatibility with existing Manus workflows

Refactor gradually.
Do not rebuild the entire system at once.
