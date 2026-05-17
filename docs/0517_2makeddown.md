# SHEET SCHEMA

## 04_案件紀錄表

| Column | Field |
|---|---|
| A | quote_id |
| B | client_name |
| C | project_name |
| D | confirm_date |
| E | revenue |
| F | total_cost |
| G | estimated_profit |
| H | case_status |
| I | owner |
| J | delivery_days |
| K | delivery_note |
| L | revision_limit |
| M | deposit_status |
| N | deposit_date |
| O | final_status |
| P | final_date |sss
I updated the Google Sheets schema for the ERP system.

Please update all related workflows, mappings, Apps Script logic, and quotation generation logic to match the new sheet structure.

Important:

* Existing workflows must remain backward compatible.
* Newly added fields include:

  * delivery_days
  * delivery_note
  * revision_limit
  * deposit_status
  * deposit_date
  * final_status
  * final_date

Please treat the updated Google Sheet structure as the new source of truth.
ss