# TÀI LIỆU NHẬN DIỆN CÁC BÊN LIÊN QUAN
## Đề tài: Website thương mại điện tử tích hợp trợ lý mua sắm AI

| Mục | Nội dung |
|---|---|
| Mã tài liệu | BA-02-STK |
| Phiên bản | 1.0 |
| Ngày lập | __/__/2026 |
| Người lập | Business Analyst |
| Giai đoạn | Khởi tạo dự án — Phân tích các bên liên quan |
| Trạng thái | Chờ phê duyệt |
| Tài liệu liên quan | BA-01-REQ (Tổng hợp yêu cầu), BA-03-INT (Kịch bản khảo sát — Phỏng vấn) |

**Lịch sử thay đổi**

| Phiên bản | Ngày | Người sửa | Nội dung |
|---|---|---|---|
| 1.0 | __/__/2026 | BA | Bản đầu tiên |

---

## 1. MỤC ĐÍCH VÀ PHƯƠNG PHÁP

### 1.1. Vì sao phải làm bước này trước khi khảo sát

Nhận diện các bên liên quan là bước **đứng trước** hoạt động khảo sát yêu cầu, không phải bước song song. Lý do rất thực tế:

- Không biết ai là bên liên quan thì không biết **phỏng vấn ai**, và sẽ bỏ sót đúng người nắm thông tin quan trọng nhất.
- Không phân biệt mức độ ảnh hưởng thì sẽ **dành thời gian sai chỗ** — hỏi kỹ người không quyết được gì, trong khi người quyết định thì chưa gặp lần nào.
- Bỏ sót một bên liên quan có quyền phủ quyết là nguyên nhân phổ biến nhất khiến dự án phải làm lại từ đầu ở giai đoạn cuối.

### 1.2. Phương pháp nhận diện

Sử dụng ba hướng rà soát để tránh bỏ sót:

| Hướng rà soát | Câu hỏi dẫn đường | Nhóm phát hiện được |
|---|---|---|
| Theo vai trò trong dự án | Ai làm ra sản phẩm? Ai đánh giá? Ai quyết định phạm vi? | Nhóm thực hiện, giảng viên, hội đồng |
| Theo vòng đời sử dụng sản phẩm | Ai dùng hằng ngày? Ai chịu ảnh hưởng gián tiếp? | Khách hàng, người vận hành cửa hàng |
| Theo chuỗi phụ thuộc kỹ thuật | Hệ thống cần dịch vụ nào của ai để chạy được? | Các nhà cung cấp dịch vụ bên ngoài |

### 1.3. Mức độ tin cậy của thông tin

Ở giai đoạn khởi tạo, phần lớn hiểu biết về các bên liên quan còn là **giả định**. Tài liệu ghi rõ mức tin cậy của từng mục:

| Ký hiệu | Nghĩa |
|---|---|
| **[Xác định]** | Đã biết chắc chắn, có căn cứ rõ ràng |
| **[Giả định]** | BA suy đoán theo thông lệ, **bắt buộc kiểm chứng qua khảo sát** |
| **[Chưa rõ]** | Chưa có thông tin, cần thu thập |

---

## 2. DANH SÁCH CÁC BÊN LIÊN QUAN

Ký hiệu: `STK-[nhóm]-[số]`. Bốn nhóm: **NB** (nội bộ dự án), **HT** (học thuật), **ND** (người dùng hệ thống), **BN** (bên ngoài / nhà cung cấp).

### 2.1. Nhóm NB — Nội bộ dự án

| Mã | Bên liên quan | Vai trò cần đảm nhiệm | Người phụ trách | Mức tin cậy |
|---|---|---|---|---|
| STK-NB-01 | Trưởng nhóm dự án | Điều phối công việc, quyết định khi nhóm bất đồng, làm việc với giảng viên, chịu trách nhiệm tiến độ chung | `[CHƯA PHÂN CÔNG]` | [Chưa rõ] |
| STK-NB-02 | Phân tích nghiệp vụ (BA) | Khảo sát yêu cầu, viết tài liệu phân tích, vẽ sơ đồ, làm cầu nối giữa yêu cầu và kỹ thuật | `[CHƯA PHÂN CÔNG]` | [Chưa rõ] |
| STK-NB-03 | Phát triển phía máy chủ | Thiết kế cơ sở dữ liệu, xây dựng dịch vụ xử lý nghiệp vụ, tích hợp dịch vụ bên ngoài | `[CHƯA PHÂN CÔNG]` | [Chưa rõ] |
| STK-NB-04 | Phát triển giao diện | Xây dựng giao diện người dùng và khu vực quản trị | `[CHƯA PHÂN CÔNG]` | [Chưa rõ] |
| STK-NB-05 | Kiểm thử | Lập kịch bản kiểm thử, thử nghiệm, ghi nhận lỗi | `[CHƯA PHÂN CÔNG]` | [Chưa rõ] |

**Thành viên nhóm:** dự án có **3 thành viên**. Với 5 vai trò cần đảm nhiệm, mỗi người sẽ phải kiêm nhiệm ít nhất hai vai trò.

| # | Họ tên | Vai trò chính | Vai trò kiêm nhiệm |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

> **Cảnh báo về vai trò kiêm nhiệm.** Hai cặp vai trò dưới đây nếu để cùng một người sẽ làm giảm chất lượng, cần lưu ý khi phân công:
>
> - **Lập trình viên kiêm kiểm thử phần mình viết.** Người viết mã có thiên kiến tự nhiên: họ kiểm thử theo đúng cách họ nghĩ hệ thống sẽ được dùng, nên bỏ sót đúng những tình huống họ chưa nghĩ tới. Đề xuất: kiểm thử chéo — mỗi người thử phần của người khác.
> - **BA kiêm lập trình viên cùng một phần.** Dễ dẫn tới việc viết tài liệu sao cho khớp với thứ mình đã trót viết, thay vì viết mã theo đúng yêu cầu đã phân tích.
>
> Với nhóm 3 người thì không tránh được kiêm nhiệm hoàn toàn, nhưng **biết mà chấp nhận** khác với **không biết**. Nêu rõ điểm này khi bảo vệ sẽ được đánh giá cao hơn là giấu đi.

**Việc cần làm ngay:** hoàn thành bảng phân công trên trong buổi họp nhóm đầu tiên (PV-05, nhóm câu hỏi E1). Chưa phân công rõ thì không ai chịu trách nhiệm về tài liệu và kiểm thử — hai phần dễ bị bỏ rơi nhất.

### 2.2. Nhóm HT — Học thuật

| Mã | Bên liên quan | Vai trò | Mức tin cậy |
|---|---|---|---|
| STK-HT-01 | **Giảng viên hướng dẫn** | Định nghĩa yêu cầu của môn học, hướng dẫn trong quá trình làm, đánh giá kết quả | [Xác định] — nhưng danh tính và yêu cầu cụ thể `[Chưa rõ]` |
| STK-HT-02 | Hội đồng đánh giá / giảng viên phản biện | Chất vấn khi bảo vệ, đánh giá độc lập | [Giả định] — cần xác nhận có buổi bảo vệ không |
| STK-HT-03 | Cơ sở đào tạo | Quy định về hình thức trình bày, liêm chính học thuật | [Xác định] |

> **Đây là nhóm có quyền quyết định cao nhất đối với thành công của dự án.** Với một đồ án môn học, "thành công" được định nghĩa bởi giảng viên, không phải bởi nhóm. Mọi mong muốn khác — kể cả của chính nhóm — đều xếp sau tiêu chí chấm điểm.

### 2.3. Nhóm ND — Người dùng hệ thống

| Mã | Bên liên quan | Mô tả | Mức tin cậy |
|---|---|---|---|
| STK-ND-01 | **Khách tham quan** (chưa đăng nhập) | Vào website xem hàng, chưa có tài khoản. Là nguồn khách hàng tiềm năng | [Giả định] |
| STK-ND-02 | **Khách hàng** (đã đăng nhập) | Người mua hàng, sử dụng đầy đủ chức năng | [Giả định] |
| STK-ND-03 | **Người vận hành cửa hàng** | Nhập sản phẩm, xử lý đơn hàng, theo dõi doanh thu | [Giả định] |

**Lưu ý quan trọng về nhóm ND:** trong một đồ án môn học, ba vai trò này **không có người thật đảm nhiệm**. Hệ thống chưa vận hành nên chưa có khách hàng, và vai trò người vận hành sẽ do chính thành viên nhóm đóng khi demo.

Hệ quả cần thừa nhận thẳng thắn: **mọi phát biểu về "người dùng muốn gì" ở thời điểm này đều là giả định của nhóm, không phải dữ liệu.** Cách xử lý đúng đắn không phải là né tránh mà là:

1. Khảo sát **người dùng đại diện** — người có đặc điểm giống người dùng mục tiêu (từng mua hàng điện tử trực tuyến), dù không phải khách hàng của hệ thống;
2. **Ghi rõ trong tài liệu** rằng đây là người dùng đại diện, không phải khách hàng thật;
3. Không trình bày kết quả khảo sát nhóm nhỏ như thể là dữ liệu thị trường.

Một đồ án nêu rõ giới hạn phương pháp của mình thường được đánh giá cao hơn đồ án khẳng định chắc nịch những điều không có căn cứ.

### 2.4. Nhóm BN — Bên ngoài và nhà cung cấp dịch vụ

Đây là các bên **hệ thống phụ thuộc vào**. Điểm chung: không thương lượng được, không quan tâm tới dự án, và mỗi bên là một điểm hỏng tiềm tàng.

| Mã | Bên liên quan | Vai trò dự kiến | Hậu quả nếu gián đoạn |
|---|---|---|---|
| STK-BN-01 | Nhà cung cấp mô hình ngôn ngữ lớn | Cung cấp năng lực hiểu ngôn ngữ tự nhiên cho trợ lý AI | **Mất chức năng cốt lõi của đề tài** |
| STK-BN-02 | Cổng thanh toán trực tuyến | Xử lý thanh toán không dùng tiền mặt | Chỉ còn phương thức thanh toán khi nhận hàng |
| STK-BN-03 | Nhà cung cấp dịch vụ thư điện tử | Gửi mã xác minh tài khoản, thông báo cho khách | **Không ai đăng ký được tài khoản mới** |
| STK-BN-04 | Nhà cung cấp dịch vụ lưu trữ hình ảnh | Lưu và phân phối ảnh sản phẩm | Sản phẩm hiển thị không có ảnh |
| STK-BN-05 | Nhà cung cấp đăng nhập mạng xã hội | Cho phép đăng nhập nhanh | Còn cách đăng nhập thông thường |
| STK-BN-06 | Nhà cung cấp hạ tầng cơ sở dữ liệu | Lưu trữ toàn bộ dữ liệu hệ thống | **Hệ thống ngừng hoạt động hoàn toàn** |
| STK-BN-07 | Nền tảng lưu trữ mã nguồn | Nơi nhóm cộng tác và quản lý phiên bản | Mất khả năng làm việc chung |

> **Cần khảo sát điều kiện sử dụng của từng dịch vụ ngay trong tuần đầu**, trước khi thiết kế phụ thuộc vào chúng. Ba câu hỏi cho mỗi dịch vụ: (1) có gói miễn phí không, hạn mức bao nhiêu; (2) điều kiện đăng ký có yêu cầu pháp nhân không; (3) có môi trường thử nghiệm không.
>
> Phát hiện một dịch vụ không dùng được ở tuần đầu chỉ tốn một buổi tìm phương án thay thế. Phát hiện điều đó ở tuần cuối có thể phải bỏ cả một chức năng.

---

## 3. PHÂN KHÚC NGƯỜI DÙNG MỤC TIÊU

Phần này trả lời câu hỏi: **hệ thống được xây cho ai?** Đây là cơ sở để quyết định giao diện, cách trợ lý AI trò chuyện, và mức giá sản phẩm cần tập trung.

> **Toàn bộ mục 3 là [Giả định].** Ba phân khúc dưới đây do BA đề xuất dựa trên đặc thù thị trường hàng điện tử, **chưa được kiểm chứng bằng khảo sát**. Mục đích của việc viết ra là để có cái mà kiểm chứng — một giả định viết rõ ràng có thể bị bác bỏ, còn một giả định ngầm thì không.

### 3.1. Phân khúc 1 — Người mua thiếu kiến thức kỹ thuật *(phân khúc trọng tâm)*

| Mục | Nội dung |
|---|---|
| Đặc điểm | Cần mua thiết bị điện tử nhưng không đủ kiến thức đánh giá thông số. Biết rõ mình cần **làm gì** với máy, không biết máy nào **làm được** việc đó |
| Ví dụ điển hình | Sinh viên năm nhất cần laptop học lập trình; phụ huynh mua máy tính cho con; người đi làm cần điện thoại pin khoẻ |
| Điều họ cần | Có người dịch nhu cầu của mình sang lựa chọn cụ thể, kèm giải thích dễ hiểu |
| Điểm khó hiện tại | Bộ lọc trên các sàn yêu cầu họ phải biết trước cần thông số gì — đúng thứ họ đang thiếu |
| **Vì sao là trọng tâm** | Đây chính là nhóm mà trợ lý AI tạo ra giá trị lớn nhất. Nếu sản phẩm không phục vụ tốt nhóm này thì lý do tồn tại của đề tài không còn |

### 3.2. Phân khúc 2 — Người mua đã biết rõ mình cần gì

| Mục | Nội dung |
|---|---|
| Đặc điểm | Đã nghiên cứu kỹ, biết chính xác model cần mua, chỉ so giá và kiểm tra tình trạng hàng |
| Điều họ cần | Tìm kiếm nhanh, thông tin sản phẩm đầy đủ và chính xác, đặt hàng gọn |
| Thái độ với trợ lý AI | **Nhiều khả năng không dùng** — họ không cần tư vấn |
| Hệ quả thiết kế | Trợ lý AI **không được cản trở** luồng mua hàng thông thường. Nếu cửa sổ trò chuyện che mất nội dung hoặc tự bật lên gây khó chịu, nhóm này sẽ rời đi |

### 3.3. Phân khúc 3 — Người mua chờ giảm giá

| Mục | Nội dung |
|---|---|
| Đặc điểm | Đã chọn được sản phẩm nhưng chưa mua vì thấy giá cao, đang chờ đợt giảm giá |
| Điều họ cần | Được báo khi giá xuống mức chấp nhận được |
| Liên quan yêu cầu | YC-H-01 → YC-H-03 (theo dõi giá) |
| Cần kiểm chứng | Hành vi này có phổ biến với hàng điện tử không, và họ muốn được báo qua kênh nào |

### 3.4. Ba giả định cốt lõi cần kiểm chứng trước khi lập trình

| # | Giả định | Nếu sai thì sao | Kiểm chứng ở đâu |
|---|---|---|---|
| GĐ-A | Người mua hàng điện tử thực sự gặp khó khi chuyển nhu cầu thành lựa chọn sản phẩm | **Toàn bộ lý do tồn tại của đề tài bị lung lay** | PV-02, nhóm câu hỏi B1–B2 |
| GĐ-B | Người dùng sẵn lòng trò chuyện với trợ lý AI thay vì tự tìm kiếm | Chức năng cốt lõi làm ra nhưng không ai dùng | PV-02 nhóm B3; PV-03 nhóm C2 |
| GĐ-C | Người dùng tin tưởng đủ để làm theo gợi ý của AI | Trợ lý trở thành phần trang trí, không ảnh hưởng quyết định mua | PV-02 nhóm B3; PV-03 nhóm C2 |

> **Đây là ba câu hỏi quan trọng nhất của cả dự án.** Nếu GĐ-A sai thì mọi công sức lập trình đều đổ vào một vấn đề không tồn tại. Nên kiểm chứng **trước khi viết dòng mã đầu tiên của chức năng trợ lý AI**, không phải sau khi làm xong.

---

## 4. HỒ SƠ CHI TIẾT CÁC BÊN LIÊN QUAN CHÍNH

### STK-HT-01 — Giảng viên hướng dẫn

| Mục | Nội dung |
|---|---|
| Mức ưu tiên | **Số 1** |
| Quyền hạn | Định nghĩa yêu cầu, đánh giá kết quả. Trên thực tế là người **quyết định thế nào là hoàn thành** |
| Nhu cầu | [Giả định] Sinh viên hiểu rõ thứ mình làm; sản phẩm chạy được; tài liệu phân tích thiết kế đầy đủ; thể hiện được kiến thức môn học |
| Điều lo ngại | [Giả định] Sinh viên làm mà không hiểu, hoặc sao chép; đồ án chỉ có tính năng mà thiếu phân tích |
| Ảnh hưởng tới dự án | Toàn diện. Một yêu cầu về tài liệu có thể quan trọng hơn năm chức năng mới |
| Kênh trao đổi | `[Chưa rõ]` — cần xác lập ngay |
| Việc cần làm | Gặp trong tuần đầu (PV-01). **Đây là việc cần làm trước mọi việc khác của dự án** |

### STK-NB-01 — Trưởng nhóm dự án

| Mục | Nội dung |
|---|---|
| Mức ưu tiên | Cao |
| Trách nhiệm | Điều phối, phân công, theo dõi tiến độ, làm việc với giảng viên, quyết định khi nhóm bất đồng |
| Nhu cầu | Nhóm làm việc đều tay, tiến độ kiểm soát được, phạm vi không phình ra |
| Điều lo ngại | Thành viên không hoàn thành phần việc; phát hiện vấn đề quá muộn |
| Rủi ro cần lưu ý | Nếu trưởng nhóm đồng thời là người viết phần lớn mã nguồn thì hiểu biết bị dồn vào một người — nhóm sẽ tê liệt khi người đó bận. Cần chủ động chia sẻ hiểu biết trong các buổi họp định kỳ |

### STK-ND-03 — Người vận hành cửa hàng

| Mục | Nội dung |
|---|---|
| Mức ưu tiên | Cao — là người dùng chịu ảnh hưởng nặng nhất nếu thiết kế sai |
| Đặc điểm | Trong đồ án, vai trò do thành viên nhóm đóng khi demo. Trong thực tế là chủ cửa hàng hoặc nhân viên, **không có kiến thức kỹ thuật** |
| Công việc hằng ngày | [Giả định] Nhập sản phẩm mới, kiểm tra đơn hàng mới, cập nhật trạng thái đơn, xác nhận đã thu tiền, xem doanh thu |
| Nhu cầu | Thao tác nhanh, ít bước; nhìn thấy ngay việc cần xử lý; không cần đọc hướng dẫn dài |
| Điểm khó dự đoán được | **Nhập liệu sản phẩm điện tử rất nặng** — mỗi sản phẩm có nhiều hình ảnh và hàng chục thông số kỹ thuật. Nếu thiết kế bắt nhập từng thông số qua biểu mẫu rời rạc thì việc nhập 50 sản phẩm sẽ mất nhiều giờ |
| Cần làm rõ | Có cần chức năng nhập hàng loạt không (YC-I-10) — hỏi ở PV-04 |

### STK-ND-01 và STK-ND-02 — Khách hàng

| Mục | Nội dung |
|---|---|
| Mức ưu tiên | Cao về giá trị, thấp về khả năng tiếp cận |
| Vấn đề | **Không có khách hàng thật để khảo sát** — hệ thống chưa tồn tại |
| Phương án | Phỏng vấn 3–5 người dùng đại diện: từng mua hàng điện tử trực tuyến trong 6 tháng gần đây |
| Tiêu chí chọn mẫu | Cần **ít nhất một người chưa từng dùng trợ lý ảo mua hàng**, để tránh mẫu thiên lệch về phía người thạo công nghệ |
| Điều cần biết nhất | Họ có tin lời tư vấn của trợ lý AI không, và điều gì làm họ mất lòng tin |

---

## 5. MA TRẬN QUYỀN LỰC – MỨC QUAN TÂM

Hai trục: **quyền lực** (khả năng tác động tới kết quả dự án) và **mức quan tâm** (mức độ bị ảnh hưởng bởi dự án).

```
        CAO │  GIỮ HÀI LÒNG              │  QUẢN LÝ SÁT SAO
            │                            │
            │  STK-HT-02 Hội đồng        │  STK-HT-01 Giảng viên hướng dẫn
            │  STK-BN-01 Dịch vụ AI      │  STK-NB-01 Trưởng nhóm
   Q        │  STK-BN-03 Thư điện tử     │  STK-NB-02 Phân tích nghiệp vụ
   U        │  STK-BN-06 Cơ sở dữ liệu   │  STK-NB-03 Phát triển máy chủ
   Y        │  STK-BN-02 Cổng thanh toán │  STK-NB-04 Phát triển giao diện
   Ề        │                            │  STK-NB-05 Kiểm thử
   N        │                            │
            ├────────────────────────────┼────────────────────────────
   L        │  THEO DÕI                  │  GIỮ THÔNG TIN
   Ự        │                            │
   C        │  STK-HT-03 Cơ sở đào tạo   │  STK-ND-02 Khách hàng
            │  STK-BN-04 Lưu trữ ảnh     │  STK-ND-03 Người vận hành
            │  STK-BN-05 Đăng nhập MXH   │  STK-ND-01 Khách tham quan
        THẤP│  STK-BN-07 Lưu trữ mã nguồn│
            └────────────────────────────┴────────────────────────────
              THẤP        MỨC QUAN TÂM        CAO
```

**Ba điều cần rút ra từ ma trận này:**

1. **Bên có quyền quyết định cao nhất lại là bên nhóm ít thông tin nhất.** Giảng viên nằm ở ô "quản lý sát sao" nhưng hiện chưa có kênh trao đổi nào được xác lập. Đây là mâu thuẫn nguy hiểm nhất ở thời điểm khởi tạo, và việc cần làm đầu tiên là gặp giảng viên — không phải chọn công nghệ hay dựng khung dự án.

2. **Người dùng cuối có mức quan tâm cao nhưng quyền lực thấp.** Trong dự án thương mại thật, người dùng là bên trả tiền nên có quyền lực lớn. Trong đồ án thì không — họ không tồn tại. Điều này tạo ra một cám dỗ nguy hiểm: **thiết kế theo ý mình rồi tự thuyết phục rằng người dùng cũng muốn thế.** Cách chống lại: khảo sát người dùng đại diện, và ghi lại nguyên văn những gì họ nói.

3. **Các nhà cung cấp dịch vụ có quyền lực cao nhưng mức quan tâm bằng không.** Họ không biết dự án này tồn tại. Không thể "quản lý" họ — chỉ có thể chọn dịch vụ cẩn thận từ đầu và chuẩn bị phương án dự phòng.

---

## 6. MA TRẬN RACI

R = Thực hiện | A = Chịu trách nhiệm cuối | C = Được hỏi ý kiến | I = Được thông báo

| Hoạt động | Trưởng nhóm | BA | Dev máy chủ | Dev giao diện | Kiểm thử | Giảng viên |
|---|---|---|---|---|---|---|
| Thu thập yêu cầu môn học | A | R | I | I | I | **C** |
| Khảo sát yêu cầu người dùng | C | **R/A** | I | C | I | I |
| Lập tài liệu phân tích | C | **R/A** | C | C | C | **C** |
| Chốt phạm vi phiên bản đầu | **A** | R | C | C | C | **C** |
| Thiết kế cơ sở dữ liệu | C | C | **R/A** | I | I | I |
| Thiết kế giao diện | C | C | I | **R/A** | C | I |
| Lập trình | A | I | R | R | I | I |
| Lập kịch bản kiểm thử | I | C | C | C | **R/A** | I |
| Kiểm thử hệ thống | A | C | C | C | **R** | I |
| Chuẩn bị demo và bảo vệ | **R/A** | R | R | R | R | I |
| **Đánh giá kết quả cuối cùng** | I | I | I | I | I | **R/A** |

**Hai điểm cần chú ý khi đọc bảng:**

- Dòng cuối cùng, **chỉ giảng viên có chữ R và A**. Đây không phải chi tiết hình thức mà là thực tế cần nhóm ý thức: nhóm làm ra sản phẩm, nhưng người phán quyết đủ hay chưa đủ là giảng viên. Vì vậy dòng "Chốt phạm vi" phải có ý kiến của giảng viên (chữ C), nếu không nhóm có thể tự cho là "xong" trong khi giảng viên đánh giá là thiếu.
- Với nhóm 3 người kiêm nhiệm, một người sẽ mang nhiều cột. Cần ánh xạ bảng này về từng người cụ thể sau khi hoàn thành phân công ở mục 2.1.

---

## 7. KẾ HOẠCH TƯƠNG TÁC

| Bên liên quan | Mục tiêu tương tác | Hình thức | Tần suất |
|---|---|---|---|
| STK-HT-01 Giảng viên | Nắm yêu cầu, báo cáo tiến độ, xin ý kiến khi có quyết định lớn | Gặp trong giờ hướng dẫn; thư điện tử khi cần gấp | Lần đầu ngay tuần này; sau đó theo lịch hướng dẫn |
| STK-NB Nhóm dự án | Đồng bộ tiến độ, tháo gỡ vướng mắc, kiểm tra chéo | Họp nhóm | Hằng tuần, cố định lịch |
| STK-ND Người dùng đại diện | Kiểm chứng giả định GĐ-A, GĐ-B, GĐ-C | Phỏng vấn trực tiếp | Một đợt trước khi lập trình; một đợt thử nghiệm khi có bản chạy được |
| STK-BN Nhà cung cấp dịch vụ | Xác nhận điều kiện sử dụng, hạn mức, khả năng đăng ký | Tự tra cứu tài liệu và đăng ký thử | Ngay tuần đầu |

> **Về tần suất họp nhóm:** đặt lịch cố định hằng tuần quan trọng hơn việc họp dài. Nhóm sinh viên thường bắt đầu bằng việc "khi nào cần thì họp", và kết quả là ba tuần trôi qua không ai biết người khác làm tới đâu.

---

## 8. RỦI RO LIÊN QUAN TỚI CÁC BÊN LIÊN QUAN

| Mã | Rủi ro | Bên liên quan | Khả năng | Tác động | Biện pháp |
|---|---|---|---|---|---|
| RS-01 | Nhóm không nắm rõ yêu cầu và tiêu chí chấm, làm sai hướng | STK-HT-01 | **Cao** | **Rất cao** | Gặp giảng viên ngay tuần đầu, trước khi lập trình |
| RS-02 | Phân công không rõ, việc tài liệu và kiểm thử không ai nhận | STK-NB | **Cao** | Cao | Hoàn thành bảng phân công mục 2.1 trong buổi họp đầu tiên, ghi thành văn bản |
| RS-03 | Thiết kế theo cảm tính của nhóm thay vì theo nhu cầu người dùng | STK-ND | **Cao** | Cao | Bắt buộc khảo sát người dùng đại diện trước khi chốt thiết kế trợ lý AI |
| RS-04 | Không đăng ký được dịch vụ bên ngoài do thiếu điều kiện | STK-BN-02 | Trung bình | Cao | Khảo sát điều kiện đăng ký ngay tuần đầu; chuẩn bị phương án thay thế |
| RS-05 | Dịch vụ AI vượt hạn mức miễn phí giữa chừng | STK-BN-01 | Trung bình | **Rất cao** | Tìm hiểu hạn mức trước; giới hạn số lượt hỏi; chuẩn bị kịch bản demo dự phòng |
| RS-06 | Thành viên tham gia không đều, phát hiện quá muộn | STK-NB | Trung bình | Trung bình | Họp tuần cố định; mỗi buổi mỗi người trình bày phần việc của mình |
| RS-07 | Hiểu biết dồn vào một người, người đó bận thì nhóm dừng | STK-NB-01 | Trung bình | Cao | Chia sẻ hiểu biết trong họp tuần; ghi lại các quyết định quan trọng bằng văn bản |
| RS-08 | Dịch vụ bên ngoài gián đoạn đúng buổi bảo vệ | STK-BN-01, 02, 03 | Trung bình | Cao | Chuẩn bị bản ghi màn hình quá trình demo và dữ liệu mẫu sẵn có |

---

## 9. THỨ TỰ TIẾP CẬN

| Thứ tự | Bên liên quan | Lý do đặt ở vị trí này | Buổi |
|---|---|---|---|
| **1** | Giảng viên hướng dẫn | Câu trả lời của bên này quyết định phạm vi mọi việc còn lại. Hỏi sau sẽ phải làm lại | PV-01 |
| **2** | Người dùng đại diện — phân khúc trọng tâm | Kiểm chứng ba giả định cốt lõi GĐ-A, GĐ-B, GĐ-C trước khi lập trình chức năng chính | PV-02 |
| **2b** | Người dùng rành công nghệ | Tìm ra điều gì khiến nhóm này khó chịu, để trợ lý AI không cản trở luồng mua hàng thông thường | PV-03 |
| 3 | Nhà cung cấp dịch vụ *(tự khảo sát)* | Xác nhận tính khả thi kỹ thuật trước khi thiết kế phụ thuộc vào chúng | — |
| 4 | Người có kinh nghiệm bán lẻ điện tử | Hiểu quy trình vận hành thật, tránh thiết kế khu vực quản trị theo tưởng tượng | PV-04 |
| **5** | Nội bộ nhóm | Chốt phạm vi, phân công, thống nhất quy tắc nghiệp vụ — **sau khi đã có đủ thông tin từ bốn bước trên** | PV-05 |

> **Về vị trí của buổi họp nhóm:** thường các nhóm sinh viên làm ngược — họp nhóm trước, chốt luôn phạm vi, rồi mới đi hỏi. Cách đó dẫn tới việc phải sửa lại phạm vi sau khi đã lập trình được một phần. Họp nhóm chốt phạm vi nên diễn ra **sau** khi đã biết giảng viên yêu cầu gì và người dùng cần gì.

Chi tiết câu hỏi cho từng buổi: xem **BA-03-INT**.

---

## 10. PHÊ DUYỆT

| Vai trò | Họ tên | Ngày | Ý kiến |
|---|---|---|---|
| Người lập | | | |
| Đại diện nhóm dự án | | | |
| Giảng viên hướng dẫn | | | |

---

*Hết tài liệu BA-02-STK v1.0*
