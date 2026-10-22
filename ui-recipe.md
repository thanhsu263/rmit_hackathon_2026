# La Recette — Custodian Vault UI

Một công thức, không phải một bài giảng. Đọc hết mất 4 phút.
Nhà hàng để học: **linear.app**. Mở nó ra, để cạnh màn hình, rồi nấu.

---

## Vì sao món hiện tại chưa đạt sao

Tôi đo cả hai bếp bằng cùng một cân. Đây là số thật, không phải cảm tính.

| | linear.app | Custodian Vault |
|---|---|---|
| Màu có sắc trong 12 màu dùng nhiều nhất | 5 | **7** |
| Màu nhấn nổi nhất / màu chữ chính | 90 / 7035 = **1:78** | 16 / 174 = **1:11** |
| Độ đậm tiêu đề H1 | **510** | **700** |
| Giãn chữ H1 | −0.022em | −0.010em |
| Viền + nền trên một trang | thưa | **21 viền, 23 nền** |

Chẩn đoán của bếp trưởng: **món bị nêm quá tay.** Vàng, xanh lá, vàng nhạt, xanh navy,
hai sắc xám xanh — tất cả cùng hét trên một đĩa. Tiêu đề thì đậm như chữ trên bao bì.
Mọi khối đều có viền và nền, nên mắt không biết nhìn đâu trước.

Linear không đẹp hơn vì họ có màu đẹp hơn. Họ đẹp hơn vì họ **kiềm chế**.

---

## Mise en place — bốn nguyên liệu, không hơn

Khai báo một lần trong `globals.css`. Thiếu kỷ luật ở đây thì cả bếp loạn.

```css
:root {
  /* Nền: KHÔNG dùng #000. Đen tuyệt đối làm mắt mỏi và trông rẻ tiền. */
  --bg:        #07080B;   /* nền trang, giữ nguyên bản hiện tại - đã đúng */
  --surface:   #0E1016;   /* thẻ, panel. Chênh nền vừa đủ để thấy, không cần viền */
  --line:      rgba(255,255,255,0.07);

  /* Chữ: KHÔNG dùng #fff thuần cho văn bản dài. */
  --ink:       #F7F8F8;   /* tiêu đề, số liệu quan trọng */
  --ink-2:     #9BA1AC;   /* mô tả, nhãn */
  --ink-3:     #61666E;   /* chú thích, metadata */

  /* MỘT màu nhấn. Một thôi. Vàng hổ phách của các anh đã hợp chủ đề khảo cổ. */
  --accent:    #F59E0B;

  /* Hai màu trạng thái, chỉ dùng cho trạng thái, không dùng trang trí */
  --ok:        #6EE7B7;
  --no:        #FB7185;
}
```

**Luật vàng:** màu nhấn xuất hiện tối đa **một lần mỗi màn hình**. Nếu đang có hai chỗ
dùng `--accent`, một trong hai phải đổi sang `--ink-2`. Linear giữ tỷ lệ 1:78; các anh
đang ở 1:11. Nhắm tới 1:40 là đã sang hẳn.

---

## Kỹ thuật 1 — Giảm lửa phần chữ

Đây là thay đổi cho hiệu quả cao nhất với ít công nhất.

```css
h1 {
  font-size: clamp(2.2rem, 5vw, 3.25rem);
  font-weight: 500;        /* KHÔNG phải 700. Linear dùng 510. */
  letter-spacing: -0.022em; /* chữ càng to, giãn càng âm */
  line-height: 1.08;
}
h2 { font-weight: 500; letter-spacing: -0.018em; line-height: 1.15; }
body { font-size: 16px; line-height: 1.5; }  /* 16/24, tỷ lệ của Linear */
```

Chữ to mà nhẹ thì sang. Chữ to mà đậm thì gào. Đó là khác biệt giữa một tấm biển
đồng khắc và một tờ rơi giảm giá.

**Về font Cinzel:** giữ nó, nhưng **chỉ cho một thứ** — tên sản phẩm "Custodian Vault"
trên header. Dùng serif cho mọi tiêu đề khiến trang trông như thiệp mời đám cưới.
Mọi tiêu đề khác dùng Inter.

---

## Kỹ thuật 2 — Bỏ bớt đĩa

Hiện có 21 viền và 23 nền. Quá nhiều hộp lồng hộp.

Quy tắc: **một khối chỉ được chọn MỘT cách để tách mình khỏi nền.**

- Có nền `--surface` → **không viền**.
- Có viền `--line` → **không nền**.
- Không cả hai → dùng khoảng trắng. Đây là lựa chọn mặc định nên ưu tiên.

Bốn thẻ "Field Sealing / Blur / Quorum / Decrypt" hiện mỗi thẻ một màu số. Bỏ hết màu,
chỉ giữ số bằng `--ink-3` và chữ bằng `--ink-2`. Chúng là chú thích, không phải nhân vật chính.

---

## Kỹ thuật 3 — Nhịp 8 điểm

Mọi khoảng cách là bội của 8: `8 / 16 / 24 / 32 / 48 / 64 / 96`.
Không có 13px, không có 22px. Mắt người đọc được nhịp đều, dù không ý thức.

Khoảng cách giữa các khối lớn: **64 hoặc 96**. Hiện đang quá chật, mọi thứ dính nhau.

---

## Kỹ thuật 4 — Một nét ký riêng

"Đẹp" thì theo công thức được. "Độc đáo" thì cần **một** chi tiết không ai có.

Đừng thêm năm thứ. Chọn **một**, làm cho thật kỹ:

> **Đề xuất của tôi: vòng tròn mờ 50 km.**
>
> Mỗi thẻ site vẽ một vòng tròn SVG mảnh, nét đứt, màu `--ink-3`, bán kính tỷ lệ với
> 50 km. Toạ độ thật là một chấm — nhưng chấm đó **không có** khi chưa mở khoá. Khi hai
> steward đồng ý, chấm `--accent` xuất hiện ở tâm, kèm một hiệu ứng toả ra 400ms.
>
> Đó chính là toàn bộ câu chuyện sản phẩm, kể bằng một hình. Giám khảo sẽ nhớ nó.

Đây cũng là khung hình đắt nhất cho video ở phút 1:10.

---

## Dressage — trước khi dọn ra bàn

Tự chấm, thành thật:

- [ ] Mở trang, nheo mắt lại. Thứ nổi lên đầu tiên có phải thứ quan trọng nhất không?
- [ ] Đếm số màu có sắc trên một màn hình. Quá 3 là hỏng.
- [ ] Có khối nào vừa có viền vừa có nền không?
- [ ] Mọi khoảng cách có chia hết cho 8 không?
- [ ] Tiêu đề có đang ở weight 700 không? Hạ xuống 500.
- [ ] Màn hình nào cũng phải có một vùng trống rộng. Nếu không có, chưa xong.

---

## Lời cuối của bếp trưởng

Ba sao Michelin không đến từ việc thêm nguyên liệu. Nó đến từ việc **dám bỏ bớt**, rồi
làm những thứ còn lại thật hoàn hảo.

Các anh đang còn khoảng một tiếng. Đừng làm lại cả bếp. Làm đúng bốn việc này, theo
thứ tự, mỗi việc 10 phút:

1. Hạ `font-weight` tiêu đề xuống 500, thêm `letter-spacing: -0.022em`.
2. Bỏ màu ở bốn thẻ quy trình, chuyển hết sang thang xám.
3. Gỡ viền ở những khối đã có nền.
4. Nới khoảng cách giữa các khối lớn lên 64px.

Bốn việc đó không đụng tới logic, không thể làm hỏng demo, và đủ để món ăn đổi hạng.
Vòng tròn 50 km để dành nếu còn thời gian.

*Bon courage.*
