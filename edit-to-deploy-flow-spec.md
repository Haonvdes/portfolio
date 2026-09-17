# Spec: "Edit to Deploy" — step-through sequence diagram

Tài liệu mô tả lại artifact **Edit to Deploy** (claude.ai/artifact/96x2GvuZBZ1FDmnC39oDGC) để code dựng lại pattern này.
Mục đích dùng lại: làm phần **model của design GitHub branch** trên `healthcare.html`.

> Nguồn: quan sát trực tiếp artifact ngày 2026-09-17 ở hai độ rộng (desktop ~1220px, hẹp ~800px).
> Những điểm ghi **(suy ra)** là không nhìn thấy trực tiếp, cần kiểm lại khi code.

---

## 1. Ý tưởng cốt lõi

Một thay đổi đi qua nhiều "nơi" (hệ thống) từ trái sang phải. Người xem bấm **Next / Back** để đi từng bước.
Mỗi bước làm sáng **đúng một (hoặc hai) mũi tên** trong sơ đồ và cập nhật **badge phiên bản** trên đầu các làn.
Kết thúc là cùng một bức tranh như lúc đầu, chỉ lên một phiên bản (v1 → v2). Đó là thông điệp: *đây là một vòng lặp*.

Ba thứ mang toàn bộ ý nghĩa, phải giữ khi dựng lại:

1. **Trạng thái mũi tên**: bước hiện tại / đã xong / chưa tới.
2. **Nét liền vs nét đứt**: nét liền = người (hoặc agent theo lệnh người) làm; nét đứt = *tự xảy ra*.
3. **Badge phiên bản trên mỗi làn**: cho thấy nơi nào đã lên v2, nơi nào còn v1, nơi nào đang dở.

---

## 2. Cấu trúc trang (từ trên xuống)

```
┌ Header ─────────────────────────────────────────────┐
│ H1: Edit to Deploy                                   │
│ Lead: One change moves from your editor to the live  │
│ site, through two branches and two databases. Each   │
│ arrow is one step you take; the dashed ones happen   │
│ on their own.                                        │
├ Stepper bar (sticky) ───────────────────────────────┤
│ [← Back]  ①In sync ②Edit ③Migrate dev … ⑧Live [Next →] │
├ Body: 2 cột ────────────────────────────────────────┤
│ ┌ Diagram card ───────────────┐ ┌ Step panel ──────┐ │
│ │ vùng · làn · badge · mũi tên│ │ Step 7 of 8      │ │
│ │                             │ │ Title            │ │
│ │ legend                      │ │ Body             │ │
│ └─────────────────────────────┘ │ [code block]     │ │
│                                 │ [callout]        │ │
│                                 │ [← Back] [Next →]│ │
│                                 └──────────────────┘ │
├ Footnote (chữ nhỏ, xám) ────────────────────────────┤
└──────────────────────────────────────────────────────┘
```

---

## 2b. Desktop UI — chuẩn tham chiếu

Ảnh tham chiếu: `edit-to-deploy-desktop-step5.png` (bước 5 · Push, viewport ~2000px). **Desktop phải khớp ảnh này.**

### Bố cục

- **Nền trang** xám-tím rất nhạt (≈ `#F5F4F8`). Card nền trắng, viền 1px xám nhạt (≈ `#E4E2EA`), bo góc ~12px, không đổ bóng.
- **Header**: H1 đậm ~40px, lead xám (≈ `#6B6878`) ~18px, tối đa ~820px chiều ngang (2 dòng).
- **Stepper bar**: trải full chiều ngang, **kẻ viền trên và dưới** (1px), cao ~68px, nằm trên nền trang (không phải card).
  - Trái: `← Back` — nút viền, nền trắng, bo ~6px.
  - Tiếp theo, căn trái ngay sau Back: 8 mục cách nhau ~28px.
  - Phải cùng: `Next →` — nền đen (≈ `#1F1D2B`), chữ trắng.
- **Body**: 2 cột, gap ~30px, căn đầu trên.
  - Trái: **Diagram card** ~75% (≈ 1360px trong ảnh).
  - Phải: **Step panel** cố định ~430px, cao theo nội dung (không kéo bằng sơ đồ).

### Mục stepper — 3 trạng thái

| Trạng thái | Số tròn | Nhãn | Khung |
|---|---|---|---|
| Hiện tại (5 · Push) | **tô cam** (≈ `#E0922F`), số đen | đen, đậm hơn | viền xám bo ~8px bao cả số + nhãn, nền trắng |
| Đã qua (1–4) | viền đen mảnh, số đen | xám đậm | không |
| Chưa tới (6–8) | viền xám nhạt, số xám nhạt | xám nhạt | không |

### Diagram card

- **Tên vùng** (`Development` · `GitHub` · `Production`) căn giữa trên nhóm làn của nó, chữ nhỏ đậm xám đậm.
- **Đường chia vùng**: nét đứt xám rất nhạt, chạy từ đỉnh card xuống tới gần legend. Hai đường: giữa Local repo | GitHub, và giữa GitHub | Live site.
- **Thẻ làn**: 6 thẻ bằng nhau (~190×80px), gap ~12px; riêng khoảng giữa Local repo và GitHub rộng hơn (có đường chia vùng). Icon ~36px bên trái; tên sans đậm ~17px; dòng phụ mono ~13px xám.
- **Badge**: căn giữa dưới thẻ, cách ~20px; badge thứ hai xếp ngay dưới badge thứ nhất.
- **Lifeline**: 1.5–2px xám nhạt, từ dưới badge (cùng một mốc y cho mọi làn) xuống sát legend.
- **Hàng hành động**: cách đều ~84px. Mũi tên bắt đầu *sát* lifeline nguồn và đầu mũi tên chạm lifeline đích.
  - `edit code · write migration` là **khung chữ nhật nét đứt đen** căn giữa trên lifeline Your files, không có mũi tên.
  - Nhãn là **pill chữ nhật bo ~6px**, font mono ~15px, nằm *đè lên* đoạn giữa mũi tên (đường bị pill che).
- **Độ dày và màu mũi tên**:

  | Trạng thái | Đường | Đầu mũi tên | Pill nhãn |
  |---|---|---|---|
  | this step | cam, **~3px** | tam giác cam đặc, lớn (~24px) | nền cam rất nhạt (≈ `#FBEBD3`), viền cam, chữ nâu đậm |
  | done | đen, ~2px | tam giác đen đặc (~16px) | nền trắng, viền đen, chữ đen |
  | not yet | xám nhạt, ~2px | tam giác xám nhạt | nền trắng, viền xám nhạt, chữ xám nhạt |

  Hàng tự động (`Netlify builds`, `Supabase runs the migration`) dùng **nét đứt** (dash ~8, gap ~6) với cùng quy tắc màu.
- **Legend** ở góc dưới trái card, font mono ~16px xám: gạch ngắn cam `this step` · gạch đen `done` · gạch xám `not yet` · gạch đứt đen `happens by itself`.

### Step panel

- Padding ~24px.
- `Step 5 of 8` — mono ~15px, xám.
- Title — sans đậm ~30px, đen.
- Body — ~18px, xám đậm, line-height ~1.6. `inline code` mono, nền xám nhạt, bo ~4px, padding ngang ~4px.
- Code block — nền xám rất nhạt, viền 1px xám nhạt, bo ~8px, padding ~16px; caption sans ~15px xám đậm (`The command agent runs`); dòng lệnh mono ~16px đen.
- Đường kẻ mảnh, rồi `← Back` (viền) trái — `Next →` (đen) phải.

### Font

Sans hẹp kiểu **IBM Plex Sans** và mono **IBM Plex Mono** (suy ra từ ảnh). Khi đưa lên portfolio thì dùng font của portfolio (DM Sans + mono sẵn có), giữ nguyên tỉ lệ cỡ chữ.

> Mọi mã màu ở trên là **ước lượng từ ảnh**. Khi dựng trên portfolio, map sang token (`--rd-ink`, `--rd-ink-muted`, màu nhấn…) thay vì dùng literal.

---

## 3. Stepper bar

- Nằm ngay dưới header, **sticky ở top** khi cuộn (thấy rõ ở bản hẹp).
- Trái: nút `← Back`. Phải: nút `Next →` (nền đen, chữ trắng, là nút chính).
- **Desktop:** giữa là dãy 8 mục `số tròn + nhãn`: `In sync · Edit · Migrate dev · Commit · Push · Promote · Deploy · Live`.
  - Mục đang chọn: khung viền bo tròn quanh mục, số tròn **tô cam**, chữ đậm.
  - Mục đã qua: số tròn viền đen, chữ đen.
  - Mục chưa tới: số tròn và chữ **xám nhạt**.
  - **Bấm vào một mục → nhảy thẳng tới bước đó** (đã chốt). Mọi mục đều bấm được, kể cả mục chưa tới.
- **Bản hẹp:** dãy mục thu lại thành một nhãn giữa: `1 / 8 · In sync`.
- Bước 1: `Back` bị disable (mờ). Bước 8: `Next` bị disable, nút trong panel đổi thành `Done` (disable).

---

## 4. Diagram card

### 4.1 Vùng và làn

Ba vùng, ngăn nhau bằng **đường dọc nét đứt** mảnh; tên vùng là nhãn nhỏ căn giữa phía trên.

| Vùng | Làn | Dòng phụ (mono, xám) |
|---|---|---|
| Development | Dev database | `Supabase · dev` |
| Development | Your files | `editor · localhost` |
| Development | Local repo | `git · laptop` |
| GitHub | GitHub | `origin` |
| Production | Live site | `Netlify` |
| Production | Prod database | `Supabase · prod` |

- Mỗi làn có **thẻ tiêu đề**: khung trắng viền xám bo góc, icon trái (logo dịch vụ hoặc icon line), tên đậm, dòng phụ font mono.
- Dưới thẻ là **1–2 badge** (xem 4.2), rồi **đường lifeline dọc** màu xám chạy suốt chiều cao sơ đồ.

### 4.2 Badge phiên bản

Pill nhỏ, font mono. Làn Local repo và GitHub có **hai badge** (mỗi branch một cái): `askone · v1` và `askone-prod · v1`.

| Trạng thái | Hình dạng | Ví dụ |
|---|---|---|
| Chưa đổi / nền | nền xám nhạt, chữ xám | `schema v1` |
| Đã đổi ở bước trước | nền **đen**, chữ trắng | `askone · v2` |
| Vừa đổi ở bước hiện tại | nền **cam**, chữ đậm | `schema v2` |
| Đang dở (chưa chốt) | nền **cam rất nhạt + viền cam**, chữ cam đậm | `v2 · not committed`, `v2 · building…` |

### 4.3 Hàng hành động (mũi tên)

Mỗi hành động là một **hàng ngang riêng**, xếp từ trên xuống theo thứ tự thời gian. Mũi tên nối lifeline nguồn → lifeline đích, nhãn nằm trong một khung nhỏ (font mono) giữa mũi tên.

| # | Nhãn | Từ → Tới | Kiểu |
|---|---|---|---|
| a | `edit code · write migration` | nằm trên lifeline Your files (không phải mũi tên, là **ghi chú khung nét đứt**) | tự thân |
| b | `apply migration` | Your files → Dev database (hướng **sang trái**) | liền |
| c | `git commit` | Your files → Local repo | liền |
| d | `git push (askone)` | Local repo → GitHub | liền |
| e | `git push (askone-prod)` | Local repo → GitHub | liền |
| f | `Netlify builds` | GitHub → Live site | **đứt** |
| g | `Supabase runs the migration` | GitHub → Prod database (đi xuyên qua Live site) | **đứt** |

Trạng thái mỗi hàng theo bước hiện tại:

- **this step**: màu **cam**, đầu mũi tên cam đặc, khung nhãn nền cam nhạt.
- **done**: màu **đen**, khung nhãn trắng viền đen.
- **not yet**: màu **xám nhạt**, khung nhãn viền xám, chữ xám.
- Nét đứt giữ nét đứt ở cả ba trạng thái; chỉ màu đổi.

### 4.4 Legend (chân card)

`— this step` (cam) · `— done` (đen) · `— not yet` (xám) · `---- happens by itself` (đứt đen)

---

## 5. Step panel

Card trắng bo góc, bố cục dọc:

1. **Eyebrow** mono, xám: `Step N of 8`
2. **Title** đậm, lớn (~24–28px)
3. **Body** 2–4 câu; tên file/branch/lệnh bọc trong `inline code` (nền xám nhạt)
4. **Code block** (tuỳ bước): nền xám nhạt, nhãn nhỏ phía trên `The command agent runs`, nội dung mono; dòng comment bắt đầu bằng `#` màu xám
5. **Callout** (tuỳ bước): **viền trái cam dày**, tiêu đề nhỏ màu nâu/cam đậm, body xám. Tiêu đề đổi theo bước: `The rule` · `Notice` · `Check first` · `Why --ff-only` · `If it fails`
6. Đường kẻ mảnh, rồi hàng nút `← Back` (viền) — `Next →` (đen), căn hai đầu

---

## 6. Nội dung 8 bước và trạng thái sơ đồ

Ký hiệu hàng: **●** this step · **■** done · **○** not yet (theo bảng 4.3).

### Bước 1 — In sync
- **Title:** Everything is at version 1
- **Body:** Six places, read left to right: the development side, GitHub in the middle, production on the right. Both branches, both databases and both copies of the app sit at the same version. Step through to watch one change cross the whole line.
- **Callout — The rule:** Production is never edited by hand. Code gets there only through GitHub, and its database changes only by migration files that live in the repository.
- **Hàng:** tất cả ○. **Badge:** tất cả v1, nền xám — Dev DB `schema v1`, Your files `v1`, Local repo `askone · v1` + `askone-prod · v1`, GitHub `askone · v1` + `askone-prod · v1`, Live site `v1 · live`, Prod DB `schema v1`.

### Bước 2 — Edit
- **Title:** The agent edits the code and writes a migration
- **Body:** You ask for a room description. The agent edits `rooms.ts` and adds a migration file under `supabase/migrations/`. Your editor's Source Control view shows two changes — **M** modified, **U** untracked. Nothing else on the line knows yet.
- **Callout — Notice:** localhost reloads the new code at once and errors: the code asks for a column the dev database does not have. That is what the migration file is for.
- **Hàng:** a ●, còn lại ○. **Badge:** Your files = `v2 · not committed` (đang dở).

### Bước 3 — Migrate dev
- **Title:** Run the migration on the dev database
- **Body:** A migration file is a script; it changes nothing until it runs. The agent runs it on the dev project, the `rooms` table gains its column, and localhost works. Still nothing committed.
- **Code — The command agent runs:**
  ```
  # Supabase MCP server → the dev project
  apply_migration supabase/migrations/20260910164913_room_description.sql
  ```
- **Callout — Check first:** The MCP server is connected to exactly one project. Make sure it is the dev one — production has the same tables, and the command looks identical.
- **Hàng:** a ■, b ●. **Badge:** Dev database = `schema v2` (cam); Your files vẫn `v2 · not committed`.

### Bước 4 — Commit
- **Title:** Commit: record it on this machine
- **Body:** A commit records the snapshot in the history stored on your computer. Only `askone` moves to v2; `askone-prod` stays where it was. GitHub still has the old history.
- **Code:**
  ```
  git add src/lib/rooms.ts supabase/migrations/20260910164913_room_description.sql
  git commit -m "room description: admins can add or edit it after opening a room"
  ```
- **Callout:** không có.
- **Hàng:** a–b ■, c ●. **Badge:** Dev DB `schema v2` (đen); Your files `v2` (cam); Local repo `askone · v2` (cam), `askone-prod · v1` (xám).

### Bước 5 — Push
- **Title:** Push: copy it to GitHub
- **Body:** Push copies the commit to GitHub's `askone`. Production still runs `askone-prod`, still v1 — nothing has changed for anyone else. Pushing to the development branch is always safe.
- **Code:** `git push origin askone`
- **Hàng:** a–c ■, d ●. **Badge:** Your files `v2` (đen); Local repo `askone · v2` (đen); GitHub `askone · v2` (cam).

### Bước 6 — Promote
- **Title:** Promote: move the production branch
- **Body:** Move `askone-prod` to the same commit as `askone` — a fast-forward, no new commit — then push it. That second push is the trigger for everything on the right.
- **Code:**
  ```
  git switch askone-prod
  git merge --ff-only askone
  git push origin askone-prod
  ```
- **Callout — Why --ff-only:** It refuses if the branches have drifted apart. Production only ever receives exactly the commit that was tested on `askone`.
- **Hàng:** a–d ■, e ●. **Badge:** Local repo `askone-prod · v2` (cam); GitHub `askone-prod · v2` (cam); `askone · v2` ở cả hai thành đen.

### Bước 7 — Deploy
- **Title:** Netlify builds, Supabase migrates — by themselves
- **Body:** Two services watch `origin/askone-prod`. Netlify builds the new commit; Supabase's GitHub integration runs the new migration file on the production project. Nobody typed the dashed arrows — the push was the deploy.
- **Callout — If it fails:** A failed build never goes live; Netlify keeps serving the previous one. A failed migration is fixed with a new file, never by editing the old one.
- **Hàng:** a–e ■, **f ● và g ● cùng lúc** (hai nét đứt cam). **Badge:** Live site `v2 · building…` (đang dở); Prod database `schema v2` (cam).

### Bước 8 — Live
- **Title:** Everything is at version 2
- **Body:** Netlify swaps the new build in. Every place is now at v2 — the same picture as the start, one version later. That is the loop: **edit → migrate dev → commit → push → promote → deploy**. The next feature takes the same path.
- **Hàng:** tất cả ■. **Badge:** tất cả v2 nền đen, riêng Live site `v2 · live` (cam).
- `Next` disable, nút panel thành `Done` (disable).

---

## 7. Footnote

Chữ nhỏ, xám, dưới cùng, cách body bằng đường kẻ:

- Branch names are this repository's: `askone` is the development branch, `askone-prod` is production. The commit and the migration file are the real ones from the room-description feature.
- Left out on purpose: pull requests, the CI gate, the `main` template branch, and more than one person editing at once. Learn the loop first; those are refinements of it.

> ⚠️ Khi đưa lên portfolio: dòng thứ hai là câu kể quá trình làm → bỏ khỏi UI, chuyển thành HTML comment (quy tắc *no process talk on page*).

---

## 8. Behavior

| Hành vi | Chi tiết |
|---|---|
| Next / Back | Tăng/giảm bước 1 đơn vị. Hai cặp nút (stepper bar và panel) điều khiển cùng một state. |
| Giới hạn | Bước 1: Back disable. Bước 8: Next disable, nút panel = `Done` disable. |
| Nhảy bước | Bấm mục trong stepper desktop → nhảy thẳng tới bước đó (đã chốt). Sơ đồ và panel render đúng trạng thái của bước đích, không chạy qua các bước giữa. |
| Render theo bước | Toàn bộ sơ đồ render lại từ một bảng dữ liệu `steps[n]` → trạng thái từng hàng + giá trị/tone từng badge. Không có state tích luỹ. |
| Chuyển động | Không thấy animation đáng kể; đổi màu gần như tức thời **(nên giữ tối giản, cùng lắm transition màu ~150ms)**. |
| Sticky | Stepper bar dính top khi cuộn. |
| Bàn phím | Không quan sát được. **Đề xuất thêm:** `←/→` đổi bước khi focus trong component; stepper là `role="tablist"` hoặc list nút có `aria-current="step"`; panel có `aria-live="polite"`. |

### Responsive

- **≥ ~1000px:** 2 cột — sơ đồ trái (~70%), panel phải (~30%); stepper hiện đủ 8 mục.
- **Hẹp:** 1 cột — **panel lên trên**, sơ đồ xuống dưới; stepper thu thành `n / 8 · Label`.
  Sơ đồ **không co lại** — giữ kích thước, bị cắt ngang và cuộn ngang trong card (làn Production nằm ngoài khung). Nhãn là nội dung nên không scale.

---

## 9. Mô hình dữ liệu gợi ý

```js
const lanes = [
  { id: 'devdb', zone: 'Development', name: 'Dev database', sub: 'Supabase · dev', icon: 'supabase' },
  // …
];

const actions = [
  { id: 'a', label: 'edit code · write migration', kind: 'note', lane: 'files' },
  { id: 'b', label: 'apply migration', from: 'files', to: 'devdb' },
  // …
  { id: 'f', label: 'Netlify builds', from: 'github', to: 'live', auto: true },
];

const steps = [
  {
    key: 'in-sync', label: 'In sync',
    title: 'Everything is at version 1',
    body: '…',
    code: null,               // { caption, lines[] }
    callout: { title: 'The rule', body: '…' },
    current: [],              // action ids tô cam; mọi action đứng trước = done, sau = not yet
    badges: {                 // laneId -> [{ text, tone: 'base'|'done'|'current'|'pending' }]
      devdb: [{ text: 'schema v1', tone: 'base' }],
      repo:  [{ text: 'askone · v1', tone: 'base' }, { text: 'askone-prod · v1', tone: 'base' }],
    },
  },
  // …
];
```

Quy tắc suy ra trạng thái hàng: action có index < index nhỏ nhất trong `current` → done; nằm trong `current` → current; còn lại → not yet. Bước cuối `current: []` và mọi hàng done.

---

## 10. Ghi chú khi áp vào healthcare (design GitHub branch)

- Dựng dưới dạng **file preview riêng** trước (`_preview-design-branch.html`), chưa tích hợp.
- Vẽ sơ đồ bằng **inline SVG**; SVG attribute không đọc `var()` → set màu qua CSS class hoặc `style`.
- Dùng token của `css/styles/tokens.css` / `redesign.css` (`--rd-*`), không literal khi đã có token. Cam của pattern gốc cần map sang màu nhấn có sẵn của portfolio.
- Script **scope theo id** của section, không dùng `document.querySelector` first-match (tránh lặp lỗi `ai-accelerate.js`).
- Mobile: dùng lại `.rd-figure-frame` / `.rd-figure-scroll` cho cuộn ngang.
- Bỏ icon logo dịch vụ nếu muốn bản tối giản; giữ làn, badge, mũi tên, panel.
- Nội dung làn/bước cho design branch **chưa chốt** — xem các câu hỏi mở: tên branch thật, bước nào tự chạy (nét đứt), gate nào designer duyệt.
