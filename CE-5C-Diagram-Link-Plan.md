# Customer Engagement — nối diagram với 5 Cs

Trạng thái: **đã làm xong mục 6 (2026-09-15)**, theo phương án mặc định cho Q-B và Q-C. Còn chờ Hao:
có xoá `public/ce_collaboration.png` không.

Trang: `portfolio/case-studies/customer-engagement.html`, §05 `#charter`, tab
*Collaboration & communication* (`#charter-panel-collab`).

---

## 1. Đã chốt (Hao, 2026-09-14)

- **Map theo tên 5 chữ C**, không theo 5 dòng hành động trong `public/ce_collaboration.png`.
- **Làm cách 1 + 2:** chip C trên diagram, cộng highlight hai chiều khi bấm.
- **Sửa thẳng vào trang**, không làm file `_preview-*.html`. Đây là ngoại lệ cho quy tắc
  preview-trước, chỉ áp dụng cho phần này.
- **Flow thật** (Hao kể, thay cho flow 3a/3b song song mà diagram hiện tại đang vẽ):
  1. Anh họp với sponsor, trình kế hoạch cải thiện và xin approval.
  2. Có approval rồi, anh gửi mail kết nối business owner và tool owner, rồi họp với họ cùng
     sponsor.
  3. Khi mọi thứ đã thống nhất và rõ ràng, anh đưa người vào từng khâu: interview, design,
     implement, test…
  4. Mỗi tuần họp sync ở cấp business, gồm sponsor, business owner, tool owner và anh.
  5. Từng đơn vị tự họp với cấp dưới của mình để làm việc.
- **Framework:** Gain, *The Collaborative Organisation: Beyond Tools, Time, and Space*
  (8/2/2022). https://www.thisisgain.com/post/the-collaborative-organisation-beyond-tools-time-and-space
  Bài không ghi tên tác giả, cũng không ghi nguồn gốc của mô hình.

## 2. Định nghĩa 5 Cs theo bài viết

Mô hình là các tầng xếp chồng. Cognizance và Communication là nền; ba tầng trên chỉ có được
khi nền đã có.

| C | Bài viết nói | Hiểu ngắn |
|---|---|---|
| Cognizance | "Without Cognizance, working together is a non-starter." | Các bên biết tới nhau và biết việc này tồn tại |
| Communication | "…they must know about each other … and they must be able to communicate." | Có kênh để nói chuyện với nhau |
| Coordination | "…very different objectives, but they are willing to adjust their objectives to not get in the way of each other." | Mục tiêu khác nhau, chỉnh để không vướng nhau |
| Cooperation | "…an objective that is intrinsically interesting to them, and together their aligned objectives lead to mutually satisfying outcomes." | Mục tiêu riêng nhưng cùng hướng, cả hai bên đều được lợi |
| Collaboration | "…a shared objective … a singular unified purpose." | Một mục tiêu chung duy nhất |

## 3. Mapping: năm bước của Hao sang năm chữ C, theo đúng thứ tự

| Bước | Chữ C | Vì sao |
|---|---|---|
| 1. Trình kế hoạch, sponsor approve | **C1 Cognizance** | Người trả tiền biết việc này tồn tại và đồng ý. Chưa có bước này thì chưa có gì để làm cùng nhau. |
| 2. Mail kết nối BO + TO, họp chung với sponsor | **C2 Communication** | Ba bên biết tới nhau và có một kênh chung. |
| 3. Đưa người vào interview, design, implement, test | **C3 Coordination** | Mỗi bên có phần việc và mục tiêu riêng, chia khâu để không giẫm chân nhau. |
| 4. Sync hằng tuần ở cấp business | **C4 Cooperation** | Mỗi bên giữ mục tiêu riêng, tuần nào cũng khớp lại để cùng ra một kết quả mà ai cũng được lợi. |
| 5. Từng đơn vị tự làm với cấp dưới, và các nhóm làm chéo giữa các bên | **C5 Collaboration** | Các nhóm làm việc cùng nhau cho một mục tiêu chung: công cụ mới. (Q-A: đã xác nhận có làm chéo) |

Khớp 1:1 và đúng thứ tự từ dưới lên, nên câu H3 "It follows the 5 Cs, bottom to top" đứng
được.

## 4. Câu hỏi còn lại

**Q-A. ✅ Đã trả lời (Hao, 2026-09-14): có làm chéo.** Giữ mapping 1:1 như mục 3.

~~Bước 5: các nhóm cấp dưới có làm việc chéo giữa các bên không?~~ Ví dụ designer bên
anh làm trực tiếp với dev bên tool owner, hay researcher làm trực tiếp với CC manager.
- Nếu **có**, bước 5 là Collaboration đúng nghĩa bài viết.
- Nếu **mỗi bên chỉ họp nội bộ**, thì bước 5 không phải Collaboration. Lúc đó phải chọn lại:
  Cooperation = bước 3, Collaboration = bước 4 (sync hằng tuần), bước 5 không mang chip.

**Q-B. Bước 3 là người của bên nào?** Theo §01, consultant team của anh làm audit và design,
còn tool owner "built what was asked for". Em hiểu: interview và design là team anh,
implement và test là bên tool owner. Anh xác nhận giúp em.
- Mặc định: ghi chung "interview, design, build, test", không gắn từng khâu cho bên nào.

**Q-C. Màu chip.**
- Mặc định: **một màu** (`--rd-primary`) kèm chữ C1–C5.
- Nếu anh muốn giữ 5 màu như ảnh cũ thì phải thêm 5 token mới.

## 5. Diagram mới (sẽ vẽ lại toàn bộ)

Ngang, lấp đầy khung, không đường nào cắt nhau:

```
[1 Plan to the sponsor] → [Approval gate] → [2 Connect BO + TO, meet with the sponsor]
    → [3 Staff the work: interview · design · build · test]
    → [4 Weekly business sync ⟲ sponsor · BO · TO · me]
    → [5 Each party runs its own team]  (tách ra 3 nhánh nhỏ: business team / tool team / my team)
```

- Approval vẫn là gate (viền ink, nền tint). Gate có thể là một box riêng hoặc là trạng thái
  của bước 1; chọn cách nào gọn hơn khi dựng.
- Bước 4 giữ vòng lặp EVERY WEEK.
- Bước 5 tách nhánh dùng lại kiểu fork vuông góc hiện có. Vì các nhóm có làm chéo (Q-A), các
  nhánh cần thêm đường nối giữa chúng, và đường đó không được cắt đường nào khác.
- Dòng phụ trong mỗi box nêu tên các bên, như bây giờ.
- Bỏ khung "AT THE SAME TIME" ở 3a/3b vì flow thật không có bước song song đó.

## 6. Việc cần làm

**Diagram** (`customer-engagement.html` + khối B5 `.rd-ceflow-*` trong `redesign.css`)
- Vẽ lại theo mục 5. viewBox rộng 1300, font label 16, note 14.5, tag 12, min-width 1100px.
  Xem memory `portfolio_ce_collaboration_flow.md`.
- Chip `C1`…`C5` ở mép trên của mỗi box, không đè chữ.
- Mỗi bước là một `<g data-c="n" tabindex="0" role="button" aria-pressed="false">`.

**Card 5 Cs**: thay PNG bằng HTML
- Năm hàng dạng bậc thang, C1 dưới cùng, C5 trên cùng. Trên mobile giảm độ thụt.
- Mỗi hàng là một `<button data-c>`, gồm chip, tên C, định nghĩa ngắn (viết lại bằng lời
  mình, không chép nguyên câu của bài) và việc anh đã làm ở bước đó.
- Viết lại đoạn "The 5 Cs Model", thêm một dòng ghi nguồn trỏ tới bài của Gain.
- Giọng văn theo `portfolio_case_study_voice.md` và `feedback_no_departure_phrasing.md`.
- `ce_collaboration.png` không còn dùng thì hỏi Hao trước khi xoá file.

**Đoạn văn dưới diagram**: kiểm lại cho khớp flow mới. Hiện nó không nói gì về 3a/3b nên
có thể giữ nguyên.

**Tương tác** (`js/ce-5c-link.js` mới, chỉ load trên trang này)
- Bấm, tap, hoặc Enter/Space trên một hàng C: bước tương ứng được highlight, các bước khác mờ
  còn ~35%.
- Bấm một bước trên diagram: highlight hàng C tương ứng.
- Bấm lại mục đang chọn hoặc nhấn Esc: về mặc định, tất cả hiện rõ.
- **Không dựa vào hover**, lý do xem `portfolio_case_component_variants.md`.
- Dưới 1100px khung diagram cuộn ngang: khi chọn C thì cuộn `.rd-figure-scroll` tới bước đó.
- Có `prefers-reduced-motion` thì bỏ transition.
- Thêm một vùng `aria-live="polite"`, đọc ra kiểu "Coordination: step 3".
- Thuộc tính SVG không đọc được `var()`, nên mọi màu đặt trong CSS.

**Kiểm tra**
- Width sweep 390 → 1920: không tràn ngang, lề trái các khối trùng nhau.
- Thử bằng bàn phím (Tab, Enter, Esc) và trên WebKit.
- Cập nhật `portfolio/.claude/memory/portfolio_ce_collaboration_flow.md`.
