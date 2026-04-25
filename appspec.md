# App Spec: Document Violation Manager MVP

Bạn là Senior Full-stack Architect + Product Engineer. Hãy xây dựng MVP web app SaaS có thể chạy local và deploy lên Vercel.

---

## 1. Product idea

Tên sản phẩm tạm thời: **Document Violation Manager**

Ứng dụng giúp cán bộ tạo, cấu hình và sử dụng văn bản biên bản vi phạm dựa trên file Word mẫu.

---

## 2. Problem

Hiện tại khi cán bộ lập biên bản cho người vi phạm, họ thường mở một file Word cũ, sửa thủ công các thông tin như tên, tuổi, địa chỉ, thời gian vi phạm, lỗi vi phạm... Các thông tin này thường lặp lại nhiều lần trong văn bản.

Việc sửa thủ công dễ dẫn đến lỗi:

- Có chỗ đã sửa thành thông tin mới.
- Có chỗ vẫn còn thông tin cũ.
- Khi in ra có thể gây sai sót pháp lý.
- Người vi phạm có thể khiếu nại/kiện vì thông tin sai.

---

## 3. Goal MVP

Tạo web app cho phép:

1. Cán bộ login.
2. Upload file Word biên bản mẫu.
3. Hiển thị văn bản dạng editor.
4. Cấu hình các variable bằng cách chọn text trong văn bản.
5. Lưu template văn bản.
6. Tạo trường hợp vi phạm mới từ template.
7. Nhập giá trị variable một lần, tự động replace toàn bộ vị trí đã cấu hình trong văn bản.
8. Cho phép chỉnh sửa thủ công nội dung văn bản.
9. Preview văn bản trước khi in.
10. In văn bản ra đúng như bản preview.

---

## 4. Tech stack yêu cầu

Chọn stack dễ deploy miễn phí:

- Frontend + Backend: Next.js latest stable, App Router
- Language: TypeScript
- UI: Tailwind CSS + shadcn/ui
- Auth: NextAuth hoặc auth đơn giản bằng email/password cho MVP
- Database: SQLite cho local, có thể chuyển sang PostgreSQL/Supabase sau
- ORM: Prisma
- File processing:
  - Upload `.docx`
  - Convert hoặc parse nội dung Word sang HTML editable
  - Lưu nội dung HTML đã xử lý
  - Không cần support full Word formatting 100%, chỉ cần giữ tương đối: paragraph, bold, italic, underline, alignment, line break, table nếu có thể
- Editor: TipTap hoặc editor phù hợp
- Deploy target:
  - Local: `npm run dev`
  - SaaS URL: Vercel
- Storage MVP:
  - Local file upload hoặc database storage
  - Thiết kế sao cho sau này dễ chuyển sang S3/Supabase Storage

---

## 5. Core entities

Thiết kế database bằng Prisma.

### User

- id
- email
- passwordHash
- fullName
- role: officer/admin
- createdAt
- updatedAt

### DocumentTemplate

- id
- orderNumber: auto increment hoặc sequence
- name
- originalFileName
- contentHtml
- createdById
- lastUsedAt
- createdAt
- updatedAt

### DocumentVariable

- id
- templateId
- name
- dataType default: nvarchar
- originalText
- placeholderKey
- appearanceCount
- createdAt
- updatedAt

### ViolationCase

- id
- templateId
- officerId
- caseNumber optional
- finalContentHtml
- createdAt
- updatedAt
- printedAt optional

### ViolationCaseValue

- id
- caseId
- variableId
- value

---

## 6. Main pages

## 6.1 Login page

Path: `/login`

Fields:

- Email
- Password
- Login button

Seed demo account:

- email: `officer@example.com`
- password: `Password123!`

---

## 6.2 Dashboard / Template Grid

Path: `/templates`

Show all saved document templates.

Columns:

- Số thứ tự
- Tên văn bản
- Số lượng trường hợp vi phạm đã tạo từ văn bản này
- Thời gian sử dụng gần nhất
- Actions:
  - Tạo văn bản
  - Edit văn bản
  - Xoá văn bản

Features:

- Search by name or order number
- Button: “Tạo mới văn bản mẫu”

---

## 6.3 Create Template page

Path: `/templates/new`

Flow:

1. Officer uploads `.docx` file.
2. App parses content to editable HTML.
3. Show dual layout.

### Top frozen panel

Panel phía trên phải sticky/frozen khi scroll văn bản.

Bao gồm:

- Số thứ tự
- Tên văn bản
- Button: “Cài đặt nội dung đã chọn”
- Button: “Lưu config”
- List variables đã cấu hình

### Document area

Phía dưới là editable document viewer/editor:

- Có thể scroll dọc.
- Mỗi paragraph/section nên có số thứ tự hoặc marker nhỏ bên dưới/gần nó để dễ phân biệt phần văn bản, tương tự cảm giác định vị trong Word.
- Không cần full Word Office, nhưng cần đủ rõ để cán bộ kiểm tra nội dung.

---

## 7. Variable configuration behavior

User flow:

1. User chọn một hoặc nhiều đoạn text trong editor, ví dụ: `Nguyễn Văn A`.
2. Click button “Cài đặt nội dung đã chọn”.
3. Open modal.

Modal fields:

- Variable name
- Original selected text
- Data type hidden/default: `nvarchar`
- Appearance count
- Next / Previous appearance buttons

App behavior:

- Detect tất cả matching appearances của selected text trong document.
- Highlight tất cả appearances.
- Show count appearance.
- Next/Previous scrolls to matching appearance giống Ctrl + F.
- User có thể chọn:
  - Apply to all appearances
  - Apply only selected occurrence
  - Manually toggle appearances included/excluded

Khi save variable:

- Replace selected appearances internally bằng stable placeholder marker.
- Visually vẫn hiển thị original text khi đang config template.
- Store variable metadata trong database.

---

## 8. Suggested variable name behavior

Khi cán bộ chọn text, app nên suggest variable name tự động.

Ví dụ:

- Nếu selected text giống tên người: suggest `ho_ten_nguoi_vi_pham`
- Nếu giống năm: suggest `nam_sinh`
- Nếu giống ngày/tháng/năm: suggest `ngay_vi_pham` hoặc `ngay_lap_bien_ban`
- Nếu giống địa chỉ: suggest `dia_chi`
- Nếu giống biển số xe: suggest `bien_so_xe`
- Nếu giống số CMND/CCCD: suggest `so_cccd`
- Nếu giống lỗi vi phạm: suggest `hanh_vi_vi_pham`
- Nếu không nhận diện được: normalize thành snake_case từ selected text

---

## 9. Edit Template page

Path: `/templates/[id]/edit`

- Same layout as create template.
- Load existing content and variables.
- Allow add/edit/delete variable.
- Allow edit template name.
- Save changes.

---

## 10. Create Violation Case page

Path: `/templates/[id]/cases/new`

Layout tương tự template config, nhưng top panel khác.

### Top frozen panel

Bao gồm:

- Template name
- List configured variables
- For each variable:
  - Variable name
  - Input value
  - Appearance count
  - Next / Previous
- Button: Preview
- Button: Save case
- Button: Print

### Behavior

- Khi officer click một variable, highlight tất cả places trong document linked với variable đó.
- Khi officer nhập value, replace/highlight tất cả linked positions ngay lập tức trong editor.
- Officer vẫn có thể manually edit bất kỳ text nào trong document.
- Editor có simple formatting controls giống Microsoft Teams:
  - Bold
  - Italic
  - Underline
  - Bullet list
  - Numbered list
  - Alignment nếu dễ implement
- Không cần full Microsoft Word features.

---

## 11. Preview and print requirements

Đây là phần rất quan trọng của MVP.

### Preview requirement

Khi cán bộ click “Xem trước”:

- App phải render final document trong layout sạch, không có editor toolbar, không có highlight, không có marker kỹ thuật.
- Nội dung preview phải là nội dung cuối cùng sẽ được in.
- Preview phải dùng cùng CSS/layout với bản print để tránh trường hợp preview một kiểu, in ra một kiểu.
- Preview nên hiển thị theo trang A4 để cán bộ thấy gần giống giấy thật.
- Nên có page boundary rõ ràng:
  - A4 portrait default
  - Width tương ứng A4
  - Margin giống khi in
  - Background trắng
  - Shadow nhẹ bên ngoài trang trong màn hình preview
- Không được để các phần điều khiển UI ảnh hưởng tới layout văn bản.
- Tất cả variable phải được thay bằng giá trị final.
- Nếu variable nào chưa có giá trị, phải cảnh báo trước khi preview hoặc highlight trong panel, tránh in thiếu thông tin.

### Print requirement

Khi cán bộ click “In”:

- Bản in ra phải giống ý hệt bản preview nhiều nhất có thể.
- Phải dùng CSS print chuyên biệt qua `@media print`.
- Khi in:
  - Hide toàn bộ navigation/sidebar/top panel/editor toolbar/buttons.
  - Chỉ in vùng document preview.
  - Không in shadow, border UI, highlight màu vàng, marker kỹ thuật, số thứ tự paragraph nếu số đó chỉ dùng cho editor.
  - Preserve font size, line height, paragraph spacing, table border, bold, italic, underline.
  - Preserve page margin.
- Set page size:
  - `@page { size: A4; margin: 20mm; }` hoặc margin phù hợp với văn bản hành chính Việt Nam.
- Tránh page break xấu:
  - Không cắt đôi dòng text.
  - Hạn chế cắt đôi table row.
  - Dùng CSS như `break-inside: avoid` cho table row/block quan trọng nếu phù hợp.
- Nếu browser print có setting header/footer mặc định, README cần hướng dẫn user tắt browser header/footer để bản in sạch.
- Nếu cần, implement print bằng cách mở preview trong route riêng `/cases/[id]/preview-print` để đảm bảo vùng in độc lập.

### Preview-print consistency

Yêu cầu kỹ thuật:

- Tạo một component dùng chung, ví dụ `PrintableDocument`, cho cả preview và print.
- Không tạo hai layout khác nhau cho preview và print.
- Preview chỉ là screen rendering của cùng component print.
- Print CSS chỉ ẩn UI ngoài document, không thay đổi nội dung chính.
- Trước khi in, app nên force save/sync editor content vào final content state.
- Nếu final document có manual edits, preview và print phải dùng nội dung sau manual edits.

Acceptance criteria riêng cho preview/print:

- User nhập variable, preview thấy đúng tất cả giá trị.
- User sửa thủ công trong editor, preview thấy đúng sửa đổi đó.
- User in ra PDF/browser print, bản in giống preview về nội dung, spacing, paragraph, table và format cơ bản.
- Không có toolbar/button/sidebar/highlight xuất hiện trong bản in.
- Không còn thông tin cũ của template xuất hiện ở các vị trí đã linked variable.

---

## 12. MVP simplifications allowed

Có thể simplify Word support:

- Only accept `.docx`
- Convert docx to HTML using a library like `mammoth`
- Formatting không cần pixel-perfect như Word
- Tables preserved nếu có thể, basic table support là đủ
- Export back to `.docx` optional, không bắt buộc cho MVP
- Print via browser là đủ

Tuy nhiên:

- Preview và print phải nhất quán.
- Nội dung in ra phải đúng với nội dung officer đã xem ở preview.

---

## 13. Required project output

Generate complete runnable project.

Include:

1. Folder structure
2. `package.json`
3. Prisma schema
4. Database seed script
5. Next.js pages/routes
6. API routes/server actions
7. UI components
8. Editor component
9. Upload/parse docx logic
10. Variable selection/highlight logic
11. Case creation and replacement logic
12. Preview/print component dùng chung
13. Print CSS
14. README.md with:
    - How to run local
    - How to migrate DB
    - How to seed demo user
    - How to deploy to Vercel
    - Environment variables
    - How to print correctly from browser
    - Note: disable browser default header/footer when printing if needed

---

## 14. Implementation requirements

Use clean architecture style where practical:

- `/app` for routes
- `/components` for UI
- `/lib` for shared utilities
- `/server` or `/services` for business logic
- `/prisma` for schema and seed

Prioritize working MVP over perfect architecture.

Code must be production-conscious:

- Type-safe TypeScript
- Basic error handling
- Loading states
- Empty states
- Form validation
- Server-side validation
- No hardcoded secrets
- Environment variables via `.env`

---

## 15. Suggested variable processing approach

Implement robustly:

1. When configuring template:
   - User selects text.
   - Find all exact matches in document HTML text content.
   - Wrap selected/included occurrences with span tags:

```html
<span data-var-id="..." data-placeholder-key="...">Original Text</span>
```

2. Store variable metadata in DB.

3. When creating case:
   - Load template HTML.
   - For each variable input, update all spans with matching `data-var-id`.
   - Preserve `data-original-value` if useful.
   - Final saved HTML should contain replaced values.

4. For highlighting:
   - Add temporary CSS class to spans of selected variable.
   - Next/Previous scrolls to matching span by index.

5. Before preview/print:
   - Remove temporary highlight classes.
   - Remove editor-only markers.
   - Use final cleaned HTML.
   - Render final cleaned HTML through shared `PrintableDocument` component.

---

## 16. Acceptance criteria

The MVP is successful when:

- I can login with demo user.
- I can upload a `.docx`.
- I can name and save a document template.
- I can select text in the document and configure it as a variable.
- I can see how many appearances that text has.
- I can navigate appearances with Next/Previous.
- I can save the configured template.
- I can see the template in the grid.
- I can create a new violation case from that template.
- I can enter a value for a variable once.
- All linked places in the document update immediately.
- I can manually edit the final document.
- I can preview the final document.
- I can print the final document.
- Printed output must match preview as closely as browser printing allows.
- I can run the app locally.
- I can deploy it to Vercel.

---

## 17. Development mode

Work step by step.

First:

1. Analyze requirements.
2. Propose architecture.
3. Confirm key libraries.
4. Then generate the project files.

When generating code:

- Do not skip important files.
- Do not leave TODO placeholders for core functionality.
- If a feature is too complex, implement the simplest working version.
- Prioritize upload → convert HTML → configure variables → create case → preview → print.

---

## 18. Important note for Claude Code

Do not over-engineer the MVP.

The first working version should focus on:

1. Login
2. Template grid
3. Upload `.docx`
4. Convert to HTML
5. Configure variables from selected text
6. Save template
7. Create violation case
8. Replace all linked occurrences
9. Manual edit
10. Preview
11. Print exactly like preview

Do not implement complex Word export unless the MVP above is already working.
