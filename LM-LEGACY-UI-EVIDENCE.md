# L&M / STARS — bằng chứng từ 40 ảnh chụp hệ thống cũ

**Nguồn:** `case study 1/images/image 1.png` … `image 40.png` (40 ảnh, thêm vào 2026-09-01).
Đây là **hệ thống đang chạy của khách** — portal speaker-bureau của Genentech do
L&M Healthcare Communications vận hành — tức là **baseline as-is** mà STARS thay thế.
Trước ngày này, `CASE-STUDY-1-SOURCE-INVENTORY.md` Part 3 ghi programs/year và approval
cycle time là "chỉ Hao mới trả lời được". Bộ ảnh này trả lời được một nửa.

Đọc file này trước khi đưa bất kỳ con số nào từ dự án healthcare lên trang.

---

## Phần A — Ba cảnh báo, đọc trước khi dùng bất cứ số nào

1. **Đây là môi trường DEV.** URL hiện ở image 24 và image 37: `lmdev.dnaprograms.com`.
   Dữ liệu có dấu hiệu test rõ ràng: dòng chi phí `$9,999,999.00` (image 4), tile budget
   committed `$7,308,236,714.83` (image 2), region tên `Placeholder` (image 2), email
   `ABBEY.BECKY.TESTTEST@GENE.COMMMM` (image 12, 30), event `GEN EVR 1750-Test-hello`
   (image 10), địa chỉ `11100 Euclid Ave Fl 6 test` (image 14).
   → Con số 120 và các trung bình SIS **có thể** là thật, có thể là seed. **Chưa xác nhận
   được từ trong ảnh.** Hao phải xác nhận trước khi trích.

2. **Chưa che thông tin.** Trong bộ ảnh có: tên bác sĩ kèm **số NPI** (1649634015,
   1720318355), địa chỉ, số điện thoại di động, email nhân viên `@lmhcare.com`, một
   **username đăng nhập** (`Duy.Le@lmhcare.com`, image 1), số hotline nội bộ của L&M,
   và logo Genentech/Roche ở mọi ảnh. **Không ảnh nào trong 40 ảnh được dùng nguyên vẹn
   trên web.** Cùng loại rủi ro với `[HR Campaign] Survey Report.pdf`.

3. **Bộ ảnh gọi tên khách hàng.** Trang `healthcare.html` hiện không nêu tên Genentech.
   Dùng ảnh = lộ tên khách. Đây là quyết định của Hao, không phải chuyện crop được.

---

## Phần B — Programs/year: CÓ SỐ

| Con số | Nguồn | Ghi chú |
|---|---|---|
| **120 programs** (năm 2026) | image 3 — danh sách Programs, filter `Year 2026`, đếm hiển thị `Programs 120` | Không có filter nào khác được bật |
| **120** (đối chiếu độc lập) | image 21 — widget *2026 Program Summary*, `Total = 120` | Khớp với image 3 |
| **120** (đối chiếu độc lập lần 2) | image 18 — bảng Bureau 2026, cộng cột Total = 118, cộng thêm 2 canceled = 120 | Ba nguồn khớp nhau |
| **373 programs** | image 40 — report *SIS Processing*, `Total Programs: 373`, filter Year = 2026 | **Mâu thuẫn với 120 — xem cảnh báo dưới** |

### ⚠️ 120 vs 373 — chưa giải quyết

Report SIS Processing (image 40) có bộ lọc Bureau liệt kê các bureau tiền tố `2024-`
(`2024-Cross-Portfolio PM`, `2024-Evrysdi HCP`, `2024-Hemlibra Community Connects`…),
tức là phạm vi của nó **không phải** một năm dương lịch của một brand. 120 và 373 đang
đếm hai thứ khác nhau. **Không trích số nào cho tới khi biết mỗi số đếm cái gì.**

### Phân bố theo tháng (image 21) — tổng 120

| Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | 13 | 17 | 20 | **32** | 18 | 10 | 3 | 2 | 1 | 1 | 0 |

Đỉnh tháng 5 (32) gấp hơn 10 lần tháng thấp. Nếu cần một câu về "tải việc của coordinator
không đều", đây là bằng chứng — nhưng nhớ ảnh chụp vào ~tháng 7/2026, nên các tháng cuối
năm thấp vì **chưa được submit**, không phải vì ít việc. Đừng đọc thành tính mùa vụ.

### Phân bố theo bureau, 2026 (image 18) — 18 bureau

| Bureau | Completed | Upcoming | Total | Canceled |
|---|---|---|---|---|
| Ocrevus HCP | 4 | 27 | 31 | 1 |
| Ocrevus Patient | 2 | 19 | 21 | 1 |
| Lung Pan Tumor | 4 | 12 | 16 | 0 |
| Xolair | 3 | 10 | 13 | 0 |
| Hemlibra HCP Connects | 1 | 10 | 11 | 0 |
| Hemlibra Community Connects | 1 | 6 | 7 | 0 |
| Ocrevus PM · Susvimo RS | 0–2 | 2–4 | 4 mỗi cái | 0 |
| CRS Panel · Evrysdi Patient · Ophtha RS | — | — | 3 mỗi cái | 0 |
| Susvimo Surgical Excellence | 0 | 2 | 2 | 0 |
| COPD · Evrysdi HCP · Gazyva · Lymphoma · Ophtha PM · Xolair PM | 0 | 0 | 0 | 0 |

6/18 bureau có **0 program** trong năm. Đây là dữ liệu thật cho câu chuyện "17 role, một
MVP": không phải nhánh nào của sản phẩm cũng được dùng như nhau.

---

## Phần C — Approval cycle time: **VẪN CHƯA CÓ**

Cái gần nhất, ở image 40 (Reports → Operational → **SIS Processing**):

- `Average Business Days to Return: **3.84**`
- `Average Business Days to Final Status: **11.78**`

### ⛔ Đây KHÔNG phải approval cycle time

SIS = **Sign-In Sheet**. Hai con số này đo *giấy điểm danh sau khi chương trình đã diễn ra*
mất bao lâu để quay về và chốt trạng thái. Nó nằm ở **cuối** vòng đời program, còn
approval nằm ở **đầu**. Gán nhãn 11.78 ngày là "approval cycle time" là đọc sai, và bất kỳ
ai từng làm pharma ops sẽ nhận ra ngay trong 5 giây.

Nếu muốn dùng, phải gọi đúng tên: *"đối soát giấy điểm danh sau chương trình mất trung bình
11.78 ngày làm việc"* — và đó cũng là một con số tốt, vì nó chứng minh cái đuôi thủ công
của quy trình cũ.

### Cách để có số approval thật

Trang chi tiết program có trường **`Created On`** (image 4: LM26-1252, `Created On 07/15/2026`,
ngày tổ chức `07/31/2026`, trạng thái vẫn `Pending` tại thời điểm chụp). Nghĩa là hệ thống
**có** lưu ngày tạo request. Cần một trong hai:

- export danh sách program kèm `Created On` + ngày đổi trạng thái sang Confirmed, rồi tính
  trung bình; hoặc
- Hao nhớ lại/hỏi khách con số thực tế, và gắn nhãn `client-reported`.

Danh sách Programs (image 3) **không** có cột Created On — chỉ có Date. Nên không tính được
chỉ từ bộ ảnh này.

---

## Phần D — Các con số đếm được khác (đều từ ảnh, đều verify được)

| Con số | Nguồn | Dùng được ở đâu |
|---|---|---|
| **91 speakers** (2026) | image 13 — `Speakers: 91` | Quy mô |
| **323 curricula** (2026) | image 37 — `Curricula: 323` | Quy mô nội dung phải quản |
| **Program cap 20/năm/speaker**, fee cap `$13,500`; EOY programs 2025 = 4, 2026 = 3 | image 14 | Business rule thật — cap là lý do có trạng thái `On Hold - Cap Reached` (image 26) |
| **Checklist: 6 mục ở bước Pending + 22 mục ở bước Confirmed** | image 35 | *28 bước thủ công cho một program* — đây là proxy cho công sức coordinator, mạnh hơn nhiều so với "hệ thống cũ khó dùng" |
| **38 loại chứng từ** phải upload cho một program | image 31 — mục *Awaiting Upload* | Ảnh này một mình đã kể xong câu chuyện gánh nặng compliance |
| **17 dòng chi phí** trên một program | image 4 — panel *Costs* | Nối thẳng vào budget logic trong spec |
| **15 cột** trên bảng danh sách program | image 3 | So được với "report 77–102 cột" đang có trên trang |
| **11 module + 4 tab cấp cao nhất** | image 3, 10, 26, 28 | Genentech / Core / Payment Aggregator / Nomination Review |
| Hàng chục cron `.pl`, nút *Restart Apache* | image 9 | Hệ cũ là Perl + Apache. Dùng để mô tả "legacy", không dùng làm claim |
| ≥13 mẫu email nội bộ tự động | image 32 | Escalation, insufficient RSVPs, 48-hours-until-program… |

---

## Phần E — Còn thiếu, chỉ Hao trả lời được

1. **Dữ liệu dev hay dữ liệu thật?** Nếu là dev seed thì cả phần B lẫn phần C đều không
   dùng được. Đây là câu hỏi chặn tất cả những câu còn lại.
2. **120 và 373 đếm cái gì?** Một trong hai (hoặc cả hai) cần một câu định nghĩa phạm vi.
3. **Được nêu tên Genentech không?** Nếu không thì các ảnh này chỉ dùng để *biết*, không
   dùng để *hiện*.
4. **Con số 120 có phải "một năm bình thường" không**, hay 2026 bất thường? Ảnh chỉ có
   2026; dropdown có 2024/2025 nhưng không ai chụp.
5. **Có xin được export nào không** (danh sách program kèm `Created On`)? Đó là đường duy
   nhất tới approval cycle time thật.

---

## Phần F — Nhãn phải dùng nếu trích

Theo `Case-Study-Framework.md`, mọi số phải có nhãn. Với bộ này:

- 120 / 91 / 323 / 38 / 28 / 17 → **`observed in client system`**, không phải `measured`.
  Hao quan sát hệ thống của khách, không tự đo.
- 3.84 / 11.78 → **`client system report`**, kèm tên đúng (SIS processing), không đổi tên
  thành approval.
- Bất kỳ con số nào Hao nhớ lại mà không có trong ảnh → **`client-reported`**.
- Không con số nào ở đây là `measured` — trang `healthcare.html` hiện nói thẳng là Hao rời
  dự án trước khi có chu kỳ đo, và **câu đó vẫn đúng**. Bộ ảnh này cho *baseline*, không
  cho *outcome*.
