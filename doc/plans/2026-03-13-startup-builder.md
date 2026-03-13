# Startup Builder – Kiến trúc và kế hoạch

**Ngày:** 2026-03-13

## 1. Tổng quan

Startup Builder là tính năng mới trên nền Paperclip: user nhập ý tưởng startup (tên, mô tả, thị trường, tech stack) → hệ thống tạo **Startup Workspace** (một Company) và đội **5 AI agents** (CEO, CTO, PM, Engineer, Marketing) để lên kế hoạch và triển khai.

## 2. Kiến trúc hiện tại (tóm tắt)

- **Company** là gốc; mọi thứ (agents, goals, projects, issues) đều scoped theo `companyId`.
- **Agents**: `packages/db` schema `agents`, service `server/src/services/agents.ts`, route `POST /companies/:companyId/agents`. Agent có `role` (ceo, cto, pm, engineer, cmo, …), `adapterType` (process, claude_local, …), `reportsTo` (cây báo cáo).
- **Tasks = Issues**: `server/src/services/issues.ts` tạo issue gắn goal/project, checkout/release atomic, assignee duy nhất; heartbeat chạy task qua adapter.
- **Goals**: `goals` table, level company/team/agent/task, có thể dùng cho roadmap/milestone.
- **UI**: `ui/src/App.tsx` – board routes theo `/:companyPrefix/...`; Sidebar, CompanySwitcher, dashboard/agents/projects/issues/goals/approvals/costs/activity/inbox.

## 3. Đề xuất kiến trúc Startup Builder

### 3.1 Nguyên tắc

- **Startup Workspace = Company.** Không tạo entity “startup” tách biệt; một startup là một company kèm metadata và bộ agents/roadmap mặc định.
- **Tái sử dụng tối đa:** agents, issues, goals, activity, dashboard hiện có.
- **Metadata startup:** lưu thêm thông tin (target_market, tech_stack, template, vision, roadmap) để UI và generator dùng.

### 3.2 Mô hình dữ liệu

- **`startup_profiles`** (1–1 với company khi là startup workspace):
  - `id`, `company_id` (FK unique), `template_slug`, `target_market`, `tech_stack`, `vision_summary` (text), `roadmap_30_days` (jsonb), `roadmap_90_days` (jsonb), `created_at`, `updated_at`.
- **`startup_templates`** (tham chiếu):
  - `slug` (PK), `name`, `description`, `default_roadmap_30` (jsonb), `default_roadmap_90` (jsonb). Seed: SaaS Startup, AI Tool, Marketplace, Content Platform.

Company dùng chung: `name` = tên startup, `description` = mô tả ngắn (vision high-level).

### 3.3 Luồng tạo Startup Workspace

1. User gửi form: `startup_name`, `startup_description`, `target_market`, `tech_stack`, `template_slug` (optional).
2. Backend:
   - Tạo **Company** (name, description), dùng `companyService.create`.
   - Tạo **StartupProfile** (company_id, target_market, tech_stack, template_slug, vision_summary có thể để trống hoặc copy từ description; roadmap từ template).
   - Tạo **5 agents** trong company:
     - CEO (role=ceo, title="CEO Agent"), CTO (role=cto), PM (role=pm), Engineer (role=engineer), Marketing (role=cmo, title="Marketing Agent"). Tất cả `adapterType: "process"`, CEO có thể `reportsTo: null`, còn lại `reportsTo: ceo.id`.
   - (Tùy chọn) Tạo 1 company-level **goal** “Startup execution” và vài **issues** mẫu từ template.
3. Response trả về `companyId` (và prefix); UI redirect tới `/:prefix/startup-builder` hoặc `/:prefix/dashboard`.

### 3.4 Roadmap và tasks

- **30/90 day roadmap:** Lưu trong `startup_profiles.roadmap_30_days` / `roadmap_90_days` (mảng item: title, description, milestone, …). Có thể sinh từ template hoặc sau này bổ sung LLM generator.
- **Chuyển milestone → tasks:** CTO “break down” = tạo **goals** (level task) và **issues** trong Paperclip, assign cho Engineer agent. Giữ nguyên logic issues hiện tại (checkout, heartbeat).
- **Dashboard startup:** Trang riêng `/:prefix/startup-builder` hiển thị: vision (từ profile + company.description), roadmap (từ profile jsonb), task progress (query issues theo company), agent activity (từ activity log / heartbeat).

### 3.5 Templates

- Mỗi template có `default_roadmap_30` và `default_roadmap_90` (cấu trúc cố định). Khi tạo workspace từ template, copy vào `startup_profiles`. Template slug: `saas`, `ai-tool`, `marketplace`, `content-platform`.

### 3.6 Điểm tích hợp

- **API:** `POST /api/startup-builder/create` (body: startup_name, startup_description, target_market, tech_stack, template_slug). Cần auth board user; sau khi tạo xong gán user vào company (membership) nếu cần.
- **UI:** Entry “Startup Builder” trên nav (cấp board, không phụ thuộc company). Flow: Step 1 form → gọi API → Step 2 “Creating…” → redirect đến startup dashboard.
- **Company remove:** Khi xóa company, xóa `startup_profiles` trước (hoặc CASCADE nếu FK).

## 4. Các bước triển khai

1. **Doc + schema:** Tài liệu này; thêm bảng `startup_profiles`, `startup_templates`; migration; export từ `packages/db`.
2. **API:** Service `startupBuilderService.createWorkspace(input)` (company + profile + 5 agents); route `POST /api/startup-builder/create`; validator shared.
3. **UI entry + flow:** Nav “Startup Builder” → trang form (Step 1) → submit → tạo workspace (Step 2) → redirect đến `/:prefix/startup-builder` hoặc dashboard.
4. **Startup Dashboard:** Trang `/:prefix/startup-builder` hiển thị vision, roadmap, task progress, agent activity (dùng API hiện có).
5. **Templates:** Seed `startup_templates`; dropdown trong form; áp default roadmap khi tạo profile.
6. **(Sau này)** Roadmap generator (LLM) và “CTO breakdown” tự động thành issues – có thể làm phase 2.

## 5. Rủi ro và lưu ý

- **Quyền:** Đảm bảo chỉ user có quyền tạo company mới mới gọi được `POST /api/startup-builder/create`; gán membership cho company mới theo chính sách hiện tại.
- **Agent approval:** Nếu company bật `requireBoardApprovalForNewAgents`, 5 agents tạo qua Startup Builder có thể cần đi qua approval; cần quyết định có bỏ qua approval cho “system-created” agents trong context startup hay không (ví dụ flag hoặc policy riêng).
- **Prefix:** Company tạo bởi Startup Builder vẫn dùng `createCompanyWithUniquePrefix`; không conflict với flow tạo company thủ công.
