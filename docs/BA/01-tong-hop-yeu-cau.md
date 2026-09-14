# TÀI LIỆU TỔNG HỢP YÊU CẦU DỰ ÁN
## Đề tài: Website thương mại điện tử tích hợp trợ lý mua sắm AI

| Mục | Nội dung |
|---|---|
| Mã tài liệu | BA-01-REQ |
| Phiên bản | 1.0 |
| Ngày lập | __/__/2026 |
| Người lập | Business Analyst |
| Giai đoạn | Khởi tạo dự án — Phân tích yêu cầu |
| Trạng thái | Chờ phê duyệt |
| Tài liệu liên quan | BA-02-STK (Nhận diện các bên liên quan), BA-03-INT (Kịch bản khảo sát — Phỏng vấn) |

**Lịch sử thay đổi**

| Phiên bản | Ngày | Người sửa | Nội dung |
|---|---|---|---|
| 1.0 | __/__/2026 | BA | Bản đầu tiên — tổng hợp yêu cầu từ các nguồn tài liệu đầu vào |

---

## 1. MỤC ĐÍCH VÀ PHẠM VI CỦA TÀI LIỆU

### 1.1. Mục đích

Tài liệu này tổng hợp **toàn bộ nguồn tài liệu đầu vào** của dự án và rút ra **tập yêu cầu sơ bộ ở mức nghiệp vụ**, làm cơ sở cho:

- Xác định phạm vi dự án và thống nhất với các bên liên quan;
- Lập kế hoạch khảo sát bổ sung (phỏng vấn — xem BA-03-INT);
- Là đầu vào cho bước đặc tả yêu cầu chi tiết (SRS) và thiết kế hệ thống ở giai đoạn sau.

### 1.2. Tài liệu này KHÔNG phải là gì

Cần nói rõ để tránh hiểu sai vai trò của tài liệu:

- **Không phải đặc tả yêu cầu phần mềm (SRS).** Yêu cầu ở đây ở mức nghiệp vụ, chưa chi tiết tới mức lập trình được. Đặc tả chi tiết là sản phẩm của giai đoạn sau, sau khi phạm vi được chốt.
- **Không phải bản thiết kế.** Tài liệu mô tả **hệ thống cần làm được gì**, không mô tả **làm bằng cách nào**. Các lựa chọn công nghệ nêu ở mục 8 chỉ là ràng buộc/định hướng, không phải thiết kế.
- **Không phải bản chốt cuối cùng.** Nhiều yêu cầu còn ở trạng thái giả định, cần được kiểm chứng qua khảo sát. Mọi mục đánh dấu `[CẦN LÀM RÕ]` phải có câu trả lời trước khi bắt đầu lập trình.

### 1.3. Đối tượng đọc

Nhóm thực hiện dự án, giảng viên hướng dẫn, hội đồng đánh giá.

---

## 2. BỐI CẢNH VÀ VẤN ĐỀ NGHIỆP VỤ

### 2.1. Bối cảnh

Mua sắm hàng điện tử trực tuyến (laptop, điện thoại, đồng hồ thông minh, phụ kiện) có một đặc thù khác với các mặt hàng khác: **sản phẩm có nhiều thông số kỹ thuật mà phần lớn người mua không đủ kiến thức để tự đánh giá**. Một người cần mua laptop để học lập trình phải tự đối chiếu bộ vi xử lý, dung lượng RAM, loại ổ cứng, thời lượng pin, trọng lượng — trong khi điều họ thực sự muốn biết chỉ là: *"Với 15 triệu, máy nào học lập trình được và pin dùng cả buổi?"*

Các sàn thương mại điện tử hiện nay chủ yếu hỗ trợ người mua bằng **bộ lọc theo thuộc tính**. Cách này đòi hỏi người mua phải biết trước mình cần thuộc tính gì — tức là đã phải có sẵn kiến thức mà họ đang thiếu.

### 2.2. Phát biểu vấn đề

> **Người mua hàng điện tử trực tuyến** gặp khó khăn khi **chuyển từ nhu cầu sử dụng thực tế sang lựa chọn sản phẩm cụ thể**, vì **các công cụ tìm kiếm và lọc hiện có yêu cầu người dùng phải diễn đạt nhu cầu bằng ngôn ngữ thông số kỹ thuật**. Hệ quả là **người mua tốn nhiều thời gian tìm hiểu, dễ chọn sai sản phẩm, hoặc bỏ dở việc mua hàng**.

### 2.3. Giải pháp đề xuất

Xây dựng website thương mại điện tử bán hàng điện tử, trong đó tích hợp **trợ lý mua sắm sử dụng trí tuệ nhân tạo**. Trợ lý cho phép người dùng mô tả nhu cầu bằng **ngôn ngữ tự nhiên tiếng Việt** và nhận về gợi ý sản phẩm **có thật trong kho hàng của cửa hàng**, kèm giải thích vì sao sản phẩm đó phù hợp.

### 2.4. Điểm khác biệt so với công cụ tìm kiếm thông thường

| Tìm kiếm/lọc truyền thống | Trợ lý mua sắm AI |
|---|---|
| Người dùng phải nhập từ khoá đúng tên sản phẩm hoặc chọn đúng thuộc tính | Người dùng mô tả nhu cầu: *"laptop cho sinh viên thiết kế đồ hoạ, dưới 20 triệu"* |
| Trả về danh sách phẳng, người dùng tự so sánh | Trả về gợi ý có chọn lọc kèm lý do phù hợp |
| Không hiểu ngữ cảnh câu hỏi trước đó | Duy trì mạch hội thoại, hỏi thêm khi nhu cầu chưa rõ |
| Không cá nhân hoá | Có thể tham chiếu lịch sử mua và giỏ hàng của người dùng đã đăng nhập |

---

## 3. MỤC TIÊU DỰ ÁN VÀ TIÊU CHÍ THÀNH CÔNG

### 3.1. Mục tiêu

| Mã | Mục tiêu | Cách đo |
|---|---|---|
| MT-01 | Xây dựng website thương mại điện tử hoàn chỉnh, chạy được từ khâu xem hàng đến khâu thanh toán | Hoàn thành trọn vẹn một luồng mua hàng trong buổi demo, không phải thao tác thủ công vào cơ sở dữ liệu |
| MT-02 | Trợ lý AI tư vấn được bằng tiếng Việt dựa trên dữ liệu sản phẩm thật của cửa hàng | Với bộ câu hỏi kiểm thử định trước, trợ lý gợi ý đúng sản phẩm có trong kho, không bịa sản phẩm không tồn tại |
| MT-03 | Có khu vực quản trị đủ để vận hành cửa hàng | Quản trị viên tự nhập được sản phẩm, xử lý được đơn hàng mà không cần lập trình viên hỗ trợ |
| MT-04 | Hoàn thành đầy đủ bộ tài liệu phân tích — thiết kế theo yêu cầu môn học | `[CẦN LÀM RÕ: danh mục tài liệu bắt buộc — hỏi giảng viên, xem PV-01]` |

### 3.2. Tiêu chí nghiệm thu tổng thể

Dự án được coi là hoàn thành khi đồng thời đạt:

1. Toàn bộ yêu cầu mức **Bắt buộc** (mục 5) được cài đặt và chạy được;
2. Bộ tài liệu theo yêu cầu môn học được nộp đầy đủ, đúng hạn;
3. Nhóm bảo vệ được các quyết định thiết kế của mình trước hội đồng;
4. Không còn lỗi nghiêm trọng ở luồng mua hàng chính (chọn hàng → giỏ hàng → đặt hàng → thanh toán).

> Tiêu chí 4 cần định nghĩa "lỗi nghiêm trọng" trước khi kiểm thử. Đề xuất: lỗi khiến người dùng không hoàn tất được luồng mua hàng, hoặc gây sai lệch số tiền.

---

## 4. DANH MỤC NGUỒN TÀI LIỆU YÊU CẦU

Đây là kết quả của hoạt động **rà soát tài liệu (document analysis)** — bước bắt buộc trước khi phỏng vấn, nhằm tránh mất thời gian phỏng vấn để hỏi những điều đã có sẵn trong văn bản.

### 4.1. Tài liệu nghiệp vụ tham khảo

| Tài liệu tham khảo | Khai thác điều gì | Trạng thái |
|---|---|---|
| Các sàn thương mại điện tử đang hoạt động tại Việt Nam (Shopee, Lazada, Tiki, Thế Giới Di Động, FPT Shop) | Quy trình mua hàng chuẩn, cách tổ chức danh mục, chính sách vận chuyển và khuyến mại, cách trình bày thông số sản phẩm | Quan sát trực tiếp — cần lập bảng đối chiếu |
| Quy trình vận hành của một cửa hàng bán lẻ điện tử | Nghiệp vụ nhập hàng, xử lý đơn, thu tiền, đổi trả | Cần phỏng vấn người có kinh nghiệm (PV-04) |
| Trợ lý ảo/chatbot tư vấn trên các sàn hiện có | Cách đặt câu hỏi, cách trình bày gợi ý, giới hạn thường gặp | Quan sát trực tiếp |

### 4.2. Tài liệu kỹ thuật của bên thứ ba

| Tài liệu tham khảo | Khai thác điều gì | Trạng thái |
|---|---|---|
| Tài liệu kỹ thuật của cổng thanh toán trực tuyến trong nước | Luồng thanh toán, cơ chế thông báo kết quả, môi trường thử nghiệm, điều kiện đăng ký | Cần tra cứu khi chọn được nhà cung cấp |
| Tài liệu của nhà cung cấp mô hình ngôn ngữ lớn | Khả năng, hạn mức miễn phí, cơ chế cho phép mô hình truy vấn dữ liệu của hệ thống | Cần tra cứu |
| Tài liệu đăng nhập bằng tài khoản mạng xã hội (Google, Facebook) | Quy trình đăng ký ứng dụng, dữ liệu người dùng nhận được | Cần tra cứu |

### 4.3. Văn bản pháp lý liên quan

| Văn bản | Liên quan tới yêu cầu nào |
|---|---|
| Pháp luật về thương mại điện tử | Nghĩa vụ công bố thông tin sản phẩm, giá, chính sách đổi trả |
| Pháp luật về bảo vệ quyền lợi người tiêu dùng | Quyền được thông tin đầy đủ, quyền khiếu nại |
| Pháp luật về bảo vệ dữ liệu cá nhân | Xử lý số điện thoại, địa chỉ, lịch sử mua hàng, hồ sơ sở thích |

> **Cảnh báo về mức độ tin cậy:** ba mục trên **cố ý không ghi số hiệu văn bản cụ thể**. Pháp luật Việt Nam về thương mại điện tử và dữ liệu cá nhân có thay đổi trong những năm gần đây; ghi sai số hiệu hoặc dẫn văn bản đã hết hiệu lực còn tệ hơn không ghi. Trước khi đưa vào tài liệu nộp, phải tra cứu trên cổng thông tin pháp luật chính thức và ghi đúng số hiệu, điều khoản, ngày hiệu lực.
>
> Với phạm vi một đồ án môn học, đề xuất xử lý ở mức: nêu nguyên tắc tuân thủ trong tài liệu, cài đặt các biện pháp cơ bản (mã hoá mật khẩu, chỉ thu thập dữ liệu thực sự cần, cho người dùng xem và sửa dữ liệu của mình), và ghi rõ đây là mức đáp ứng cơ bản chứ không phải rà soát tuân thủ đầy đủ.

---

## 5. YÊU CẦU NGHIỆP VỤ

### 5.1. Quy ước

- **Mã yêu cầu:** `YC-[nhóm]-[số]`.
- **Mức ưu tiên** theo phương pháp MoSCoW:

| Ký hiệu | Nghĩa | Cam kết |
|---|---|---|
| **BB** | Bắt buộc (Must have) | Không có thì sản phẩm không dùng được, không thể demo |
| **NC** | Nên có (Should have) | Quan trọng nhưng có thể lùi lại nếu thiếu thời gian |
| **CC** | Có thì tốt (Could have) | Làm khi còn thời gian |
| **KL** | Không làm lần này (Won't have) | Ghi nhận để không phát sinh giữa chừng |

- **Ghi chú:** các yêu cầu chưa có căn cứ từ khảo sát đều là đề xuất của BA dựa trên thông lệ ngành, **cần kiểm chứng qua phỏng vấn** trước khi đưa vào lập trình.

### 5.2. Nhóm A — Tài khoản và xác thực người dùng

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-A-01 | Khách hàng đăng ký tài khoản bằng địa chỉ thư điện tử | BB |
| YC-A-02 | Hệ thống xác minh địa chỉ thư điện tử trước khi kích hoạt tài khoản | BB |
| YC-A-03 | Khách hàng đăng nhập và đăng xuất | BB |
| YC-A-04 | Khách hàng lấy lại mật khẩu khi quên | BB |
| YC-A-05 | Khách hàng đăng nhập bằng tài khoản mạng xã hội | NC |
| YC-A-06 | Hệ thống phân biệt ba nhóm: khách chưa đăng nhập, khách hàng, quản trị viên | BB |
| YC-A-07 | Phiên đăng nhập tự hết hạn sau thời gian không hoạt động | NC |

`[CẦN LÀM RÕ]` Xác minh tài khoản bằng thư điện tử hay số điện thoại? Thư điện tử rẻ và dễ triển khai hơn; số điện thoại đáng tin cậy hơn với người mua hàng Việt Nam nhưng tốn chi phí tin nhắn.

### 5.3. Nhóm B — Thông tin cá nhân của khách hàng

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-B-01 | Khách hàng xem và cập nhật thông tin cá nhân (họ tên, ảnh đại diện, số điện thoại) | BB |
| YC-B-02 | Khách hàng quản lý nhiều địa chỉ giao hàng và chọn một địa chỉ mặc định | BB |
| YC-B-03 | Khách hàng khai báo thông tin phục vụ tư vấn: nghề nghiệp, khoảng tuổi, lĩnh vực quan tâm | NC |
| YC-B-04 | Khách hàng khai báo tuỳ chọn mua sắm: ngành hàng quan tâm, khoảng ngân sách, thương hiệu ưa thích | NC |
| YC-B-05 | Khách hàng xem và xoá dữ liệu cá nhân của mình | CC |

`[CẦN LÀM RÕ]` Khách hàng có sẵn lòng khai báo thông tin ở YC-B-03/04 không? Kinh nghiệm chung cho thấy người dùng rất ngại điền biểu mẫu dài ngay khi đăng ký. Cần kiểm chứng ở PV-02 trước khi đầu tư công sức.

### 5.4. Nhóm C — Danh mục và sản phẩm

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-C-01 | Người dùng xem danh sách ngành hàng | BB |
| YC-C-02 | Người dùng xem danh sách sản phẩm theo ngành hàng | BB |
| YC-C-03 | Người dùng tìm kiếm sản phẩm theo từ khoá | BB |
| YC-C-04 | Người dùng lọc sản phẩm theo thương hiệu và khoảng giá | BB |
| YC-C-05 | Người dùng xem trang chi tiết sản phẩm: hình ảnh, mô tả, giá, tình trạng còn hàng | BB |
| YC-C-06 | Trang chi tiết hiển thị thông số kỹ thuật dạng bảng | BB |
| YC-C-07 | Mỗi sản phẩm có nhiều hình ảnh | NC |
| YC-C-08 | Người dùng xem đánh giá của người mua trước | NC |
| YC-C-09 | Khách hàng đã mua được viết đánh giá và chấm điểm sản phẩm | NC |
| YC-C-10 | Người dùng so sánh trực tiếp nhiều sản phẩm cạnh nhau | CC |

`[CẦN LÀM RÕ]` YC-C-09: chỉ người đã mua mới được đánh giá, hay ai đăng nhập cũng được? Ràng buộc "đã mua" làm đánh giá đáng tin hơn nhưng phức tạp hơn khi cài đặt và khó tạo dữ liệu mẫu để demo.

### 5.5. Nhóm D — Trợ lý mua sắm AI *(chức năng cốt lõi của đề tài)*

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-D-01 | Người dùng trò chuyện với trợ lý bằng tiếng Việt tự nhiên | **BB** |
| YC-D-02 | Trợ lý hiểu nhu cầu mô tả bằng ngôn ngữ đời thường và chuyển thành điều kiện tìm kiếm | **BB** |
| YC-D-03 | Trợ lý **chỉ gợi ý sản phẩm có thật trong kho hàng**, tuyệt đối không bịa sản phẩm không tồn tại | **BB** |
| YC-D-04 | Trợ lý giải thích lý do gợi ý, không chỉ liệt kê sản phẩm | **BB** |
| YC-D-05 | Trợ lý hỏi lại khi nhu cầu của khách chưa đủ rõ để tư vấn | NC |
| YC-D-06 | Trợ lý so sánh giúp khách vài sản phẩm cùng phân khúc | NC |
| YC-D-07 | Khách **chưa đăng nhập vẫn dùng được trợ lý** | NC |
| YC-D-08 | Với khách đã đăng nhập, trợ lý tham chiếu được giỏ hàng và lịch sử mua để tư vấn sát hơn | NC |
| YC-D-09 | Trợ lý hiển thị sản phẩm gợi ý dưới dạng thẻ, bấm vào xem được chi tiết | NC |
| YC-D-10 | Hệ thống lưu lại lịch sử hội thoại để khách xem lại | NC |
| YC-D-11 | Quản trị viên xem lại các cuộc hội thoại để đánh giá chất lượng tư vấn | CC |
| YC-D-12 | Hệ thống ghi nhận hành vi người dùng (tìm gì, xem gì, bỏ qua gì) để cải thiện gợi ý | CC |
| YC-D-13 | **Trợ lý không tự ý thêm hàng vào giỏ hay đặt hàng thay khách** | **BB** |

**Diễn giải YC-D-13 — một quyết định ranh giới cần được bàn kỹ:**

Về mặt kỹ thuật, hoàn toàn có thể để trợ lý tự thêm hàng vào giỏ khi khách nói *"cho tôi lấy cái này"*. Nhưng đề xuất **không làm** ở phiên bản này, vì ba lý do:

1. **Rủi ro không cân xứng.** Trợ lý gợi ý sai thì khách chỉ mất vài giây bỏ qua. Trợ lý tự đặt hàng sai thì khách mất tiền.
2. **Mất lòng tin khó lấy lại.** Người dùng chấp nhận một trợ lý tư vấn chưa hoàn hảo, nhưng không chấp nhận một hệ thống tự tiêu tiền của họ.
3. **Quyền kiểm soát thuộc về người mua.** Trợ lý đưa ra lựa chọn; người mua quyết định. Ranh giới này rõ ràng và dễ giải thích khi bảo vệ.

`[CẦN LÀM RÕ]` Đây là giả định của BA. Cần kiểm chứng ở PV-02 (câu hỏi B3.9): người dùng thấy việc trợ lý tự thêm hàng vào giỏ là tiện hay là phiền?

**Ba câu hỏi lớn còn bỏ ngỏ về nhóm D:**

- `[CẦN LÀM RÕ]` **Đo chất lượng tư vấn bằng cách nào?** Không có tiêu chí đo thì không thể nói trợ lý làm tốt hay kém, và không có gì để trình bày khi bảo vệ. Đề xuất: xây dựng bộ 20–30 câu hỏi kiểm thử có đáp án mong đợi, chấm theo tỷ lệ gợi ý đúng hướng.
- `[CẦN LÀM RÕ]` **Xử lý thế nào khi dịch vụ AI không phản hồi?** Đây là phụ thuộc bên ngoài duy nhất mà nếu hỏng thì mất chức năng cốt lõi.
- `[CẦN LÀM RÕ]` **Có giới hạn số lượt hỏi cho mỗi người dùng không?** Liên quan trực tiếp tới chi phí gọi dịch vụ AI.

### 5.6. Nhóm E — Giỏ hàng và đặt hàng

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-E-01 | Khách hàng thêm sản phẩm vào giỏ, sửa số lượng, xoá khỏi giỏ | BB |
| YC-E-02 | Giỏ hàng được lưu lại giữa các phiên đăng nhập | NC |
| YC-E-03 | Khách hàng đặt hàng từ giỏ, chọn địa chỉ giao hàng | BB |
| YC-E-04 | Hệ thống tính và hiển thị rõ ràng: tiền hàng, phí vận chuyển, giảm giá, tổng thanh toán | BB |
| YC-E-05 | Khách hàng ghi chú thêm cho đơn hàng | CC |
| YC-E-06 | Khách hàng xem lịch sử đơn hàng và chi tiết từng đơn | BB |
| YC-E-07 | Khách hàng huỷ đơn khi đơn chưa được xử lý | NC |
| YC-E-08 | Đơn hàng lưu lại thông tin giao hàng tại thời điểm đặt, không đổi khi khách sửa sổ địa chỉ về sau | NC |
| YC-E-09 | Hệ thống kiểm tra tồn kho trước khi cho đặt hàng | NC |
| YC-E-10 | Hệ thống trừ tồn kho khi đơn hàng được xác nhận | NC |

**Diễn giải YC-E-09 và YC-E-10:** hai yêu cầu này thường bị bỏ sót ở giai đoạn đầu vì "demo có bán thật đâu mà lo hết hàng". Nhưng nếu hệ thống hiển thị "còn hàng" mà lại cho đặt số lượng vô hạn, thì thông tin hiển thị là sai lệch — vi phạm chính nguyên tắc minh bạch ở YC-E-04. Đề nghị nhóm quyết dứt khoát: **hoặc làm quản lý tồn kho, hoặc bỏ hẳn việc hiển thị tình trạng còn hàng.** Làm nửa vời là phương án tệ nhất.

`[CẦN LÀM RÕ]` Nếu làm tồn kho: chặn ở bước thêm vào giỏ hay bước đặt hàng? Có giữ chỗ hàng trong lúc khách đang thanh toán không?

### 5.7. Nhóm F — Khuyến mại

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-F-01 | Khách hàng áp mã giảm giá khi đặt hàng | NC |
| YC-F-02 | Hỗ trợ hai loại mã: giảm giá đơn hàng và miễn phí vận chuyển | NC |
| YC-F-03 | Mã giảm giá theo phần trăm hoặc theo số tiền cố định | NC |
| YC-F-04 | Mã có điều kiện: giá trị đơn tối thiểu, mức giảm tối đa, số lượt sử dụng, thời hạn hiệu lực | NC |
| YC-F-05 | Khách hàng xem danh sách mã đang có hiệu lực | CC |
| YC-F-06 | Hệ thống báo rõ lý do khi mã không dùng được | NC |

`[CẦN LÀM RÕ]` Có cho phép dùng đồng thời nhiều mã trên một đơn không? Nếu có thì tối đa mấy mã và theo quy tắc nào?

### 5.8. Nhóm G — Thanh toán

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-G-01 | Khách hàng thanh toán khi nhận hàng (COD) — phương thức phổ biến nhất tại Việt Nam | BB |
| YC-G-02 | Khách hàng thanh toán trực tuyến qua cổng thanh toán | NC |
| YC-G-03 | Hệ thống cập nhật trạng thái thanh toán tự động theo thông báo từ cổng thanh toán | NC |
| YC-G-04 | Hệ thống lưu lại dữ liệu giao dịch phục vụ đối soát | NC |
| YC-G-05 | Quản trị viên xác nhận đã thu được tiền với đơn COD | NC |
| YC-G-06 | Hỗ trợ hoàn tiền — nghiệp vụ phức tạp, vượt phạm vi đồ án; ghi nhận để không phát sinh giữa chừng | KL |

**Cảnh báo về YC-G-02 và YC-G-03:** thanh toán trực tuyến là phần **rủi ro cao nhất** trong toàn dự án, vì ba lý do: phụ thuộc bên thứ ba; đăng ký tài khoản cổng thanh toán có thể cần giấy tờ pháp nhân mà nhóm sinh viên không có; và tình huống lỗi rất khó xử lý — đặc biệt là trường hợp khách đã trả tiền nhưng hệ thống không nhận được thông báo.

**Khuyến nghị:** khảo sát khả năng đăng ký tài khoản thử nghiệm **ngay từ tuần đầu**, trước khi lập trình. Nếu không đăng ký được, chuyển YC-G-02 xuống mức "Không làm lần này" và tập trung làm tốt COD. Phát hiện điều này ở tuần cuối sẽ rất tốn kém.

`[CẦN LÀM RÕ]` Nếu khách đã thanh toán nhưng hệ thống không nhận được thông báo, quy trình xử lý thủ công là gì?

### 5.9. Nhóm H — Theo dõi giá

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-H-01 | Khách hàng đăng ký theo dõi một sản phẩm với mức giá mong muốn | CC |
| YC-H-02 | Hệ thống thông báo khi giá sản phẩm giảm tới mức khách mong muốn | CC |
| YC-H-03 | Khách hàng quản lý và huỷ các theo dõi đã đặt | CC |

`[CẦN LÀM RÕ]` Thông báo qua kênh nào — thư điện tử, tin nhắn, hay thông báo trong ứng dụng? Mỗi kênh có chi phí và độ phức tạp rất khác nhau. Cần kiểm chứng ở PV-02 xem khách hàng thực sự muốn nhận qua đâu.

### 5.10. Nhóm I — Quản trị và vận hành

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| YC-I-01 | Quản trị viên đăng nhập vào khu vực quản trị riêng | BB |
| YC-I-02 | Quản lý ngành hàng: thêm, sửa, ẩn/hiện, sắp xếp thứ tự | BB |
| YC-I-03 | Quản lý sản phẩm: thêm, sửa, ngừng bán | BB |
| YC-I-04 | Quản lý hình ảnh sản phẩm | BB |
| YC-I-05 | Quản lý thông số kỹ thuật của sản phẩm | BB |
| YC-I-06 | Quản lý đơn hàng: xem danh sách, xem chi tiết, cập nhật trạng thái | BB |
| YC-I-07 | Quản lý mã giảm giá | NC |
| YC-I-08 | Quản lý tài khoản khách hàng | NC |
| YC-I-09 | Bảng điều khiển thống kê: doanh thu, số đơn, sản phẩm bán chạy | NC |
| YC-I-10 | Nhập sản phẩm hàng loạt từ tệp bảng tính — xem phần diễn giải bên dưới | CC |
| YC-I-11 | Phân quyền chi tiết theo từng nhóm công việc trong khu vực quản trị — xem phần diễn giải | KL |

**Diễn giải YC-I-10:** nhập từng sản phẩm điện tử qua biểu mẫu là công việc rất nặng — mỗi sản phẩm có tên, giá, mô tả, nhiều hình ảnh và hàng chục thông số kỹ thuật. Nếu buổi demo cần vài chục sản phẩm để trông thuyết phục, nhóm sẽ phải bỏ ra nhiều giờ nhập liệu thủ công. Cần cân nhắc sớm: hoặc làm chức năng nhập hàng loạt, hoặc chuẩn bị sẵn kịch bản nạp dữ liệu mẫu.

**Diễn giải YC-I-11:** trong cửa hàng thật, người nhập hàng và người xác nhận thu tiền thường **không được là cùng một người** — đây là nguyên tắc kiểm soát nội bộ để phòng gian lận. Với đồ án, chấp nhận một vai trò quản trị viên duy nhất là hợp lý, **nhưng phải ghi nhận rõ đây là giới hạn có ý thức**, không phải thiếu sót do không nghĩ tới. Điểm này nên chủ động nêu khi bảo vệ.

---

## 6. YÊU CẦU PHI CHỨC NĂNG

| Mã | Loại | Yêu cầu | Ưu tiên | Cách kiểm chứng |
|---|---|---|---|---|
| PCN-01 | An toàn | Mật khẩu người dùng phải được mã hoá một chiều, không lưu dạng đọc được | BB | Kiểm tra trực tiếp trong cơ sở dữ liệu |
| PCN-02 | An toàn | Mọi chức năng quản trị phải kiểm tra quyền ở phía máy chủ, không chỉ ẩn nút ở giao diện | BB | Thử gọi trực tiếp bằng tài khoản khách hàng |
| PCN-03 | An toàn | Thông tin bí mật (khoá dịch vụ, mật khẩu cơ sở dữ liệu) không được nằm trong mã nguồn | BB | Rà soát mã nguồn và lịch sử phiên bản |
| PCN-04 | An toàn | Khách hàng chỉ xem được dữ liệu của chính mình | BB | Thử truy cập đơn hàng của người khác |
| PCN-05 | Hiệu năng | Trang danh sách sản phẩm hiển thị trong vòng 3 giây | NC | Đo trên máy demo |
| PCN-06 | Hiệu năng | Trợ lý AI phản hồi trong vòng 10 giây; có hiển thị trạng thái đang xử lý | NC | Đo với bộ câu hỏi kiểm thử |
| PCN-07 | Khả dụng | Giao diện hoàn toàn bằng tiếng Việt | BB | Rà soát giao diện |
| PCN-08 | Khả dụng | Hiển thị được trên điện thoại di động | NC | Thử trên màn hình nhỏ |
| PCN-09 | Khả dụng | Thông báo lỗi bằng tiếng Việt, nói rõ người dùng cần làm gì | NC | Rà soát các tình huống lỗi |
| PCN-10 | Toàn vẹn | Thao tác đặt hàng phải bảo đảm trọn vẹn: hoặc thành công hoàn toàn, hoặc không thay đổi gì | BB | Thử ngắt giữa chừng |
| PCN-11 | Bảo trì | Mã nguồn có chú thích tiếng Việt ở những chỗ xử lý nghiệp vụ phức tạp | NC | Rà soát khi kiểm tra chéo |
| PCN-12 | Bảo trì | Các tham số nghiệp vụ (phí vận chuyển, ngưỡng miễn phí ship) không viết cứng rải rác trong mã | NC | Rà soát mã nguồn |

`[CẦN LÀM RÕ]` PCN-05, PCN-06: các mốc thời gian này do BA đề xuất theo thông lệ, **chưa có căn cứ từ yêu cầu môn học**. Nếu giảng viên không yêu cầu cụ thể thì giữ nguyên làm mục tiêu tự đặt.

---

## 7. QUY TẮC NGHIỆP VỤ CẦN THỐNG NHẤT

Đây là các quyết định **phải chốt bằng con số cụ thể trước khi lập trình**. Nếu không chốt, lập trình viên sẽ tự đặt giá trị tuỳ ý và về sau không ai giải thích được vì sao lại là con số đó.

| Mã | Quy tắc cần chốt | Giá trị | Người quyết |
|---|---|---|---|
| QT-01 | Phí vận chuyển tính thế nào — cố định, theo khu vực, hay theo trọng lượng? | `[CHƯA CHỐT]` | Nhóm dự án |
| QT-02 | Có ngưỡng miễn phí vận chuyển không? Bao nhiêu? | `[CHƯA CHỐT]` | Nhóm dự án |
| QT-03 | Công thức tính tổng tiền đơn hàng | `[CHƯA CHỐT]` | Nhóm dự án |
| QT-04 | Số tiền giảm có được vượt quá giá trị hàng không? | Đề xuất: **không** | Nhóm dự án |
| QT-05 | Khách được huỷ đơn ở những trạng thái nào? | `[CHƯA CHỐT]` | Nhóm dự án |
| QT-06 | Vòng đời đơn hàng gồm những trạng thái nào, chuyển đổi ra sao? | `[CHƯA CHỐT]` — xem mục 7.1 | Nhóm dự án |
| QT-07 | Doanh thu được ghi nhận tại thời điểm nào — khi đặt hàng, khi thu tiền, hay khi giao xong? | `[CHƯA CHỐT]` | Nhóm dự án |
| QT-08 | Một sản phẩm xuất hiện mấy dòng trong giỏ nếu khách thêm nhiều lần? | Đề xuất: **một dòng, cộng dồn số lượng** | Nhóm dự án |
| QT-09 | Mã giảm giá hết hạn hoặc hết lượt thì xử lý thế nào? | Đề xuất: **từ chối và báo rõ lý do** | Nhóm dự án |
| QT-10 | Tần suất kiểm tra giá cho chức năng theo dõi giá | `[CHƯA CHỐT]` | Nhóm dự án |

### 7.1. Vòng đời đơn hàng — đề xuất để nhóm thảo luận

```
   [Chờ xác nhận] ──────► [Đã xác nhận] ──────► [Đang giao] ──────► [Hoàn tất]
         │                      │
         │                      │
         ▼                      ▼
     [Đã huỷ]               [Đã huỷ]
```

Đề xuất kèm theo:
- Khách hàng chỉ được huỷ khi đơn ở trạng thái **Chờ xác nhận**.
- Quản trị viên được huỷ ở cả **Chờ xác nhận** và **Đã xác nhận** (ví dụ: hết hàng).
- **Không cho quay ngược trạng thái.** Đã huỷ thì không quay lại được.
- Trạng thái thanh toán tách riêng khỏi trạng thái đơn hàng: một đơn COD có thể ở trạng thái "Đang giao" mà chưa thu được tiền.

**Đây là đề xuất, không phải quyết định.** Nhóm cần thống nhất và chốt lại — mọi màn hình, mọi báo cáo về sau đều phụ thuộc vào sơ đồ này.

---

## 8. RÀNG BUỘC, GIẢ ĐỊNH, PHỤ THUỘC

### 8.1. Ràng buộc

| Mã | Ràng buộc | Ảnh hưởng |
|---|---|---|
| RB-01 | Thời gian thực hiện có hạn, giới hạn bởi lịch học kỳ | Bắt buộc phải phân mức ưu tiên; không thể làm hết mọi yêu cầu |
| RB-02 | Nhân lực: 3 sinh viên, làm ngoài giờ học chính khoá | Khối lượng công việc phải phù hợp năng lực thực tế |
| RB-03 | Kinh phí gần như bằng không | Chỉ dùng được dịch vụ có gói miễn phí hoặc dùng thử |
| RB-04 | Không có pháp nhân doanh nghiệp | Có thể không đăng ký được tài khoản cổng thanh toán chính thức |
| RB-05 | Đơn vị tiền tệ: đồng Việt Nam | Không xử lý đa tiền tệ |
| RB-06 | `[CẦN LÀM RÕ]` Công nghệ bắt buộc theo yêu cầu môn học | Có thể giới hạn lựa chọn kỹ thuật |

### 8.2. Giả định

| Mã | Giả định | Nếu sai thì sao |
|---|---|---|
| GĐ-01 | Nhóm đăng ký được tài khoản thử nghiệm của dịch vụ AI trong hạn mức miễn phí | Mất chức năng cốt lõi — phải đổi hướng đề tài |
| GĐ-02 | Dữ liệu sản phẩm mẫu có thể tự tạo, không cần dữ liệu thật từ cửa hàng | Phải tìm nguồn dữ liệu khác |
| GĐ-03 | Hệ thống chỉ cần chạy được khi demo, không cần vận hành liên tục | Nếu sai thì phát sinh yêu cầu về triển khai và giám sát |
| GĐ-04 | Số người dùng đồng thời khi demo rất nhỏ | Nếu sai thì phải tính tới hiệu năng và mở rộng |
| GĐ-05 | Không có người dùng thật, không có dữ liệu cá nhân thật | Nếu sai thì phát sinh nghĩa vụ tuân thủ về bảo vệ dữ liệu |

### 8.3. Phụ thuộc bên ngoài

| Mã | Phụ thuộc | Mức độ nghiêm trọng nếu gián đoạn |
|---|---|---|
| PT-01 | Dịch vụ mô hình ngôn ngữ lớn | **Nghiêm trọng** — mất chức năng cốt lõi |
| PT-02 | Cổng thanh toán trực tuyến | Trung bình — còn phương án COD |
| PT-03 | Dịch vụ gửi thư điện tử | **Nghiêm trọng** — không ai đăng ký được tài khoản mới |
| PT-04 | Dịch vụ lưu trữ hình ảnh | Trung bình — sản phẩm không có ảnh |
| PT-05 | Dịch vụ đăng nhập bằng mạng xã hội | Thấp — còn cách đăng nhập thông thường |
| PT-06 | Hạ tầng cơ sở dữ liệu | **Nghiêm trọng** — hệ thống ngừng hoạt động |

> **Nhận xét:** dự án phụ thuộc ít nhất 6 dịch vụ bên ngoài, trong đó 3 dịch vụ mà gián đoạn là hệ thống không dùng được. Cần chuẩn bị phương án dự phòng cho buổi bảo vệ: bản ghi màn hình quá trình demo và dữ liệu mẫu sẵn có, để không phụ thuộc hoàn toàn vào kết nối mạng tại chỗ.

---

## 9. NGOÀI PHẠM VI

Liệt kê rõ để tránh phát sinh giữa chừng — đây là phần thường bị bỏ quên nhưng lại cứu dự án khỏi việc phình phạm vi:

| # | Nội dung | Lý do |
|---|---|---|
| 1 | Ứng dụng di động riêng | Website hiển thị được trên di động là đủ |
| 2 | Mô hình sàn nhiều người bán | Chỉ có một cửa hàng |
| 3 | Quản lý kho, nhập hàng từ nhà cung cấp | Vượt phạm vi bán hàng |
| 4 | Tích hợp đơn vị vận chuyển thực tế | Không có hợp đồng vận chuyển |
| 5 | Nghiệp vụ đổi trả và hoàn tiền | Nghiệp vụ phức tạp, cần quy trình kế toán |
| 6 | Xuất hoá đơn điện tử | Cần pháp nhân |
| 7 | Trợ lý bằng giọng nói | Phức tạp gấp nhiều lần; làm sau nếu còn thời gian |
| 8 | Đa ngôn ngữ | Chỉ phục vụ người dùng Việt Nam |
| 9 | Chương trình khách hàng thân thiết, tích điểm | Không thuộc bài toán cốt lõi |
| 10 | Tự huấn luyện mô hình AI riêng | Vượt xa nguồn lực; sử dụng mô hình có sẵn |

---

## 10. RỦI RO GIAI ĐOẠN KHỞI TẠO

| Mã | Rủi ro | Khả năng | Tác động | Biện pháp phòng ngừa |
|---|---|---|---|---|
| RR-01 | Chưa có đề bài và tiêu chí chấm điểm → làm sai hướng | **Cao** | **Rất cao** | Gặp giảng viên ngay (PV-01), trước khi viết dòng mã đầu tiên |
| RR-02 | Không đăng ký được cổng thanh toán do thiếu pháp nhân | Trung bình | Cao | Khảo sát điều kiện đăng ký trong tuần đầu; chuẩn bị sẵn phương án chỉ dùng COD |
| RR-03 | Dịch vụ AI vượt hạn mức miễn phí giữa chừng | Trung bình | **Rất cao** | Tìm hiểu hạn mức trước; đặt giới hạn số lượt hỏi; lưu sẵn kết quả cho kịch bản demo |
| RR-04 | Phạm vi phình ra, không kịp hạn nộp | **Cao** | Cao | Bám sát mức ưu tiên MoSCoW; chỉ làm phần Bắt buộc trước khi động tới phần Nên có |
| RR-05 | Chất lượng tư vấn của AI không đạt kỳ vọng | Trung bình | Cao | Xây bộ câu hỏi kiểm thử ngay từ đầu; đo và cải thiện dần thay vì để tới cuối mới thử |
| RR-06 | Ba thành viên tham gia không đều | Trung bình | Trung bình | Phân công rõ bằng văn bản; kiểm tra tiến độ hằng tuần |
| RR-07 | Dồn toàn bộ công sức vào lập trình, bỏ quên tài liệu | **Cao** | Cao | Làm tài liệu song song, không để tới cuối |
| RR-08 | Lộ thông tin bí mật khi đưa mã nguồn lên kho lưu trữ công khai | Trung bình | Cao | Cấu hình loại trừ tệp cấu hình bí mật **ngay từ commit đầu tiên** |

---

## 11. CÂU HỎI CẦN LÀM RÕ

Tổng hợp toàn bộ mục `[CẦN LÀM RÕ]` trong tài liệu, sắp theo mức độ cấp thiết. Mỗi câu hỏi đều đã được đưa vào kịch bản phỏng vấn tương ứng ở BA-03-INT.

| # | Câu hỏi | Hỏi ai | Buổi | Mức cấp thiết |
|---|---|---|---|---|
| 1 | Yêu cầu bắt buộc của môn học, danh mục tài liệu phải nộp, tiêu chí chấm, hạn nộp | Giảng viên | PV-01 | **Cấp thiết** |
| 2 | Có ràng buộc về công nghệ được phép dùng không | Giảng viên | PV-01 | **Cấp thiết** |
| 3 | Quy định về sử dụng công cụ AI hỗ trợ trong đồ án | Giảng viên | PV-01 | **Cấp thiết** |
| 4 | Người mua hàng điện tử thực sự gặp khó ở đâu | Người dùng đại diện | PV-02 | **Cấp thiết** |
| 5 | Người dùng có tin lời tư vấn của AI không, điều gì làm họ tin/mất tin | Người dùng đại diện | PV-02 | **Cấp thiết** |
| 6 | Người dùng muốn trợ lý tự thêm hàng vào giỏ hay không (YC-D-13) | Người dùng đại diện | PV-02 | Cao |
| 7 | Người dùng có sẵn lòng khai báo thông tin cá nhân để được tư vấn tốt hơn không | Người dùng đại diện | PV-02 | Cao |
| 8 | Quy trình vận hành thực tế của cửa hàng bán lẻ điện tử | Người có kinh nghiệm bán hàng | PV-04 | Cao |
| 9 | Người vận hành cần nhìn thấy chỉ số gì mỗi ngày | Người có kinh nghiệm bán hàng | PV-04 | Trung bình |
| 10 | Chốt các quy tắc nghiệp vụ QT-01 → QT-10 | Nội bộ nhóm | PV-05 | Cao |
| 11 | Chốt phạm vi phiên bản đầu tiên và phân công | Nội bộ nhóm | PV-05 | **Cấp thiết** |
| 12 | Có đăng ký được tài khoản thử nghiệm cổng thanh toán không | Tự khảo sát | — | **Cấp thiết** |
| 13 | Hạn mức miễn phí của dịch vụ AI | Tự khảo sát | — | **Cấp thiết** |
| 14 | Tiêu chí đo chất lượng tư vấn của trợ lý | Nội bộ nhóm + Giảng viên | PV-01, PV-05 | Cao |

---

## 12. KẾ HOẠCH LÀM RÕ YÊU CẦU

| Bước | Hoạt động | Kỹ thuật | Kết quả cần đạt |
|---|---|---|---|
| 1 | Thu thập tài liệu ràng buộc của môn học: đề bài, quy định trình bày, tiêu chí chấm, quy định sử dụng công cụ AI | Rà soát tài liệu | Nắm được yêu cầu bắt buộc của môn học |
| 2 | Phỏng vấn giảng viên | Phỏng vấn (PV-01) | Chốt tiêu chí "hoàn thành" |
| 3 | Khảo sát người dùng đại diện | Phỏng vấn (PV-02) | Kiểm chứng phát biểu vấn đề ở mục 2.2 |
| 4 | Nghiên cứu sàn thương mại điện tử hiện có | Rà soát tài liệu, quan sát | Bảng đối chiếu chức năng |
| 5 | Phỏng vấn người có kinh nghiệm vận hành | Phỏng vấn (PV-04) | Quy trình nghiệp vụ thực tế |
| 6 | Khảo sát khả thi kỹ thuật của các dịch vụ bên ngoài | Thử nghiệm trực tiếp | Xác nhận GĐ-01, RR-02, RR-03 |
| 7 | Họp nhóm chốt phạm vi | Hội thảo (PV-05) | Danh sách yêu cầu đã chốt cho phiên bản đầu |
| 8 | Cập nhật tài liệu này lên phiên bản 2.0 | — | Bản yêu cầu đã được phê duyệt |
| 9 | Chuyển sang đặc tả chi tiết | Viết use case, vẽ sơ đồ | Đầu vào cho lập trình |

> **Nguyên tắc quan trọng:** không bắt đầu lập trình các chức năng thuộc nhóm có câu hỏi mức "Cấp thiết" chưa được trả lời. Riêng phần khung hạ tầng (cơ sở dữ liệu nền, xác thực người dùng) có thể làm song song vì ít phụ thuộc vào kết quả khảo sát.

---

## 13. PHÊ DUYỆT

| Vai trò | Họ tên | Ngày | Ý kiến |
|---|---|---|---|
| Người lập | | | |
| Đại diện nhóm dự án | | | |
| Giảng viên hướng dẫn | | | |

---

*Hết tài liệu BA-01-REQ v1.0*
