# Portfolio — TODO theo batch

Cập nhật: 2026-09-10 (lần 2 — đã chốt thêm 7 quyết định). Nguồn: todo list của Hao +
đối chiếu code/tài liệu.

Cách dùng: mỗi batch là một lần gọi Claude Code độc lập. Tick `[x]` khi xong.
Batch nào ghi ✅ **song song được** thì chạy đồng thời với batch khác thoải mái;
batch nào ghi ⛔ thì phải chờ batch nó phụ thuộc.

---

## Quy tắc chung cho mọi batch

- Đọc `portfolio/CLAUDE.md` và `portfolio/.claude/memory/MEMORY.md` trước khi sửa bất cứ gì.
  ⚠️ **`portfolio/.claude/memory/` là kho memory DUY NHẤT của dự án này** — cả Claude Code
  lẫn Claude bên Cowork đều đọc từ đó. Cowork còn có một kho memory riêng của nó; **đừng
  ghi ghi chú dự án vào kho đó**, Claude Code không đọc được. Học được gì mới trong lúc
  chạy batch thì ghi thành file trong `portfolio/.claude/memory/` và thêm một dòng vào
  `MEMORY.md`.
- **Hỏi và được Hao đồng ý trước khi sửa file** (feedback_scope_discipline). Chỉ sửa
  đúng file mà batch nêu tên.
- Mọi con số lên trang phải truy được về `case study 1/`, `LM-LEGACY-UI-EVIDENCE.md`
  hoặc một doc research ở thư mục `Site/`. Không có nguồn thì không ship.
- Không có câu nào trên trang mô tả cách trang được làm ra (feedback_no_process_talk).
- **`css/styles/redesign.css` là file dùng chung — đây là điểm conflict duy nhất khi chạy
  song song.** Mỗi batch chỉ *append* vào một block có comment riêng ở cuối file, ví dụ
  `/* ===== B5 — Customer Engagement ===== */`. Không sửa rule của batch khác.
- Sandbox không render được. Muốn xem trang: double-click `preview.command`, rồi mở
  `http://localhost:8000`.

---

## Cách khởi động một batch

Mở Claude Code trong thư mục `portfolio/` rồi dán nguyên khối này, đổi mã batch:

```
Đọc TODO-BATCHES.md và .claude/memory/MEMORY.md trước.

Chạy batch B0. CHỈ B0 — không đụng file nào ngoài danh sách file mà B0 liệt kê.

Trước khi sửa bất kỳ file nào: trình bày plan và các thay đổi cụ thể, chờ anh
duyệt rồi mới sửa.

Xong từng mục thì tick [x] vào đúng dòng đó trong TODO-BATCHES.md.
Gặp chỗ nào cần anh quyết thì dừng lại hỏi, đừng đoán.
```

**Chạy song song:** mở nhiều cửa sổ Claude Code, mỗi cửa sổ một batch ✅. Chỉ cần nhớ
mỗi batch append vào block CSS có tên riêng của nó ở cuối `redesign.css`.

**Thứ tự nên bắt đầu:**

1. **B1** trước tiên — nó chặn cả chuỗi B2→B3→B4 (phần việc lớn nhất). Mở khoá B1 là
   mở khoá luôn nhánh healthcare.
2. **B9** song song — dựng xong 2 prototype thì Hao có cái để xem và chọn, không phải
   chờ tới lượt.
3. **B0 / B5 / B6 / B7 / B8** — chèn vào bất cứ lúc nào, độc lập hoàn toàn.

**Sau khi xong một batch:** nếu học được gì đáng nhớ (một bẫy, một quyết định, một ràng
buộc không đọc ra được từ code) thì ghi vào `.claude/memory/` và thêm dòng index — đừng
để nó chỉ nằm trong TODO-BATCHES.md, vì file này sẽ hết vòng đời khi các batch xong.

---

## Thứ tự chạy

```
B0 ──┐
     ├─> B1 ──> B2 ──> B3 ──> B4        (nhánh healthcare, tuần tự)
     │
     ├─> B5   Customer Engagement       ✅ song song
     ├─> B6   web-3                     ✅ song song
     ├─> B7   marketing-platform        ✅ song song
     ├─> B8   Resume                    ✅ song song
     └─> B9   Prototype role matrix     ✅ song song ──▶ Hao chọn A/B ──▶ B4 todo 4
```

---

## B0 — Quick wins ✅ song song

**File:** `index.html`, `about.html`, `case-studies/lending.html`, `css/styles/redesign.css`
**Phụ thuộc:** không

- [x] **(todo 5)** Hero của `lending.html` bị lệch → canh giữa. Hero dạng này về sau
      mặc định là center, sửa ở cấp component chứ không patch riêng 1 trang.
- [ ] **(todo 9)** Ảnh trong card ở homepage bị crop quá sâu. Xem lại `object-fit` /
      `aspect-ratio` của card, đề xuất tỉ lệ phù hợp rồi báo Hao trước khi chốt.

      **Đã đo (2026-09-10), đang chờ Hao chốt.** Slot ảnh desktop là 321×770
      (tỉ lệ 0.42) trong khi mọi cover đều nằm ngang (1.13 → 3.00). Phần ảnh
      còn thấy theo chiều ngang: `cv_lending` 37%, `cv_web3` 14%,
      `cv_pharma` 26%, `cv_enterprise` 27%.

      | Hướng | Slot | visW |
      |---|---|---|
      | giữ nguyên | 321×770 (0.42) | 14–37% |
      | body 544→400, giữ bleed | 465×770 (0.60) | 20–54% |
      | 4:5, ảnh canh giữa cột | 321×402 (0.80) | 27–52% |
      | xuất asset dọc mới ~2:5 | khớp slot | 100% |
- [x] **(todo 11.2)** Badge chứng chỉ ở `about.html` (5 badge Credly, dòng 262–276)
      phải nằm trên **1 dòng** khi xuống mobile.
- [x] **(todo 12)** Thêm icon "còn scroll được" ở góc dưới trái hero của homepage và
      about. Tham khảo https://codepen.io/deepakkv/pen/WwmjKQ — viết lại bằng CSS thuần
      theo token của redesign.css, không copy nguyên.
- [x] **(todo 10)** Badge năm bị lệch khi expand "Scope of work" — `about.html`,
      section *Professional Journey* (`.rd-journey-section`, dòng 77).

      **Triệu chứng (so 2 ảnh chụp cùng vị trí scroll):**
      - *Chưa expand:* cả 5 badge năm nằm **thẳng một hàng ngang** ở đầu stack —
        `JAN 2026` · `OCT 2021` · `FEB 2020` · `AUG 2019` · `DEC 2018`.
      - *Đã expand:* hàng chỉ còn 4 badge, `DEC, 2018 – MAR, 2019` **tụt xuống**
        một bậc và dính theo mép trên card của nó, không còn nằm trong hàng.

      ✅ **Yêu cầu của Hao: sau khi expand, các badge phải nằm y như lúc chưa expand
      — vẫn thẳng một hàng.**

      **Nguyên nhân — đã khoanh vùng bằng cách loại trừ trong `js/journey.js`:**
      Mọi card dùng chung `position: sticky; top: var(--rd-journey-top)`, nên bình
      thường tất cả dock ở cùng một y và các badge (inset 24px so với mép trên card)
      tự nằm thành một hàng. `update()` chỉ đổi **trục X** của badge qua `--rd-tag-x`.
      → Thứ **duy nhất** trong code có thể đổi y dock của một card là hàm
      **`liftIfTallerThanViewport()`**:

      ```js
      var available = window.innerHeight - STICKY_TOP;
      var overflow  = height - available;
      card.style.top = overflow > 0 ? STICKY_TOP - overflow + 'px' : '';
      ```

      Khi expand làm card cao hơn viewport, hàm này **kéo sticky line của riêng card
      đó lên** để đáy card còn với tới được. Hệ quả: card đó dock ở một y khác mọi
      card còn lại, badge của nó đi theo → hàng badge gãy thành bậc thang.

      Hàm này **có lý do tồn tại** (card cao hơn viewport thì đáy sẽ vĩnh viễn nằm
      ngoài màn hình) nên **không được xoá thẳng**.

      **Hai hướng sửa — chọn (a) nếu có thời gian:**
      - **(a) Sửa gốc:** tách year strip ra khỏi card. Cho hàng badge thành **một
        element sticky riêng** ở một y cố định, không phụ thuộc top của từng card.
        Lúc đó card lift bao nhiêu cũng không ảnh hưởng hàng badge nữa.
      - **(b) Sửa tối thiểu:** giữ nguyên lift, nhưng **dịch ngược badge lại đúng
        bằng `overflow`** (translateY) để nó ở lại trên đường chung trong khi card
        đi lên.

      - [x] Phụ: trong handler của nút show-more, sau khi đổi chiều cao chỉ gọi
            `positionMarkers()` và `update()`, **thiếu `measureTags()`**. Hiện chưa
            gây lỗi (expand không đổi bề rộng pill), nhưng thêm vào cho nhất quán
            với `onResize()`.
      - [x] ⚠️ **Reproduce trước khi sửa.** Sandbox không render được: double-click
            `preview.command`, mở `http://localhost:8000/about.html`, expand FPT
            Software rồi scroll — xác nhận đúng cơ chế trên trước khi đụng code.
      - [x] Nghiệm thu: expand **bất kỳ** card nào (kể cả card cao nhất), scroll lên
            và xuống — 5 badge luôn nằm trên **một hàng ngang duy nhất**, không badge
            nào chồng badge khác, và đáy của card đang expand vẫn scroll tới được.
      - [x] Kiểm cả dưới breakpoint `1180px` (`DISABLE_BELOW = 1181`) — dưới ngưỡng
            này stack bị tắt, đừng để bản sửa làm hỏng nhánh đó.

---

## B1 — Shared component 4 variants + before/after slider ⛔ chặn B2

**File:** `css/styles/redesign.css`, `js/` (file mới), Figma node `40000532-8146`
**Phụ thuộc:** không — nhưng **B2 phải chờ batch này xong**

### Cấu trúc component (Hao chốt 2026-09-10)

Một component, **4 variants**. **Ảnh nằm bên phải và giữ nguyên ở mọi variant.** Phần
**nội dung bên trái** đổi theo variant:

- Trên: Heading + Text (giống nhau ở cả 4 variant)
- Dưới: block thông tin — chỉ khác nhau ở **kiểu display**:

| Variant | Kiểu display | Đã có sẵn ở đâu |
|---|---|---|
| V1 | Collapsible — problem & solution | mới |
| V2 | Grid 4 block, mỗi block icon + text | `web-3.html` đã có |
| V3 | List item | `lending.html` đã có |
| V4 | List item + icon, **hover đổi ảnh bên phải** | `lending.html` đã có (`data-picker`) |

V4: hover vào dòng nào thì ảnh bên phải đổi sang ảnh tương ứng của dòng đó — đúng hành vi
đang chạy ở `lending.html`, tái dùng nguyên cơ chế `data-picker` / `data-image`.

- [x] Đọc Figma node `40000532-8146` lấy spec. Lưu ý: `get_metadata` /
      `get_design_context` hay fail trên node lớn → dùng `get_screenshot` nếu fail.
- [x] Dựng component với 4 variant ở trên. V2/V3/V4 **tái sử dụng** markup và CSS đang có
      (`.rd-case-checklist`, `.rd-case-checklist-row`, `data-picker`), không viết lại từ đầu.
- [x] **(todo 1.1)** Before/after image slider. Vanilla JS, không thư viện:
      `clip-path` + `input[type=range]`, hỗ trợ cả touch. ~60 dòng.

### Quy tắc ảnh (Hao chốt)

Ảnh dùng cặp `_old` / `_new` **có sẵn trong `public/`**, không tạo mới.

| Ảnh | Có `_old`? | Dùng cho |
|---|---|---|
| `hc_budget_old` / `hc_budget_new` | ✅ | **Variant có before/after slider** |
| `hc_program_old` / `hc_program_new` | ✅ | **Variant có before/after slider** |
| `hc_search_old` / `hc_search_new` | ✅ | **Variant có before/after slider** |
| `hc_speaker_old` / `hc_speaker_new` | ✅ | **Variant có before/after slider** |
| `hc_repdashboard_new` | ❌ | **Là feature MỚI** → map vào variant **không có** before/after |
| `hc_venue_new` | ❌ | **Là feature MỚI** → map vào variant **không có** before/after |

**Quy tắc chung: không có bản `_old` nghĩa là feature mới — dựng nó bằng variant không có
before/after.** Không bao giờ ghép đại một ảnh `_old` của feature khác vào.

- [x] Điều kiện bắt buộc cho slider: 2 ảnh trong một cặp phải **cùng kích thước, cùng
      crop**. Lệch 1px là lộ ngay. Kiểm tra trước khi wire.

      **Kết quả kiểm (2026-09-10).** Cả 10 file đều đúng 1420×1004, nhưng cùng
      size ≠ cùng crop: `_old` là app cũ (sidebar tối 175–193px, topbar 85px),
      `_new` là bản redesign (sidebar sáng 238px, topbar 67px) → kéo wipe qua
      giữa thì sidebar nhảy bậc, header đổi chiều cao. Chỉ cặp `search` khớp.
      ✅ **Hao chốt: để nguyên, sau này export lại rồi tự override.** Tên file
      giữ nguyên nên markup không phải sửa. Không thiết kế né chỗ lệch này.

- [x] ⚠️ **Ảnh healthcare phải redact trước khi lên `public/`**
      ✅ **Hao xác nhận 2026-09-10: 10 file `hc_*` trong `public/` đã masked, data
      đều là fake — dùng thoải mái.** Nhìn bề mặt thì `hc_speaker_old` có tên bác
      sĩ + NPI, `hc_program_old` có tên nhân sự, `hc_budget_old` có số ngân sách,
      cả 3 có logo Genentech/Roche — **đó là sample data đã che, đừng raise lại**
      và đừng tự blur/crop.
      Cảnh báo ở `LM-LEGACY-UI-EVIDENCE.md` A.2 vẫn đúng cho **40 ảnh gốc** trong
      `case study 1/`; 10 file này là bản dẫn xuất đã masked, là ngoại lệ.

### Kết quả B1

Preview: `case-studies/_preview-case-component.html`
→ `http://localhost:8000/case-studies/_preview-case-component.html`

**Vòng 2 (2026-09-10) — 7 điểm Hao review, đã sửa hết:**
1. Panel phải lấy đúng giá trị đang live (`padding: 40px 0 0 40px`, `margin-top:
   40px`, hairline `--rd-border-soft`, `radius: 16px 0`) thay vì số của Figma
   (24px / 113px / không border). Cột trái dùng `.rd-case-features-body` đang
   live. → **Figma quyết structure, không quyết inset. Xem trang live trước.**
2. Núm slider có icon: 2 chevron trỏ về 2 nửa. Cần `flex: 0 0 auto` vì handle là
   đường flex rộng 2px, không có thì vòng tròn bị bóp còn 33px.
3. V3 clickable như trên `lending.html` — `data-picker` + rows `is-selectable`.
   V3 và V4 giờ chỉ khác nhau ở cái icon.
4. Bỏ gap trong cụm problem/solution: `.rd-case-accordion` phải `display: block`,
   cùng một bẫy với grid của V2.
5. Type + màu về đúng token: mọi font-size/weight/line-height là `--rd-*`, mọi
   padding/margin/gap/radius trên ladder `--m-*`/`--p-*`/`--r-*`, **không còn hex
   thô**. Scrim dùng dạng `rgba(10, 42, 48, α)` như `.rd-bench-*` đang dùng.
6. Ảnh đã masked → hết chặn.
7. Crop lệch → để nguyên.

**Vòng 3 (2026-09-10):**
- **Tỉ lệ ngang đã đồng nhất** — đo được `1 : 1.5` (508 : 762 trên card 1312px)
  y hệt `lending.html`, `customer-engagement.html`, `case-study-framework.html`.
  Preview trước render card 1376px vì dùng `max-width` riêng; đã bọc lại bằng
  đúng shell live (`.rd-case-section > .rd-case-inner.rd-shell`) → giờ đúng 1312.
- **Bỏ gap 40px** giữa 2 cột: `.rd-case-split.is-media { gap: 0 }`. Panel vẫn
  giữ inset 40px của nó nên chữ không chạm ảnh.
  ⚠️ **Đây là rule dùng chung, chạm 4 trang live** (lending, customer-engagement,
  case-study-framework, healthcare). Mới chỉ áp trong preview — **cần Hao gật
  trước khi đưa vào `redesign.css`.**
- **Đánh giá remap (Hao hỏi):** CSS thì ổn — `.rd-case-split.is-media`,
  `.rd-case-checklist`, `.rd-case-grid` mỗi cái chỉ tồn tại 1 chỗ trong
  `redesign.css`. **JS thì không:** logic picker nằm ở **4 chỗ** —
  `js/case-picker.js` (bản mới, có nhánh embed; dùng bởi lending / healthcare /
  customer-engagement) + **3 bản copy inline giống hệt nhau của bản CŨ** ở
  `case-study-framework.html`, `marketing-platform-v3.html`, `web-3-v3.html`.
  → Thêm hover vào `case-picker.js` chỉ tới được 3 trang, 3 trang kia im lặng bỏ qua.

  **Thứ tự phải làm, trước khi tích hợp B1:**
  1. Xoá 3 bản inline, cho 3 trang đó load `js/case-picker.js`. (Bản chung là
     superset nên về lý là no-op — nhưng phải kiểm `case-study-framework.html`
     trước, trang đó có 2 picker và 1 iframe cùng khu.)
  2. Đưa hover **vào thẳng `js/case-picker.js`**, không tách file mới — hover giờ
     là một phần của "picker", tách ra là tái tạo đúng cái vừa dọn.
  3. Chỉ slider mới cần file riêng `js/case-compare.js`.

  Làm bước 1 trước bước 2. Thêm hover trước là làm chỗ lệch nặng thêm.

**Vòng 4 (2026-09-10) — Hao duyệt cả hai, ĐÃ TÍCH HỢP:**

- CSS → block `B1 —` cuối `css/styles/redesign.css`. `.b1-*` không lọt vào file
  chung (`.b1-head` đã đổi tên thành `.rd-case-panel-head`).
- `gap: 0` cho `.rd-case-split.is-media` → áp cho **7 trang** có split này.
- Hover vào thẳng `js/case-picker.js`. File mới `js/case-compare.js` cho slider.
- Xoá 3 bản inline. `case-study-framework` + `marketing-platform-v3` giờ load
  `js/case-picker.js`; `web-3-v3` **không có markup picker nào** → dead code,
  xoá luôn không thay thế.
- Preview giờ chỉ còn markup, không tự style → không thể lệch khỏi trang thật.

⚠️ **Khác biệt thật giữa 2 bản JS** (phải kiểm trước khi swap, không phải no-op
vô điều kiện): row **không có `data-image`** → bản chung hiện iframe, bản cũ
không làm gì. Đã audit: framework (4+4 row) và marketing-platform-v3 (4+3+2) đều
có `data-image` đủ nên swap an toàn.

**Nghiệm thu:** dựng lại nguyên bản "trước" ở port riêng rồi so từng trang.
7 trang + preview, Chromium **và** WebKit: ratio vẫn `1.5`, gap `0`, 0 bản
inline còn lại, hscroll 0, 0 pageerror. Card `lending` trước/sau chỉ khác đúng
chỗ mép panel dịch vào 16px — không gì khác.

Toàn bộ CSS + JS nằm trong file preview; **`redesign.css` và `js/` chưa bị đụng**
(feedback_preview_before_integrating). Sau khi Hao chốt 4 variant thì mới bê CSS
vào block `/* ===== B1 ===== */` cuối `redesign.css` và tách JS ra
`js/case-compare.js` — **B2 chờ bước đó**.

Ghi chú đã lưu vào memory: `portfolio_case_component_variants.md`,
`portfolio_case_split_body_grid_trap.md`,
`portfolio_healthcare_before_after_images.md`.

---

## B2 — Healthcare: structure + AI section ⛔ chờ B1

**File:** `case-studies/healthcare.html`, `js/ai-accelerate.js`, `js/ai-accelerate-v2.js`,
`css/styles/redesign.css`
**Phụ thuộc:** B1

### Structure

- [ ] **(todo 3.1)** Gộp band "Healthcare in US" (dòng 133) + problems carousel (dòng 159)
      thành **1 section, 100vh**.
      ✅ **Hao chốt: 100vh chỉ ở desktop.** Mobile để scroll tự nhiên — band + carousel 3
      slide không nhét vừa một màn hình điện thoại.
- [ ] **(todo 3.2)** Icon dấu ngoặc kép trong quote đang sai hướng → sửa.
- [ ] **(todo 1.2)** Sau khi B1 xong, rà lại section Figma `40000577-459` và chỉnh trang
      cho khớp component mới.

### AI section

Hiện có **2 section**: `#ai-accelerate` (dòng 803, mở đầu bằng H2 *"The shape didn't
change. AI just carries more of it now."*) và `#ai-accelerate-v2` (dòng 935).

- [ ] **(todo 3.3.7 + 3.3.3)** Bỏ `#ai-accelerate-v2`, **giữ `#ai-accelerate`**. Nhưng
      trước khi xoá phải **cứu nội dung**: v2 đang chứa Layer 5 — *"The model — The whole
      loop, drawn as a git flow"* (dòng 1206–1221) và 3 layer khác (design branch; handoff
      4 artifact → 1; gate 10 reconciliation check).
- [ ] **(todo 3.3.3)** Hao chốt: **kết hợp nội dung của AI section vào section "The model —
      The whole loop, drawn as a git flow"**, rồi đưa cả cụm đó vào `#ai-accelerate`.
      Trước khi viết, đọc cả 2 section và liệt kê nội dung nào trùng, nội dung nào tái dùng
      được — báo Hao rồi mới viết.
- [ ] Kể lại mạch cho mượt: bắt đầu từ "hình dạng công việc không đổi" → git flow là hình
      dạng đó → AI gánh phần nào trong từng nhánh. Đề xuất mạch cụ thể cho Hao duyệt.
- [ ] **(todo 3.3.1)** Thêm thông tin vào **step 1**, và thông tin đó **biến mất ở step 2**.
- [ ] **(todo 3.3.2)** Chuyển AI section xuống **dưới section "what not to build first"**.
- [ ] **(todo 3.3.4)** Câu *"The shape didn't change. AI just carries more of it now."*
      → viết lại cho ăn khớp với section ngay trên nó sau khi đã đổi thứ tự.
- [ ] **(todo 3.3.5)** Hai câu này phải **dynamic theo pill**, không hiện cùng lúc:
      - Not critical: *"AI owns the path, the customer owns the gate."*
      - Critical: *"a human owns every decision, AI owns the labour."*
- [ ] **(todo 3.3.6)** Bỏ hết mũi tên trên các hình tròn. Ở step cuối khi chỉ còn 2 hình,
      cho 2 hình đó **sát nhau**.

### Mobile (todo 7) — nằm trong batch này vì cùng component `.rd-ai-panel-col`

- [ ] Thêm `border-top-right-radius: 16px;` vào
      `.rd-ai-panel-col:first-child .rd-ai-panel-head`
- [ ] "Discovery, validate, and experiment" → **expanded by default**. Bấm mở section kia
      thì cái này collapse, để tối đa không gian mobile. Transition phải mượt.

### ⚠️ Lưu ý kỹ thuật

`js/ai-accelerate.js` dùng `document.querySelector` (first-match, không scope) cho
`.rd-ai-accelerate`, `.rd-ai-toggle`, `[data-ai-panel]`. Khi xoá v2 xong: xoá luôn
`js/ai-accelerate-v2.js` và thẻ `<script>` của nó, giữ `ai-accelerate.js`. TOC không đổi.

---

## B3 — Healthcare: "what not to build first" ⛔ chờ B2

**File:** `case-studies/healthcare.html` (section `#decision`, dòng 496), `redesign.css`
**Phụ thuộc:** B2 — ✅ **B2 đã xong 2026-09-10** (xác nhận bằng code: chỉ còn 1
`#ai-accelerate`, `js/ai-accelerate-v2.js` đã xoá, section đã nằm sau `#decision`;
ghi chú đầy đủ ở `.claude/memory/portfolio_healthcare_v3_additions.md`).
⚠️ Các checkbox của B2 ở trên **chưa ai tick** — công việc đã làm, chỉ là file này
chưa cập nhật. Đừng chạy lại B2.

### 🟡 Trạng thái B3 (2026-09-10, phiên chạy theo lịch — KHÔNG có ai trực)

Component **đã dựng xong và đã verify**, nhưng **chưa tích hợp**: luật dự án là
hỏi trước khi sửa file (`feedback_scope_discipline`) và dựng preview trước khi
tích hợp (`feedback_preview_before_integrating`). Phiên này chạy tự động nên
**`healthcare.html` và `redesign.css` chưa bị đụng một dòng nào.**

**Xem thử:** `http://localhost:8000/case-studies/_preview-b3-decision.html`
(file mới: `case-studies/_preview-b3-decision.html` + `_preview-b3-decision-data.js`)

**Đã verify (Chromium, full stylesheet chain):** card đo đúng **1312px** — bằng
`healthcare.html` và các trang case khác; **hscroll = 0** ở 1440 và 390; 0 pageerror;
click phase đổi đúng cả 3 vùng (title / checklist / MoSCoW); mọi `var()` đều resolve;
**không thêm token mới**, không có hex thô nào ngoài thanh preview.

**Cần Hao duyệt 3 thứ trước khi bê vào trang:**
1. **Lời card của 5 phase** (`lede`) — đề xuất, chưa ai duyệt (todo 3.4.3).
2. **Nội dung MoSCoW** — 4 tier × 5 phase. Must/Should/Could bám theo 13 workflow
   area + tài liệu STARS; **Won't** là phần diễn giải nhiều nhất, đọc kỹ chỗ này.
3. **Tỉ lệ cột 1:1.** `.rd-case-split.is-media` của B1 là `1 : 1.5` vì cột phải là
   ảnh; ở đây cột phải là chữ nên đang để 1:1. Nếu muốn đồng bộ thì nói.

✅ **Hao chốt: timeline theo PHASE / RELEASE, không theo quý** (không có data theo quý).
Dùng 5 hạng mục MVP đã nằm trên trang (dòng 521–526) làm các mốc:

```
01 Program request — raise it, route it, approve it
02 Budget — top-down allocation and bottom-up charges
03 Speaker nomination and contracting
04 Event day — check-in, sign-in sheet, attestation
05 One program record all seventeen roles read
```

- [x] **(todo 3.4.1)** Thanh trên cùng là **timeline theo phase** — tái sử dụng component
      marketshare của lending (`.rd-market`).
- [x] **(todo 3.4.2)** Timeline **clickable**: click vào một phase → phase đó sáng lên,
      đồng thời đổi nội dung của card và của feature prioritization.
- [ ] **(todo 3.4.3)** Tái sử dụng card của lending nhưng **đặt bên trái**. Card hiển thị
      thông tin của phase đang chọn — đề xuất nội dung cho Hao duyệt trước khi viết.
- [x] **(todo 3.4.4)** Feature prioritization = **MoSCoW**. *(dựng xong — nội dung chờ duyệt)*
      **Chốt: code, không dùng ảnh** — vì nội dung phải đổi theo click timeline, dùng ảnh
      thì phải xuất 5 file và không responsive được. CSS grid 4 ô + data attribute.
- [ ] **(todo 3.4.5)** Rà lại wording của cả section cho khớp thiết kế mới, nêu chỗ nào
      cần sửa.
- [ ] ⚠️ Câu chốt của section phải giữ được: *Budget không nằm cuối* — allocation và
      charges gánh cả bản ghi, để lại sau là phải xây lại quanh nó. Đây là lý do thứ tự
      phase là thứ tự này chứ không phải thứ tự khác.

---

## B4 — Healthcare: nội dung & bằng chứng ⛔ chờ B3

**File:** `case-studies/healthcare.html`
**Phụ thuộc:** B3 (cùng file)

✅ **Hao xác nhận: data healthcare là DATA THẬT, không phải dev seed.** Điểm chặn lớn nhất
của batch này đã gỡ. Nhãn dùng cho mọi con số lấy từ bộ 40 ảnh: `observed in client system`
(Hao quan sát hệ thống của khách, không tự đo) — **không phải** `measured`.

- [ ] **(todo 6)** Thêm key finding mới: **checklist bị miss**. Định nghĩa auto-check, đưa
      ra màn hình chính, custom theo từng role — thay vì phải vào tận trong program mới
      check được.
      Data dùng (đã trên trang, dòng 276–288):
      - **41** notes trên một program trung bình, rải qua 7 luồng riêng
      - **86%** program vẫn còn một stage checklist chưa xong, đếm ở ngày làm việc thứ 251
        sau sự kiện → **đây là câu chốt của finding, mạnh nhất trên trang**
- [ ] ✅ **Chốt mâu thuẫn 48 vs 28: dùng 28, bỏ 48.**
      **28 = 6 mục ở bước Pending + 22 mục ở bước Confirmed**, đếm trực tiếp từ image 35,
      có nguồn ghi trong `LM-LEGACY-UI-EVIDENCE.md`.
      Lý do chọn 28 dù nhỏ hơn: nó **truy được về một ảnh cụ thể**, còn 48 chỉ ghi chung là
      "client system" và không có dòng nào trong tài liệu chống lưng. Luật của dự án là
      traceability thắng độ to của con số.
      Cách viết đề xuất: *"28 bước thủ công cho một program"* — proxy cho công sức của
      coordinator, mạnh hơn nhiều so với câu "hệ thống cũ khó dùng".
      - [ ] Sửa cả 3 chỗ đang ghi 48 (dòng ~283 và mọi chỗ khác — grep `48`).
- [ ] **(todo 4)** Visualize role & permission — **CHỈ LÀ BƯỚC TÍCH HỢP.**
      Việc dựng nằm ở **B9** (2 prototype rời). Batch này chỉ nhận bản Hao đã chọn và
      gắn vào `healthcare.html`, thay cho ảnh strip `public/hc_map_roles.webp`.
      ⛔ **Không làm gì cho tới khi B9 xong và Hao chốt A hay B.**
- [ ] **(todo 15)** ✅ **Hao chốt: bỏ hẳn con số user story (496).** Nó chỉ là khối
      lượng công việc, không có value. Dùng data khác thay vào, thoải mái.

      ⚠️ **Đây KHÔNG phải một phép thay số. 496 đang xuất hiện ở 2 loại vị trí khác
      nhau, và mỗi loại xử lý một kiểu:**

      **(A) Chỗ 496 chỉ là con số headline → thay bằng metric có value**
      Dòng 34 (`og:description`), dòng 60, dòng 1169.
      **Chốt dùng: `38 loại chứng từ phải upload cho một program`**
      (image 31, mục *Awaiting Upload*, nhãn `observed in client system`).
      Lý do: nó kể được gánh nặng compliance — tức là *tại sao* việc này khó — chứ
      không phải kể có bao nhiêu việc. Đúng cái Hao muốn.
      Dự phòng nếu 38 không hợp ngữ cảnh câu: **28 bước checklist thủ công**,
      **17 dòng chi phí / program**, **91 speakers**, **323 curricula**.

      **(B) Chỗ 496 đang là XƯƠNG SỐNG CỦA LẬP LUẬN → không thay số, viết lại câu**
      Dòng 492–493:
      > *"A 496-story backlog across 17 roles isn't a ranking problem. No ordering of
      > 496 items gives you a release that hangs together…"*

      Câu này cần một đại lượng "đống việc lớn không phân hoá", nhét 38 chứng từ vào
      là vô nghĩa. **Viết lại dựa trên `17 role × 13 workflow area`** — con số này đã
      có sẵn trên trang, chính là hình dạng thật của vấn đề, và giữ nguyên được lập
      luận: cắt theo role thì flow cụt ở chỗ approval, cắt theo feature thì module
      không có gì để gắn vào.

      Dòng 792 (bài học):
      > *"496 stories, and I never asked for the baseline."*

      Bài học ở đây là **không đi hỏi baseline**, không phải con số. Viết lại bỏ số:
      giữ ý "spec dày — as-is và to-be cho cả 17 role — nhưng dày không đồng nghĩa
      với đã được chứng minh".

      - [ ] `grep -n "496" case-studies/healthcare.html` — xử lý hết, không sót.
            ⚠️ **Đã grep sẵn 2026-09-10 — có 6 chỗ, không phải 5.** Danh sách trên
            thiếu **dòng 1194**: *"lines of a running multi-tenant prototype, against a
            496-story backlog (counted)"*. Chỗ này thuộc loại **(B)** chứ không phải (A):
            496 đang là mẫu số của một tỉ lệ, thay số vào là câu vô nghĩa — phải viết lại.
            Đủ 6 chỗ: **34 · 60 · 502 · 503 · 1194 · 1704**.
      - [ ] ⚠️ **Số 48 chỉ có ĐÚNG 1 chỗ (dòng 292), không phải 3.** Ghi chú "sửa cả 3
            chỗ" ở trên sai. Chỉ một `<strong>48</strong>` trong khối `.rd-ai-evi`;
            mọi `48` còn lại đều là `viewBox="0 0 48 36"` của icon ngoặc kép.
      - [ ] Sau khi sửa, đọc lại dòng 492–493 và 792 **thành tiếng**: câu vẫn phải
            đứng vững mà không cần con số nào.
- [ ] **(todo 17c)** Thêm **chart** cho healthcare. Chọn:
      **Phân bố program theo tháng, 2026** (image 21, tổng 120):
      `3 · 13 · 17 · 20 · 32 · 18 · 10 · 3 · 2 · 1 · 1 · 0`
      → đỉnh tháng 5 (32) gấp hơn 10 lần tháng thấp nhất. Kể được câu "tải việc của
      coordinator dồn cục", và nối thẳng vào finding checklist ở trên.
      - [ ] ⚠️ Ảnh chụp ~tháng 7/2026 → **các tháng cuối năm chưa đủ dữ liệu**. Phải nói rõ
            trên chart hoặc chỉ vẽ tới tháng 7, không để người đọc tưởng cuối năm hết việc.
      - [ ] Data dự phòng nếu muốn chart thứ hai: **phân bố theo bureau 2026** (image 18,
            18 bureau) — Ocrevus HCP 31, Ocrevus Patient 21, Lung Pan Tumor 16, Xolair 13,
            Hemlibra HCP 11… và **6 bureau = 0**.
      - [ ] ⚠️ **Không** gọi 3.84 / 11.78 là "approval cycle time". Đó là SIS = sign-in
            sheet, nằm ở **cuối** vòng đời program, không phải approval ở đầu. Nếu dùng phải
            gọi đúng tên: *"đối soát giấy điểm danh sau chương trình mất trung bình 11.78
            ngày làm việc"*.
      - [ ] ⚠️ Trang hiện **không nêu tên Genentech**. Giữ nguyên trừ khi Hao cho phép.
- [ ] **(todo 2)** *Chạy cuối cùng, sau khi B2–B4 xong.* Đối chiếu phần findings với UI mới
      xem UI có thật sự kể được problem → solution không. Đây là task **review**, xuất ra
      nhận xét, không sửa gì trước khi Hao đọc.

---

## B5 — Customer Engagement ✅ song song

**File:** `case-studies/customer-engagement.html`, `redesign.css`
**Phụ thuộc:** không

### Section COLLABORATION & COMMUNICATION — làm lại (todo 16.1 + 16.3 gộp)

✅ **Hao chốt hướng: visualize communication flow bằng sequence diagram** — kiểu sơ đồ có
các actor làm cột dọc, thời gian chảy từ trên xuống, mũi tên có nhãn đi giữa các cột
(reference: sơ đồ MCP client/server của Anthropic mà Hao gửi).

- [x] **(todo 16.3)** **Move section này lên TRƯỚC section approach.** Đây là selling point
      chứ không phải phụ lục.
- [x] **(todo 16.1)** Kể **độ phức tạp thật** trước, **5C framework sau**. Hiện đang show
      framework ngay từ đầu — đảo lại: diagram cho thấy vấn đề phối hợp phức tạp cỡ nào,
      rồi 5C mới xuất hiện như câu trả lời.
- [x] **(todo 16.2)** ✅ **Hao đã cấp flow thật (2026-09-10) — vẽ đúng theo đây, không
      tự chế thêm bước:**

      **4 lane:** `Hao (PM)` · `Sponsor` · `Business Owner` · `Tool Owner`

      ```
      1. Hao ──proposal──▶ Sponsor
      2. Sponsor ──approval──▶ Hao                        [gate: không approve thì dừng]

         ┌─ SONG SONG ────────────────────────────────────────────────┐
      3a │ Hao ◀──▶ Business Owner                                    │
         │   đào sâu: nhu cầu · pain point · định hướng của họ        │
      3b │ Hao ◀──▶ Tool Owner                                        │
         │   chuẩn bị & phối hợp implementation                       │
         └────────────────────────────────────────────────────────────┘

      4. Khi cả hai bên đã ok → MEETING CHUNG 3 BÊN
         Sponsor + Business Owner + Tool Owner → all on the same page

      5. ┌─ LẶP hằng tuần ─────────────────────────────────────────────┐
         │ Weekly update meeting giữa các bên                          │
         └─────────────────────────────────────────────────────────────┘
      ```

      **Ba thứ phải giữ được khi vẽ — đây chính là "độ phức tạp" mà section cần kể:**
      1. **Approval là một gate thật**, không phải một mũi tên trang trí. Không có nó
         thì không có bước nào phía sau.
      2. **Bước 3a và 3b chạy SONG SONG** — Hao giữ hai cuộc trao đổi khác nhau, với
         hai bên có mối quan tâm khác nhau, cùng lúc. Vẽ hai mũi tên rời từ cùng một
         mốc thời gian trên lane của Hao. **Đừng vẽ thành chuỗi tuần tự** — vẽ tuần
         tự là mất đúng cái điểm khó của dự án.
      3. **Bước 5 là vòng lặp**, không phải một sự kiện. Vẽ bằng khối bracket có nhãn
         "weekly", không phải một mũi tên.

      Đối chiếu tên gọi và mốc thời gian với
      `Customer-Engagement-Research-and-Intake.md` (có cột Nguồn cho từng figure) và
      `case study 1/CustomerCare/` trước khi đặt nhãn lên diagram.
- [x] Vẽ bằng **inline SVG theo token của redesign.css**, không dùng ảnh raster.
      ⚠️ Bẫy đã biết (`portfolio_benchmark_component.md`): **thuộc tính SVG không đọc được
      `var()`** — màu phải set qua CSS property hoặc ghi giá trị thật, không nhét `var()`
      vào attribute `fill=`/`stroke=`.
- [x] ⚠️ Mobile: sequence diagram 5–6 cột là rất rộng. Tái dùng pattern
      `.rd-figure-frame` / `.rd-figure-scroll` (đã dùng cho role header row ở healthcare)
      để scroll ngang, **hoặc** đổ thành list dọc theo bước khi ≤768px. Đừng scale nhỏ lại
      — nhãn chính là nội dung.

### Chart

- [ ] **(todo 17a)** ⏭️ **BỎ QUA — Hao chốt 2026-09-10.** Chart hiện chưa hấp dẫn, visualize chưa tốt → làm lại.
      Data đã verify: **6.2 → 3.6 phút, −42%**.
      ⚠️ **Không bao giờ dùng con số 34%.**
      ⚠️ **`Customer Engagement/[HR Campaign] Survey Report.pdf` là tool khác** — số trong
      đó tuyệt đối không được lên trang này.

---

## B6 — web-3 ✅ song song

**File:** `case-studies/web-3.html`, `redesign.css`
**Phụ thuộc:** không

- [x] **(todo 8)** `web-3.html` là file **cần sửa**. Các bản `web-3-v2 … v5` chỉ là bản
      nội dung, **không đụng vào**.
- [x] Style mới nhất = **cả `healthcare.html` và `lending.html`**. Text, style, spacing
      trong `redesign.css` là thứ phải dùng chung cho case web3.
- [x] Đọc design mới trên Figma: node `40000586-5147`
      (https://www.figma.com/design/R2444s7q1V2Rp7Ubd6l5BH/Wrapup?node-id=40000586-5147)
- [x] ⚠️ Trang này có **3 lỗi fact đã ghi nhận** trong
      `.claude/memory/portfolio_aura_case_study_facts.md` — sửa luôn trong batch này.
- [x] ⚠️ Bẫy đã biết: `body{color}` của Bootstrap phá retheme màu. Xem
      `portfolio_case_study_versions.md`.

---

## B7 — marketing-platform ✅ song song — **XONG 2026-09-10**

**File:** `case-studies/marketing-platform.html`, `css/styles/redesign.css` (block `B7`)
**Phụ thuộc:** không

- [x] **(todo 14)** Chỉ tập trung `marketing-platform.html`. `-v2` và `-v3` không liên quan.
      → Chỉ 2 file bị đụng: `marketing-platform.html` + một block `B7` append cuối
      `redesign.css`. Không sửa file nào khác.
- [x] Footer đang khác màu / không dùng shared component → đưa về shared footer.
      → Nguyên nhân: markup là `<section><footer class="container-fluid"
      id="footer-placeholder">`, **thiếu wrapper `.rd-closing`** — mà gradient nền
      (`linear-gradient(to top, white, #f3f3ef)`) nằm ở `.rd-closing`, không ở
      `#footer-placeholder`. Nên footer đúng component nhưng sai nền. Đã đổi thành
      `<div class="rd-closing"><footer id="footer-placeholder"></footer></div>` y hệt
      `lending.html`, và bỏ `.container-fluid` (Bootstrap padding thừa).
      Đo lại: `.rd-cta-heading` và cả cụm footer khớp `lending.html` từng thuộc tính.
- [x] Nhúng **nav mới** và **related case studies mới** vào trang.
      → `<div id="nav-placeholder"></div>` đặt làm con đầu tiên của `<section id="header">`
      (nằm trên gradient hero, giống mọi trang khác) — **không** đặt ngoài body, và
      **không** kèm class `.container` (redesign.css có rule riêng chống bẫy đó).
      → Related: 3 card healthcare / lending / web-3, markup chuẩn `.rd-related`.
      `node scripts/sync-thumbnails.js --dry-run` báo cả 3 card **already in sync**.
      ⚠️ `templates/header.html` **không được file nào trong repo nạp** — nó là template
      `<head>` cho trang root, đường dẫn `./css/...` không dùng được từ `case-studies/`.
      Không có gì để nhúng từ nó.
- [x] ⚠️ Trang này có **7 CTA InVision chết** → đã xoá.
      Thực tế là **8 thẻ `<button class="cta_case">`** (7 prototype, `KT32DF0O76` xuất hiện
      2 lần). Câu ở section *Let's Explore* hứa "try the prototype in each section" cũng
      viết lại, vì bỏ nút mà giữ câu là trang tự hứa cái không có.
      Cùng lựa chọn Hao đã duyệt cho `marketing-platform-v2.html` (mục 2 trong header
      comment của file đó).

**Bug tìm thêm khi nghiệm thu — đã sửa trong block `B7` của `redesign.css`:**
`text-styles.css` (stack 2021) có rule trần `h3 { text-transform: uppercase }`.
`.rd-related-title` là `<h3>`, và tuy `.rd-related-title` (0,1,0) thắng `h3` (0,0,1) ở
mọi thuộc tính nó khai báo, nó **chưa bao giờ khai báo `text-transform`** → cùng một
component render **IN HOA** ở trang này, sentence-case ở `lending` / `healthcare`.
Thêm `.rd-related-title { text-transform: none; }`. Đã đo: mọi trang khác vốn đã là
`none`, nên rule này inert ở đó.

**Nghiệm thu:** Chromium headless, sweep 390 / 768 / 1180 / 1440, so trực tiếp với
`lending.html`: hscroll 0 ở cả 4 mức; wordmark nav 64px (desktop) / 16px (mobile);
nav fixed khi scroll ngược — `position/top/left` khớp `lending` từng số; related 3 card
grid ở desktop, đổi thành deck vuốt ngang có peek ở ≤768; hamburger mở/đóng được; tab
Customer/Staff/Owner vẫn chạy; 0 chữ "Play Prototype", 0 chuỗi `invisionapp` còn lại.
(`$ is not defined` trong console là do jQuery CDN bị chặn trong sandbox — có sẵn từ
trước, không phải do batch này.)

**Còn lại, KHÔNG làm vì ngoài scope B7** — vẫn nằm trong Part F của
`iSystem-Research-and-Rewrite.md`, cần Hao quyết:
- `padding-bottom: 24x` (thiếu đơn vị) vẫn còn ở section *Let's Explore* — sửa là đổi
  layout, mà B7 không xin phần đó.
- `<div id="Owner" class="tabcontent">` vẫn nằm ngoài tab container; grid 8 icon vẫn lặp
  2 lần; 11 lỗi chính tả (`Marketting`, `Product Desinger`, `Onwner`…) vẫn nguyên.
- Có nên thay 7 prototype đã chết bằng screen recording / ảnh flow xuất từ Figma không —
  giờ trang chỉ còn ảnh tĩnh, không còn gì bấm được.
- `node scripts/sync-thumbnails.js` đang báo **10 thay đổi ở CÁC FILE KHÁC** (drift sau
  B6: healthcare / lending / marketing-platform-v3 / web-3 vẫn trích title-desc-ảnh cũ
  của web-3). Chưa chạy vì sẽ đụng file ngoài B7.

---

## B8 — Resume ✅ song song

**File:** `Site/Stephano-Ng-Resume-PD.html` (bản HTML — Hao chốt sửa bản này, không sửa PDF)
**Phụ thuộc:** không

- [x] **(todo 18)** Thêm mục **Education**: **FPT University — chuyên ngành Design — 2014**.
      → Thêm một dòng `.cv-edu` thứ hai dưới Hoa Sen: `FPT University` — `Design 2014`.
      Năm dùng style riêng `.cv-edu-year` (8.6pt, weight 600). Hoa Sen **vẫn không có
      năm** (không có nguồn) → cột phải của 2 dòng lệch nhau, chờ Hao cấp năm hoặc chốt bỏ.
- [x] Thêm connector LinkedIn: https://www.linkedin.com/in/stpnguyen/
      → Dòng thứ 2 trong `.cv-contact` ở header, ngay dưới `stpnguyen.com`, hiển thị
      `linkedin.com/in/stpnguyen`. URL khớp với `templates/nav.html` + `footer.html`.

**Nghiệm thu (2026-09-10):** render print A4 bằng Chromium → **vẫn đúng 2 trang**, kể cả
khi chặn Google Fonts (fallback system-ui). Slack còn lại: trang 1 **24.2mm**, trang 2
**1.7mm**.
⚠️ **Trang 2 gần như hết chỗ — thêm bất cứ dòng nào nữa là tràn sang trang 3.** Muốn thêm
thì phải bỏ bớt chỗ khác trước.

### Hao cần quyết (2 điểm, chưa đụng vào)

1. **Thứ tự Education.** Đang để Hoa Sen trên, FPT dưới (giữ nguyên thứ tự cũ). Nếu
   Hoa Sen sau 2014 thì đúng reverse-chronological; nếu trước thì phải đảo.
2. **Trùng FPT University.** Mục *AI & Awards* vẫn còn dòng `Web Design — Grade: Good —
   FPT University`. Giờ FPT University đã có trong Education → hai chỗ cùng nhắc một
   trường. Bỏ dòng đó sẽ giải phóng ~5mm cho trang 2. Chưa bỏ vì ngoài scope todo 18.

---

## B9 — Prototype role & permission (2 bản, để Hao preview) ✅ song song

**File:** `case-studies/_preview-role-matrix-a.html`, `_preview-role-matrix-b.html` và
`_preview-role-matrix-data.js` (file data dùng chung)
(file rời, tiền tố `_preview-` theo đúng tiền lệ `_preview-design-in-the-loop.html`)

✅ **XONG 2026-09-10. Hao chọn BẢN B.**
CSS của bản B đã chuyển vào `css/styles/redesign.css` (block `B9`, cuối file), nên
`_preview-role-matrix-b.html` giờ chỉ là khung xem — component thật nằm trong redesign.css.
Bản A không được chọn, giữ nguyên CSS trong file của nó.
**Phụ thuộc:** không — **chạy song song với mọi batch khác**

✅ **Hao chốt 2026-09-10: dựng CẢ HAI phương án thành 2 file preview riêng, Hao xem
trước, chọn xong mới đưa vào case.** Không build thẳng vào `healthcare.html`.

### Vấn đề đang giải

Hiện `healthcare.html` dùng ảnh strip `public/hc_map_roles.webp` — hàng header 17 role,
rộng ~2.200px, phải scroll ngang. Nó **cho thấy** có nhiều role nhưng không **nói** được
điều gì; người đọc nhìn xong không rút ra kết luận nào.

Câu mà section đang muốn chứng minh (đã có trên trang): *"not one of them can finish a
program alone."*

### Bản A — ma trận đầy đủ, lọc khi tương tác

- Trục ngang: **13 workflow area** đã có trên trang (onboarding · nomination ·
  contracting · program request · budgeting · inquiry · registration · reporting ·
  speaker & library · expense · billing & payment · reconciliation · shared features)
- Trục dọc: **17 role**, nhưng giữ nguyên sự thật là nhiều role dùng chung permission set.
  Đây là điểm đau, không được làm mượt đi.
  ⚠️ **Sửa số 2026-09-10:** con số "3 cặp → 15 cột" trong bản TODO cũ **sai**. Đối chiếu
  nguyên văn 17 file cho ra **3 NHÓM trùng, trong đó một nhóm có 4 role chứ không phải 2**:
  `Home Office = Brand Manager` · `Compliance = Auditor` ·
  `Bureau Manager = Project Team = Administrator = Super Admin`.
  → **17 role, 12 permission set thật.** Hao đã chốt dùng 12.
  Thêm: file `STARS-1.2.2.17. Super Admin` có mục Overview **chép nguyên văn của
  Administrator** — tài liệu chưa bao giờ mô tả Super Admin.
- Mỗi ô: có quyền / không có quyền → **ô đặc / ô rỗng**. Không icon, không màu mè —
  ở mức zoom-out mắt phải đọc được *hình dạng*, không phải đọc từng ô.
- Tương tác: hover / click một role → **sáng cả hàng**, các hàng khác mờ; kèm một dòng
  tóm tắt *"role này làm được gì, và dừng ở đâu"*.
- Render bằng **CSS grid**, không phải ảnh.

### Bản B — mỗi lần một role

- Bỏ bước nhìn tổng. Vào thẳng chế độ **chọn 1 role tại một thời điểm**, mỗi role là một
  dải ngang chạy qua 13 lane.
- Nhẹ hơn nhiều, kể chuyện tuyến tính hơn — nhưng mất cảm giác "17 role chồng lên nhau".

✅ **Hao chốt bản này 2026-09-10**, kèm 3 chỉnh sửa đã làm xong:
- Nhóm role (Propose / Approval / Operation / Oversight / Attendant) **bỏ khỏi dòng meta
  trên đầu**, chuyển xuống phần description thành chip + một câu giải thích nhóm đó làm gì
  (chữ "Propose" trần không nói lên điều gì). Câu mô tả nằm ở `groups` trong file data.
- **Bỏ dòng "Drops out at"** (liệt kê phần role KHÔNG dùng) → thay bằng **"Works across …"**,
  nêu đúng vùng role đó tập trung vào, viết dưới dạng khoảng liên tục
  (vd Home Office = `Nomination → Speaker & library`, Coordinator = `Program request →
  Billing & payment`). Hàm `focus()` trong file data tự tính, loại `shared features` ra
  vì role nào cũng có. Lỗ hổng vẫn đọc được từ chính dải băng + dòng `9 of 13 areas`.
- Breakpoint đưa về đúng ladder của site: **1180** thu nhỏ segment + nhãn trục, **768** đổ
  dải băng thành dọc. (Bản đầu dùng 900px — lệch ladder.)

### Điều kiện đúng cho cả hai bản

- [x] Chọn **bất kỳ** role nào cũng phải thấy **khoảng trống ở giữa hàng**. Không role
      nào tự đi hết một program. **Nếu prototype không cho thấy điều này thì nó fail**,
      dù trông đẹp tới đâu.
      → **PASS.** Hàng đầy nhất chỉ 9/13 (Home Office · Brand Manager, và nhóm
      Coordinator/Bureau Manager). Hai nửa bổ khuyết chứ không chồng nhau: nhánh duyệt
      rỗng ở `expense · billing & payment · reconciliation`, nhánh vận hành rỗng ở
      `onboarding · nomination · contracting`. Đã test tự động cả 17 role, không role
      nào kín 13 lane. Cả 2 bản mở sẵn ở **Home Office** — role với tới xa nhất — để
      lỗ hổng hiện ra ngay ở ca khó nhất.
- [x] Mobile: **đổ dọc theo workflow area**, không scale nhỏ lại. Thu nhỏ thì ô thành
      hạt bụi, không đọc được.
      → Dưới 900px: bản A giữ 17 chip role rồi đổ 13 lane theo chiều dọc; bản B đổi
      dải ngang thành 13 hàng dọc. Type giữ nguyên cỡ, không có ô nào bị thu nhỏ.
- [x] Dùng token của `redesign.css`. Nhưng vì là file preview rời, **được phép để CSS
      ngay trong file** — không đụng `redesign.css` cho tới khi Hao chốt bản nào.
      → Đã chốt B, nên CSS bản B **đã chuyển vào `redesign.css`** (block `B9`, append ở
      cuối, không sửa rule của batch khác). Mọi selector đều tiền tố `.rb-`, đã grep xác
      nhận **không trang nào khác trong repo dùng tiền tố này**, nên block này không với
      tới trang nào ngoài preview B.
- [x] Mỗi file preview tự chạy độc lập: mở
      `http://localhost:8000/case-studies/_preview-role-matrix-a.html` là xem được ngay,
      không cần phần còn lại của case.

### Data

Nguồn: **17 file `STARS-1.2.2.x`** trong `case study 1/`. Mục **"1. Overview"** của mỗi
file ghi **nguyên văn** role đó *"usually has the ability to"* làm gì.

- [x] Trích đúng câu chữ trong tài liệu. **Không suy diễn từ tên role.**
- [x] Xuất bảng 17 × 13 ra một file trung gian (JSON hoặc bảng markdown) trước, rồi cả
      hai prototype cùng đọc từ đó — để A và B không lệch data nhau.
      → `_preview-role-matrix-data.js`. Mỗi ô đặc **kèm luôn câu trích nguồn**, nên tra
      ngược được mà không cần mở lại PDF.
- [x] `STARS-1.2.2.1. Shared Features` **không phải một role** — loại ra khỏi trục dọc.
      Lưu ý `STARS-1.2.2.4. Division Manager` có **2 file trùng** (một bản `(1)`).
      → Đã xác nhận bản `(1)` trùng **từng byte**; chỉ dùng bản gốc.
- [x] ⚠️ Các file này **gọi tên khách hàng ở gần như mọi đoạn**, file accounting còn nêu
      **tên 2 nhân viên**. Không chữ nào trong đó được lên trang.
      → Đã scrub. Có test tự động chặn tên khách hàng, 2 tên nhân viên và tên vendor
      trong cả 3 file; tên vendor trong câu trích thay bằng `[bracket]` chung.

### Bàn giao

- [x] Báo Hao khi cả 2 file chạy được, kèm đường link localhost của từng bản.
      `http://localhost:8000/case-studies/_preview-role-matrix-a.html`
      `http://localhost:8000/case-studies/_preview-role-matrix-b.html`
- [x] Hao chọn A hay B → ghi lựa chọn vào file này → **B4 todo 4** mới được chạy.
      → **Hao chọn bản B, 2026-09-10.** B4 todo 4 hết chặn.

---

## Tạm dừng

- [ ] **(todo 13)** Đưa AI process & workflow lên trang about — **Hao tạm dừng.**
      *Ghi chú khi nào làm lại: chỉ hay nếu kể bằng artifact / quyết định cụ thể; nói chung
      chung về "AI workflow" thì trang about sẽ đọc như quảng cáo.*
- [ ] **(todo 11.1)** Viết lại nội dung block trong section "What I've Learned Along the
      Way" cho đời thực và có kinh nghiệm hơn — **Hao pending.**
      *(Phần 11.2 badge mobile đã tách sang B0.)*
- [ ] **(todo 19)** Slide phỏng vấn — **Hao pending.**
      *Khi làm lại cần: phỏng vấn ở đâu / vị trí gì, bao nhiêu phút, output PPTX hay slide
      deck online.*

---

## Đang chờ Hao

| # | Chặn cái gì | Cần gì |
|---|---|---|
| — | — | *(hết)* B9 xong 2026-09-10, Hao chọn **bản B** → B4 todo 4 hết chặn. |

**Không còn điểm chặn nào. Cả 9 batch đều khởi động được.**

*Đã gỡ hết phần còn lại: #1 badge SOW (đã khoanh đúng nguyên nhân trong `journey.js`) ·
#2 CE selling point (chốt sequence diagram) · #3 ảnh bên phải · #4 100vh desktop-only ·
#5 timeline theo phase · #7 bỏ 496, dùng 38 loại chứng từ + viết lại 2 câu lập luận ·
#8 data thật · #9 FPT 2014 · flow CE đã có đủ 5 bước từ Hao.*
