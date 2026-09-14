# KỊCH BẢN KHẢO SÁT — PHỎNG VẤN
## Đề tài: Website thương mại điện tử tích hợp trợ lý mua sắm AI

| Mục | Nội dung |
|---|---|
| Mã tài liệu | BA-03-INT |
| Phiên bản | 1.0 |
| Ngày lập | __/__/2026 |
| Người lập | Business Analyst |
| Giai đoạn | Khởi tạo dự án — Khảo sát yêu cầu |
| Kỹ thuật áp dụng | Phỏng vấn bán cấu trúc (semi-structured interview) |
| Trạng thái | Chờ phê duyệt |
| Tài liệu liên quan | BA-01-REQ (Tổng hợp yêu cầu), BA-02-STK (Nhận diện các bên liên quan) |

**Lịch sử thay đổi**

| Phiên bản | Ngày | Người sửa | Nội dung |
|---|---|---|---|
| 1.0 | __/__/2026 | BA | Bản đầu tiên |

---

## 1. MỤC TIÊU KHẢO SÁT

Vòng phỏng vấn này diễn ra **trước khi bắt đầu lập trình**, nhằm bốn mục tiêu:

| # | Mục tiêu | Vì sao cần |
|---|---|---|
| 1 | Xác lập tiêu chí "hoàn thành" của dự án | Hiện chưa có định nghĩa nào về việc thế nào là xong. Không có tiêu chí thì không thể lập kế hoạch |
| 2 | Kiểm chứng ba giả định cốt lõi GĐ-A, GĐ-B, GĐ-C | Nếu người mua không thực sự gặp khó khăn như giả định ở BA-01 mục 2.2, thì toàn bộ đề tài cần xem lại |
| 3 | Thu thập quy trình nghiệp vụ thực tế của việc bán lẻ hàng điện tử | Để thiết kế khu vực quản trị theo công việc thật, không theo tưởng tượng |
| 4 | Chốt các quy tắc nghiệp vụ QT-01 → QT-10 và phạm vi phiên bản đầu tiên | Để lập trình viên không phải tự đặt giá trị tuỳ ý rồi về sau không ai giải thích được |

**Thời điểm thực hiện:** toàn bộ vòng phỏng vấn phải hoàn thành **trước khi lập trình các chức năng nghiệp vụ**. Riêng phần khung hạ tầng (dựng dự án, cơ sở dữ liệu nền, xác thực người dùng) có thể làm song song vì ít phụ thuộc kết quả khảo sát.

---

## 2. NGUYÊN TẮC PHỎNG VẤN

Áp dụng cho mọi buổi. Người phỏng vấn cần tự kiểm soát các điểm sau — đây là những lỗi khiến kết quả khảo sát trở nên vô giá trị:

| Nguyên tắc | Cách làm | Ví dụ sai → đúng |
|---|---|---|
| **Hỏi mở, không gài sẵn đáp án** | Câu hỏi không được chứa sẵn câu trả lời mong muốn | Sai: *"Anh/chị có thấy việc tìm laptop trên mạng rất khó không?"* → Đúng: *"Lần gần nhất anh/chị tìm mua laptop, quá trình đó diễn ra thế nào?"* |
| **Hỏi hành vi đã xảy ra, không hỏi ý định** | Người ta nhớ khá chính xác việc đã làm, nhưng dự đoán rất kém về việc sẽ làm | Sai: *"Anh/chị có dùng trợ lý AI không?"* → Đúng: *"Anh/chị đã từng nhắn tin với trợ lý ảo trên trang bán hàng chưa? Kể lại lần đó giúp mình"* |
| **Không mô tả giải pháp trước khi hỏi vấn đề** | Nếu mô tả sản phẩm trước, người được hỏi sẽ khen cho lịch sự, và mọi câu trả lời sau đó đều bị nhiễm | Để phần giới thiệu sản phẩm xuống **cuối buổi**, sau khi đã hỏi xong về vấn đề |
| **Đào sâu bằng "vì sao" và "kể thêm"** | Câu trả lời đầu tiên hiếm khi là lý do thật | *"Vì sao lúc đó anh/chị lại chọn máy đó?"* → *"Điều gì khiến anh/chị yên tâm?"* |
| **Im lặng là công cụ** | Sau câu trả lời, đợi 3 giây. Phần nói thêm thường là phần giá trị nhất | — |
| **Không tranh luận** | Người được phỏng vấn không bao giờ sai — họ đang mô tả trải nghiệm của chính họ | — |
| **Ghi nguyên văn con số, tên riêng, mốc thời gian** | Không diễn đạt lại theo cách hiểu của mình | — |
| **Tóm tắt và xác nhận** | Cuối mỗi nhóm câu hỏi, nhắc lại và hỏi "mình hiểu vậy đúng chưa" | — |

**Về ghi âm:** xin phép trước. Nếu không được đồng ý thì ghi chép tay và gửi lại biên bản trong 24 giờ để người được phỏng vấn xác nhận.

**Về số lượng người phỏng vấn:** nên có hai người — một người hỏi, một người ghi chép. Người hỏi tập trung vào mạch trò chuyện, không bị phân tâm vì phải viết.

---

## 3. MA TRẬN TRUY VẾT

Bảng này bảo đảm mỗi vấn đề chưa rõ đều có người trả lời, và mỗi câu hỏi đều phục vụ một mục đích cụ thể.

| Vấn đề cần làm rõ | Nguồn | Người trả lời | Buổi | Nhóm câu hỏi |
|---|---|---|---|---|
| Yêu cầu bắt buộc của môn học, tài liệu phải nộp, tiêu chí chấm, hạn nộp | BA-01 mục 3.1 (MT-04), mục 11 | Giảng viên | PV-01 | A1 |
| Ràng buộc công nghệ (RB-06) | BA-01 mục 8.1 | Giảng viên | PV-01 | A2 |
| Quy định sử dụng công cụ AI trong học thuật | BA-01 mục 11 | Giảng viên | PV-01 | A2 |
| Kỳ vọng về mức độ hoàn thiện của sản phẩm | BA-01 mục 3.2 | Giảng viên | PV-01 | A3 |
| **GĐ-A** — người mua có thực sự gặp khó khi chuyển nhu cầu thành lựa chọn | BA-02 mục 3.4 | Người dùng đại diện | PV-02 | B1, B2 |
| **GĐ-B** — người dùng có sẵn lòng trò chuyện với trợ lý AI | BA-02 mục 3.4 | Người dùng đại diện | PV-02, PV-03 | B3, C2 |
| **GĐ-C** — mức tin tưởng vào gợi ý của AI | BA-02 mục 3.4 | Người dùng đại diện | PV-02, PV-03 | B3, C2 |
| Trợ lý có nên tự thêm hàng vào giỏ không (YC-D-13) | BA-01 mục 5.5 | Người dùng đại diện | PV-02 | B3 |
| Người dùng có sẵn lòng khai báo thông tin cá nhân (YC-B-03/04) | BA-01 mục 5.3 | Người dùng đại diện | PV-02 | B4 |
| Trợ lý AI có gây cản trở người mua đã biết rõ mình cần gì không | BA-02 mục 3.2 | Người dùng rành công nghệ | PV-03 | C1, C2 |
| Hành vi chờ giảm giá và kênh nhận thông báo (YC-H-01→03) | BA-01 mục 5.9 | Người dùng đại diện | PV-02, PV-03 | B5, C3 |
| Quy trình vận hành cửa hàng thực tế | BA-01 mục 4.1 | Người có kinh nghiệm bán lẻ | PV-04 | D1 |
| Nghiệp vụ xử lý đơn hàng và thu tiền (QT-05, QT-06, QT-07) | BA-01 mục 7 | Người có kinh nghiệm bán lẻ | PV-04 | D2 |
| Khối lượng nhập liệu sản phẩm, nhu cầu nhập hàng loạt (YC-I-10) | BA-01 mục 5.10 | Người có kinh nghiệm bán lẻ | PV-04 | D3 |
| Chỉ số người vận hành cần theo dõi (YC-I-09) | BA-01 mục 5.10 | Người có kinh nghiệm bán lẻ | PV-04 | D4 |
| Phân công vai trò trong nhóm | BA-02 mục 2.1 | Nội bộ nhóm | PV-05 | E1 |
| Năng lực và thời gian thực tế của nhóm (RB-01, RB-02) | BA-01 mục 8.1 | Nội bộ nhóm | PV-05 | E2 |
| Chốt quy tắc nghiệp vụ QT-01 → QT-10 | BA-01 mục 7 | Nội bộ nhóm | PV-05 | E3 |
| Chốt phạm vi phiên bản đầu tiên | BA-01 mục 5 | Nội bộ nhóm | PV-05 | E4 |

---

## 4. KỊCH BẢN CHI TIẾT

---

### PV-01 — PHỎNG VẤN GIẢNG VIÊN HƯỚNG DẪN

| Mục | Nội dung |
|---|---|
| Đối tượng | STK-HT-01 — Giảng viên hướng dẫn |
| Người thực hiện | Đại diện nhóm |
| Thời lượng | 20–30 phút |
| Hình thức | Gặp trực tiếp trong giờ hướng dẫn. Nếu không xếp được lịch thì gửi thư điện tử theo đúng bộ câu hỏi này |
| Mức ưu tiên | **Cao nhất — thực hiện trước mọi việc khác của dự án** |

**Vì sao buổi này phải đi đầu:** đây là bên duy nhất định nghĩa được "hoàn thành" nghĩa là gì. Mọi quyết định về phạm vi, công nghệ, thứ tự công việc đều phụ thuộc câu trả lời ở đây. Tiến hành sau khi đã lập trình sẽ dẫn tới việc phải làm lại.

**Chuẩn bị trước:**
- Bản tóm tắt ý tưởng đề tài trong một trang (dựa trên BA-01 mục 2 và 3);
- Danh sách câu hỏi in sẵn;
- Sổ ghi chép.

**Mở đầu (2 phút):**
> "Em chào thầy/cô. Nhóm em có ba thành viên, đang chuẩn bị làm đồ án về website bán hàng điện tử có tích hợp trợ lý tư vấn dùng trí tuệ nhân tạo. Trước khi bắt tay vào làm, nhóm em muốn hỏi thầy/cô một số điểm về yêu cầu và cách đánh giá để triển khai đúng hướng ạ. Em xin khoảng 20 phút."

**Nhóm A1 — Yêu cầu và sản phẩm phải nộp**

| # | Câu hỏi | Mục đích |
|---|---|---|
| A1.1 | Đồ án cần nộp những sản phẩm gì — mã nguồn, tài liệu, bản trình bày? | Xác định danh mục công việc phải làm |
| A1.2 | Phần tài liệu cần có những đầu mục nào ạ? | Đây là phần dễ bị bỏ quên nhất, khối lượng lại lớn |
| A1.3 | Có mẫu hoặc quy định về hình thức trình bày tài liệu không ạ? | Tránh phải sửa lại toàn bộ tài liệu về sau |
| A1.4 | Đồ án cần có những sơ đồ phân tích thiết kế nào — biểu đồ ca sử dụng, biểu đồ tuần tự, biểu đồ lớp, mô hình thực thể quan hệ? | Xác định khối lượng việc mô hình hoá |
| A1.5 | Có yêu cầu về kiểm thử không ạ — tài liệu kịch bản kiểm thử hay kiểm thử tự động? | Thường bị bỏ sót hoàn toàn trong đồ án sinh viên |
| A1.6 | Hạn nộp cuối cùng và các mốc trung gian là khi nào ạ? | Ràng buộc chi phối toàn bộ kế hoạch |

**Nhóm A2 — Ràng buộc**

| # | Câu hỏi | Mục đích |
|---|---|---|
| A2.1 | Có bắt buộc dùng công nghệ, ngôn ngữ lập trình hay nền tảng cụ thể nào không ạ? | Xác nhận RB-06 |
| A2.2 | Đồ án có bắt buộc triển khai chạy trực tuyến, hay chỉ cần chạy được trên máy khi demo ạ? | Ảnh hưởng lớn tới khối lượng việc triển khai |
| A2.3 | Nhóm em có được sử dụng dịch vụ trí tuệ nhân tạo của bên thứ ba không, hay phải tự xây dựng mô hình ạ? | **Câu hỏi sống còn với đề tài này.** Nếu bắt buộc tự xây mô hình thì phải đổi hướng đề tài |
| A2.4 | Trong quá trình làm, nhóm em được dùng công cụ AI hỗ trợ tới mức nào, và cần ghi nhận thế nào ạ? | Liêm chính học thuật — hỏi trước tốt hơn giải thích sau |
| A2.5 | Đề tài này có bị trùng với nhóm nào khác không ạ? | Tránh trùng lặp |

**Nhóm A3 — Kỳ vọng và tiêu chí đánh giá**

| # | Câu hỏi | Mục đích |
|---|---|---|
| A3.1 | Thầy/cô đánh giá đồ án theo những tiêu chí nào, tỷ trọng ra sao ạ? | Quyết định nhóm nên dồn sức vào đâu |
| A3.2 | Với đề tài này, thầy/cô kỳ vọng mức độ hoàn thiện tới đâu — chạy được luồng chính là đủ, hay cần đầy đủ mọi tình huống? | Xác định tiêu chí nghiệm thu BA-01 mục 3.2 |
| A3.3 | Hình thức bảo vệ là gì ạ — demo trực tiếp, thuyết trình, hay vấn đáp? Thời lượng bao lâu? | Chuẩn bị đúng hình thức |
| A3.4 | Điều gì thường khiến thầy/cô đánh giá thấp một đồ án? | **Câu hỏi mở quan trọng nhất.** Thường thu được thông tin không có trong bất kỳ văn bản nào |
| A3.5 | Thầy/cô có gợi ý gì cho nhóm em ở giai đoạn này không ạ? | Kết thúc mở, tạo quan hệ trao đổi lâu dài |

**Kết thúc:** tóm tắt ba điểm quan trọng nhất vừa nghe, xin xác nhận, hỏi cách liên hệ khi có vướng mắc, cảm ơn.

**Kết quả bắt buộc có sau buổi này:**
- [ ] Danh mục sản phẩm phải nộp
- [ ] Hạn nộp cụ thể
- [ ] Hình thức bảo vệ
- [ ] Tiêu chí chấm và tỷ trọng
- [ ] Xác nhận có được dùng dịch vụ AI bên thứ ba không
- [ ] Kênh liên hệ với giảng viên

---

### PV-02 — PHỎNG VẤN NGƯỜI DÙNG ĐẠI DIỆN (phân khúc trọng tâm)

| Mục | Nội dung |
|---|---|
| Đối tượng | Người từng mua hàng điện tử trực tuyến nhưng **không tự tin về kiến thức kỹ thuật** — tương ứng phân khúc 1, BA-02 mục 3.1 |
| Số lượng | 3–4 người |
| Thời lượng | 25–30 phút mỗi người |
| Hình thức | Trực tiếp hoặc gọi video, một người hỏi một người ghi |
| Mức ưu tiên | **Rất cao** — kiểm chứng ba giả định cốt lõi của đề tài |

**Tiêu chí chọn người:**
- Đã mua ít nhất một món hàng điện tử trực tuyến trong 6 tháng gần đây;
- Tự nhận là **không rành về thông số kỹ thuật**;
- Ưu tiên đa dạng: có sinh viên, có người đi làm, có người mua hộ người thân.

**Điều tuyệt đối tránh:** không mô tả sản phẩm sắp làm trước khi hỏi xong phần vấn đề. Nếu nói trước, người được phỏng vấn sẽ khen cho lịch sự và mọi câu trả lời sau đó đều mất giá trị.

**Mở đầu (2 phút):**
> "Chào anh/chị. Nhóm mình đang tìm hiểu về thói quen mua hàng điện tử trên mạng. Mình muốn nghe trải nghiệm thực tế của anh/chị thôi, không có câu trả lời đúng hay sai gì cả. Khoảng 25 phút ạ. Mình xin phép ghi âm để về nghe lại cho khỏi sót, được không ạ?"

**Nhóm B1 — Hành trình mua hàng gần nhất (8 phút)**

Hỏi về việc đã xảy ra, để người được phỏng vấn kể tự nhiên, hạn chế cắt ngang.

| # | Câu hỏi |
|---|---|
| B1.1 | Lần gần nhất anh/chị mua một món đồ điện tử trên mạng là khi nào, và mua gì ạ? |
| B1.2 | Anh/chị kể lại giúp mình từ lúc bắt đầu nghĩ tới việc mua cho tới lúc bấm đặt hàng — cụ thể đã làm những gì? |
| B1.3 | Quá trình đó kéo dài khoảng bao lâu ạ? |
| B1.4 | Anh/chị tham khảo những nguồn nào để so sánh? |
| B1.5 | Có ai giúp anh/chị chọn không, hay tự quyết định? |
| B1.6 | Cuối cùng điều gì khiến anh/chị chốt chọn sản phẩm đó? |

**Nhóm B2 — Khó khăn khi chọn sản phẩm (8 phút) — kiểm chứng GĐ-A**

| # | Câu hỏi |
|---|---|
| B2.1 | Trong quá trình đó, đoạn nào khiến anh/chị mất nhiều thời gian nhất? |
| B2.2 | Khi đọc bảng thông số kỹ thuật, có mục nào anh/chị không hiểu ý nghĩa không ạ? |
| B2.3 | Lúc không hiểu thì anh/chị làm gì? |
| B2.4 | Anh/chị có bao giờ định mua rồi bỏ dở giữa chừng không? Vì sao ạ? |
| B2.5 | Sau khi mua xong, có lần nào anh/chị thấy mình chọn chưa đúng không? Chuyện gì đã xảy ra? |
| B2.6 | Nếu có một người am hiểu ngồi cạnh lúc anh/chị chọn hàng, anh/chị sẽ hỏi họ điều gì đầu tiên? |

> **Câu B2.6 là câu quan trọng nhất của nhóm này.** Câu trả lời cho biết chính xác trợ lý AI cần trả lời được câu hỏi dạng nào. Ghi nguyên văn.

**Nhóm B3 — Thái độ với trợ lý ảo (9 phút) — kiểm chứng GĐ-B và GĐ-C**

| # | Câu hỏi |
|---|---|
| B3.1 | Anh/chị đã từng nhắn tin với trợ lý ảo hoặc hộp trò chuyện trên trang bán hàng chưa ạ? |
| B3.2 | *(Nếu rồi)* Lần đó thế nào? Nó có giúp được gì không? |
| B3.3 | *(Nếu rồi)* Điều gì khiến anh/chị ngừng dùng, hoặc chuyển sang tự tìm? |
| B3.4 | *(Nếu chưa)* Vì sao anh/chị không dùng ạ? |
| B3.5 | Nếu một trợ lý tự động gợi ý cho anh/chị một sản phẩm, anh/chị có tin không? |
| B3.6 | Điều gì sẽ làm anh/chị tin hơn vào gợi ý đó? |
| B3.7 | Ngược lại, điều gì sẽ khiến anh/chị lập tức mất lòng tin? |
| B3.8 | Anh/chị muốn trợ lý chỉ thẳng ra sản phẩm nên mua, hay giải thích lý do trước rồi mới gợi ý? |
| B3.9 | Nếu trợ lý có thể tự thêm hàng vào giỏ giúp anh/chị, anh/chị thấy tiện hay thấy phiền ạ? |

> **Câu B3.9 kiểm chứng trực tiếp yêu cầu YC-D-13.** Đây là quyết định ranh giới quan trọng của thiết kế; đừng bỏ qua vì tưởng đã biết câu trả lời.

**Nhóm B4 — Thông tin cá nhân (4 phút) — kiểm chứng YC-B-03, YC-B-04**

| # | Câu hỏi |
|---|---|
| B4.1 | Khi đăng ký tài khoản trên trang bán hàng, anh/chị thường điền tới đâu — chỉ mục bắt buộc hay điền hết? |
| B4.2 | Nếu trang web hỏi thêm về nghề nghiệp, sở thích, ngân sách để tư vấn tốt hơn, anh/chị có điền không ạ? |
| B4.3 | Anh/chị có thấy ngại khi biết hệ thống lưu lại lịch sử mua hàng của mình không? |

**Nhóm B5 — Thói quen chờ giảm giá (3 phút) — kiểm chứng YC-H**

| # | Câu hỏi |
|---|---|
| B5.1 | Anh/chị có bao giờ thấy món đồ ưng ý nhưng chờ giảm giá rồi mới mua không? |
| B5.2 | Anh/chị theo dõi giá bằng cách nào ạ? |
| B5.3 | Nếu được đăng ký nhận báo khi giá giảm, anh/chị muốn nhận qua đâu — thư điện tử, tin nhắn, hay thông báo trên trang web? |

**Kết thúc (3 phút):**

Đây là lúc — và chỉ lúc này — mới giới thiệu về sản phẩm dự kiến:

> "Nhóm mình đang định làm một trang bán hàng điện tử, trong đó có trợ lý tự động để anh/chị mô tả nhu cầu bằng lời bình thường, ví dụ 'cần laptop học lập trình, dưới 20 triệu, pin dùng được cả buổi', rồi nó gợi ý sản phẩm phù hợp kèm giải thích. Anh/chị thấy thế nào ạ?"

| # | Câu hỏi cuối |
|---|---|
| B6.1 | Anh/chị nghĩ mình có dùng thứ đó không? |
| B6.2 | Điều gì ở ý tưởng này làm anh/chị thấy chưa ổn? |
| B6.3 | Có điều gì về chuyện mua hàng điện tử mà mình chưa hỏi tới nhưng anh/chị nghĩ mình nên biết không ạ? |

Cảm ơn, hỏi có muốn dùng thử khi sản phẩm hoàn thành không.

---

### PV-03 — PHỎNG VẤN NGƯỜI DÙNG RÀNH CÔNG NGHỆ

| Mục | Nội dung |
|---|---|
| Đối tượng | Người mua hàng điện tử **có kiến thức kỹ thuật**, thường đã biết rõ mình cần model nào — tương ứng phân khúc 2, BA-02 mục 3.2 |
| Số lượng | 1–2 người |
| Thời lượng | 20 phút |
| Mức ưu tiên | Trung bình |

**Vì sao vẫn cần phỏng vấn nhóm này dù họ không phải phân khúc trọng tâm:** họ là nhóm **dễ bị trợ lý AI làm phiền nhất**. Nếu thiết kế chỉ tối ưu cho người cần tư vấn mà bỏ quên nhóm này, sản phẩm sẽ đuổi họ đi. Mục tiêu của buổi này không phải tìm nhu cầu mới mà là **tìm ra điều gì khiến họ khó chịu**.

**Mở đầu (1 phút):**
> "Chào anh/chị. Mình đang tìm hiểu về cách mọi người mua đồ điện tử trên mạng. Nghe nói anh/chị khá rành khoản này nên mình muốn hỏi vài câu ạ. Khoảng 20 phút thôi."

**Nhóm C1 — Cách mua hàng (8 phút)**

| # | Câu hỏi |
|---|---|
| C1.1 | Khi cần mua một món đồ điện tử, anh/chị thường bắt đầu từ đâu ạ? |
| C1.2 | Anh/chị dùng bộ lọc trên trang bán hàng như thế nào? |
| C1.3 | Có chức năng nào trên các trang bán hàng khiến anh/chị thấy bực mình không? |
| C1.4 | Thông tin nào trên trang sản phẩm anh/chị đọc kỹ nhất? |
| C1.5 | Có thông tin nào anh/chị cần mà các trang thường thiếu không ạ? |

**Nhóm C2 — Thái độ với trợ lý ảo (8 phút)**

| # | Câu hỏi |
|---|---|
| C2.1 | Anh/chị nghĩ gì về các hộp trò chuyện tự động trên trang bán hàng? |
| C2.2 | Anh/chị có dùng chúng không? Vì sao ạ? |
| C2.3 | Nếu một trang bán hàng có trợ lý tự động, anh/chị muốn nó xuất hiện thế nào — luôn hiện, hay chỉ hiện khi mình chủ động gọi? |
| C2.4 | Điều gì ở một hộp trò chuyện tự động khiến anh/chị thấy phiền nhất? |
| C2.5 | Có tình huống nào anh/chị nghĩ mình sẽ dùng tới nó không? |

> **Câu C2.3 và C2.4 cho ra kết luận thiết kế trực tiếp** về cách hiển thị trợ lý trên giao diện. Ghi kỹ.

**Nhóm C3 — So sánh và theo dõi giá (3 phút)**

| # | Câu hỏi |
|---|---|
| C3.1 | Anh/chị so sánh nhiều sản phẩm với nhau bằng cách nào ạ? |
| C3.2 | Anh/chị có theo dõi giá để chờ giảm không? Theo dõi bằng công cụ gì? |

**Kết thúc:** cảm ơn, hỏi câu mở cuối cùng.

---

### PV-04 — PHỎNG VẤN NGƯỜI CÓ KINH NGHIỆM BÁN LẺ HÀNG ĐIỆN TỬ

| Mục | Nội dung |
|---|---|
| Đối tượng | Người từng làm việc tại cửa hàng điện tử, hoặc bán hàng trực tuyến — chủ shop nhỏ, nhân viên bán hàng, người quản lý gian hàng trên sàn |
| Số lượng | 1–2 người |
| Thời lượng | 30 phút |
| Mức ưu tiên | Cao — quyết định chất lượng thiết kế khu vực quản trị |

**Vì sao cần buổi này:** khu vực quản trị là phần rất dễ bị thiết kế theo tưởng tượng của lập trình viên, vì bản thân nhóm chưa từng vận hành cửa hàng. Kết quả thường thấy: có đủ chức năng thêm–sửa–xoá nhưng dùng thực tế thì rất bất tiện.

**Nếu không tìm được người phù hợp:** thay bằng quan sát trực tiếp trang quản lý gian hàng của các sàn thương mại điện tử, và ghi rõ trong tài liệu rằng đây là nguồn thay thế.

**Mở đầu (2 phút):**
> "Chào anh/chị. Nhóm mình đang làm đồ án về một trang bán hàng điện tử, phần quản lý dành cho người bán. Nhóm mình chưa có kinh nghiệm bán hàng thật nên muốn hỏi anh/chị về công việc hằng ngày, để thiết kế cho sát thực tế ạ."

**Nhóm D1 — Công việc hằng ngày (8 phút)**

| # | Câu hỏi |
|---|---|
| D1.1 | Một ngày làm việc của anh/chị với gian hàng bắt đầu bằng việc gì ạ? |
| D1.2 | Anh/chị mở phần quản lý lên thì nhìn vào đâu đầu tiên? |
| D1.3 | Công việc nào chiếm nhiều thời gian nhất trong ngày? |
| D1.4 | Việc gì khiến anh/chị thấy mất công nhất mà đáng lẽ có thể nhanh hơn? |

**Nhóm D2 — Quy trình xử lý đơn hàng (10 phút) — phục vụ QT-05, QT-06, QT-07**

| # | Câu hỏi |
|---|---|
| D2.1 | Từ lúc khách đặt hàng tới lúc khách nhận được hàng, đơn hàng đi qua những bước nào ạ? |
| D2.2 | Ở mỗi bước đó, ai là người xử lý? |
| D2.3 | Đơn hàng có những trạng thái nào? Anh/chị gọi tên chúng thế nào? |
| D2.4 | Khi nào thì một đơn được coi là xong hẳn? |
| D2.5 | Khách huỷ đơn thì xử lý thế nào? Có giới hạn thời điểm được huỷ không ạ? |
| D2.6 | Với đơn thanh toán khi nhận hàng, tiền về tới cửa hàng qua đường nào? Ai xác nhận đã thu được tiền? |
| D2.7 | Có bao giờ đơn hàng bị kẹt, không rõ đang ở trạng thái nào không? Lúc đó xử lý ra sao? |

> **Nhóm D2 là phần giá trị nhất của buổi phỏng vấn này.** Câu trả lời sẽ trực tiếp trở thành sơ đồ vòng đời đơn hàng ở BA-01 mục 7.1. Vẽ luôn sơ đồ ngay trong buổi và đưa cho người được phỏng vấn xem để họ chỉnh lại.

**Nhóm D3 — Quản lý sản phẩm (7 phút) — phục vụ YC-I-10**

| # | Câu hỏi |
|---|---|
| D3.1 | Khi có hàng mới về, anh/chị đưa sản phẩm lên trang bán bằng cách nào? |
| D3.2 | Mỗi sản phẩm mất khoảng bao lâu để nhập đầy đủ thông tin ạ? |
| D3.3 | Phần nào tốn thời gian nhất — ảnh, mô tả, hay thông số kỹ thuật? |
| D3.4 | Nếu có 50 sản phẩm mới cùng lúc thì anh/chị làm thế nào? |
| D3.5 | Anh/chị quản lý số lượng hàng còn trong kho ra sao? |
| D3.6 | Có bao giờ bán nhầm sản phẩm đã hết hàng không? Hậu quả thế nào ạ? |

> **Câu D3.6 kiểm chứng mức độ quan trọng của YC-E-09 và YC-E-10** (kiểm tra tồn kho). Nếu người trong nghề nói đây là vấn đề thường gặp và gây hậu quả nặng, cần nâng ưu tiên hai yêu cầu này lên mức Bắt buộc.

**Nhóm D4 — Chỉ số theo dõi (3 phút) — phục vụ YC-I-09**

| # | Câu hỏi |
|---|---|
| D4.1 | Anh/chị theo dõi những con số nào để biết cửa hàng đang bán tốt hay không? |
| D4.2 | Anh/chị xem chúng bao lâu một lần? |
| D4.3 | Có con số nào anh/chị muốn xem mà hệ thống hiện tại không có không ạ? |

**Kết thúc (2 phút):** tóm tắt, xác nhận sơ đồ vòng đời đơn hàng vừa vẽ, cảm ơn.

---

### PV-05 — HỌP NHÓM: CHỐT PHẠM VI VÀ PHÂN CÔNG

| Mục | Nội dung |
|---|---|
| Đối tượng | Cả ba thành viên nhóm |
| Thời lượng | 60 phút |
| Điều kiện tiên quyết | **Đã hoàn thành PV-01 → PV-04 và đã tổng hợp kết quả** |
| Hình thức | Họp có người điều phối, có biên bản, kết thúc phải ra quyết định |

**Vì sao buổi này đặt cuối cùng:** nhóm sinh viên thường làm ngược — họp chốt phạm vi ngay từ đầu rồi mới đi khảo sát, dẫn tới phải sửa lại phạm vi sau khi đã lập trình một phần. Chốt phạm vi phải diễn ra **sau** khi đã biết giảng viên yêu cầu gì và người dùng cần gì.

**Chuẩn bị trước:** tổng hợp kết quả bốn buổi trước thành một trang, chiếu lên cho cả nhóm cùng nhìn.

**Nhóm E1 — Phân công vai trò (12 phút)**

| # | Nội dung thảo luận |
|---|---|
| E1.1 | Điền bảng phân công ở BA-02 mục 2.1: mỗi người vai trò chính là gì, kiêm nhiệm gì |
| E1.2 | Ai chịu trách nhiệm phần tài liệu nộp cho giảng viên? *(Đây là phần dễ bị bỏ rơi nhất — phải có tên cụ thể)* |
| E1.3 | Ai chịu trách nhiệm kiểm thử? Áp dụng kiểm thử chéo như thế nào? |
| E1.4 | Ai là đầu mối làm việc với giảng viên? |
| E1.5 | Nhóm trao đổi qua kênh nào, họp định kỳ vào thời điểm nào trong tuần? |

**Nhóm E2 — Năng lực và thời gian thực tế (8 phút)**

| # | Nội dung thảo luận |
|---|---|
| E2.1 | Mỗi người dành được bao nhiêu giờ mỗi tuần cho đồ án? *(Cộng lại để có tổng quỹ thời gian thật)* |
| E2.2 | Có ai đang vướng môn học khác hoặc công việc gì có thể ảnh hưởng tiến độ không? |
| E2.3 | Công nghệ dự kiến dùng, ai đã có kinh nghiệm, ai cần thời gian học? |
| E2.4 | Với quỹ thời gian đó, nhóm làm được bao nhiêu trong tổng số yêu cầu ở BA-01 mục 5? |

> **Câu E2.4 là câu đối chiếu thực tế.** Nhiều nhóm lập kế hoạch dựa trên mong muốn chứ không dựa trên số giờ thực có. Nên tính ra con số cụ thể trước khi chốt phạm vi ở nhóm E4.

**Nhóm E3 — Chốt quy tắc nghiệp vụ (20 phút)**

Đi lần lượt từng quy tắc QT-01 → QT-10 ở BA-01 mục 7. Với mỗi quy tắc, **phải ra được một giá trị cụ thể** và ghi vào biên bản, kèm lý do:

| Quy tắc | Nội dung cần chốt | Giá trị chốt | Lý do |
|---|---|---|---|
| QT-01 | Cách tính phí vận chuyển | | |
| QT-02 | Ngưỡng miễn phí vận chuyển | | |
| QT-03 | Công thức tính tổng tiền đơn hàng | | |
| QT-04 | Số tiền giảm có vượt giá trị hàng không | | |
| QT-05 | Trạng thái nào khách được huỷ đơn | | |
| QT-06 | Vòng đời đơn hàng | | |
| QT-07 | Thời điểm ghi nhận doanh thu | | |
| QT-08 | Một sản phẩm mấy dòng trong giỏ hàng | | |
| QT-09 | Xử lý mã giảm giá hết hạn | | |
| QT-10 | Tần suất kiểm tra giá | | |

> **Nguyên tắc bắt buộc:** mọi con số chốt ra đều phải có lý do ghi kèm. Một con số không có lý do là con số sẽ không ai bảo vệ được khi bị hội đồng hỏi *"vì sao lại là con số này?"*

**Nhóm E4 — Chốt phạm vi phiên bản đầu tiên (20 phút)**

Rà lại toàn bộ yêu cầu ở BA-01 mục 5, xác nhận hoặc điều chỉnh mức ưu tiên dựa trên kết quả khảo sát:

| Bước | Việc làm |
|---|---|
| 1 | Rà các yêu cầu mức **Bắt buộc** — có yêu cầu nào cần nâng lên hoặc hạ xuống sau khảo sát không? |
| 2 | Ước lượng khối lượng công việc cho toàn bộ nhóm Bắt buộc |
| 3 | Đối chiếu với quỹ thời gian thực tế ở E2.4 |
| 4 | **Nếu vượt quá khả năng:** hạ bớt yêu cầu xuống mức thấp hơn, **không** rút ngắn thời gian kiểm thử và làm tài liệu |
| 5 | Chốt danh sách yêu cầu của phiên bản đầu tiên |
| 6 | Phân công người thực hiện và mốc thời gian cho từng nhóm yêu cầu |

> **Cảnh báo về bước 4.** Khi bị dồn tiến độ, phản xạ tự nhiên là cắt phần kiểm thử và tài liệu vì chúng "không nhìn thấy được". Đây là sai lầm đắt giá trong đồ án môn học, vì tài liệu thường chiếm tỷ trọng điểm đáng kể — hãy đối chiếu lại kết quả câu A3.1 ở PV-01 trước khi quyết.

**Kết quả bắt buộc có sau buổi này:**
- [ ] Bảng phân công vai trò có tên cụ thể từng người
- [ ] Bảng 10 quy tắc nghiệp vụ đã chốt, có lý do
- [ ] Danh sách yêu cầu của phiên bản đầu tiên
- [ ] Lịch làm việc với các mốc trung gian
- [ ] Biên bản có xác nhận của cả ba thành viên

---

## 5. MẪU BIÊN BẢN PHỎNG VẤN

Dùng chung cho mọi buổi. Hoàn thành trong vòng 24 giờ sau phỏng vấn — để lâu sẽ quên chi tiết và chỉ còn nhớ ấn tượng chung.

```
BIÊN BẢN PHỎNG VẤN
──────────────────────────────────────────────
Mã buổi              : PV-__
Người được phỏng vấn : ______________
Vai trò / bối cảnh   : ______________
Người hỏi            : ______________
Người ghi chép       : ______________
Thời gian            : __/__/2026, từ __:__ đến __:__
Hình thức            : ______________
Có ghi âm            : [ ] Có  [ ] Không   (đã xin phép: [ ] Có [ ] Không)

1. NỘI DUNG GHI NHẬN
   Nhóm __ :
   - Câu __ : (ghi nguyên văn câu trả lời, giữ đúng con số, tên riêng, mốc thời gian)
   ...

2. PHÁT HIỆN CHÍNH
   (3–5 điểm quan trọng nhất rút ra từ buổi này)
   -

3. KIỂM CHỨNG GIẢ ĐỊNH
   | Giả định | Kết quả | Căn cứ (câu trả lời nào) |
   |---|---|---|
   | GĐ-__ | [ ] Đúng [ ] Sai [ ] Chưa kết luận được | |

4. YÊU CẦU MỚI PHÁT SINH
   | Mã tạm | Mô tả | Người đề xuất | Ưu tiên đề xuất |
   |---|---|---|---|

5. YÊU CẦU CẦN ĐIỀU CHỈNH
   | Mã yêu cầu | Nội dung hiện tại | Đề xuất sửa | Lý do |
   |---|---|---|---|

6. CÂU HỎI CÒN BỎ NGỎ — cần hỏi ai, buổi nào
   -

7. VIỆC CẦN LÀM SAU BUỔI
   | Việc | Người làm | Hạn |
   |---|---|---|

8. XÁC NHẬN
   [ ] Người được phỏng vấn đã đọc và xác nhận nội dung
   Ngày: __/__/2026
```

---

## 6. DANH MỤC KIỂM TRA

**Trước mỗi buổi:**
- [ ] Đã đọc lại phần liên quan trong BA-01-REQ và BA-02-STK
- [ ] Đã xác định rõ buổi này nhằm làm rõ vấn đề nào (theo ma trận mục 3)
- [ ] Đã hẹn trước, nói rõ chủ đề và thời lượng
- [ ] Đã phân công người hỏi và người ghi chép
- [ ] Đã chuẩn bị mẫu biên bản và thiết bị ghi âm

**Trong buổi:**
- [ ] Xin phép trước khi ghi âm
- [ ] **Không mô tả giải pháp trước khi hỏi xong phần vấn đề**
- [ ] Ghi nguyên văn con số, tên riêng, mốc thời gian
- [ ] Đánh dấu chỗ người được hỏi ngập ngừng hoặc trả lời vòng vo — thường là chỗ có vấn đề
- [ ] Tóm tắt và xác nhận sau mỗi nhóm câu hỏi
- [ ] Hỏi câu mở cuối cùng: *"Có điều gì mình chưa hỏi mà anh/chị nghĩ mình nên biết không?"*

**Sau buổi:**
- [ ] Hoàn thành biên bản trong 24 giờ
- [ ] Gửi lại người được phỏng vấn xác nhận *(với PV-01 và PV-04)*
- [ ] Cập nhật trạng thái các mục `[CẦN LÀM RÕ]` trong BA-01-REQ
- [ ] Cập nhật kết quả kiểm chứng giả định vào BA-02-STK mục 3.4
- [ ] Ghi nhận yêu cầu mới, đánh mã và truy vết về buổi phỏng vấn

---

## 7. LỊCH THỰC HIỆN

| Buổi | Đối tượng | Số người | Thời lượng | Thứ tự | Điều kiện tiên quyết |
|---|---|---|---|---|---|
| PV-01 | Giảng viên hướng dẫn | 1 | 20–30 phút | **Trước tiên** | Không |
| PV-02 | Người dùng đại diện — phân khúc trọng tâm | 3–4 | 25–30 phút/người | Thứ 2 | Không |
| PV-03 | Người dùng rành công nghệ | 1–2 | 20 phút/người | Thứ 3 | Không |
| PV-04 | Người có kinh nghiệm bán lẻ | 1–2 | 30 phút/người | Thứ 4 | Không |
| PV-05 | Nội bộ nhóm | 3 | 60 phút | **Cuối cùng** | **Phải xong PV-01 → PV-04** |

**Ước lượng thời gian:**

| Hạng mục | Thời gian |
|---|---|
| Thời gian phỏng vấn trực tiếp | Khoảng 4–5 giờ |
| Thời gian lập biên bản | Khoảng 4–5 giờ *(kinh nghiệm: bằng khoảng thời lượng phỏng vấn)* |
| Thời gian tổng hợp và cập nhật tài liệu | Khoảng 3–4 giờ |
| **Tổng** | **Khoảng 12–14 giờ** |

PV-02, PV-03, PV-04 độc lập với nhau, có thể tiến hành song song nếu chia người.

---

## 8. GHI CHÚ VỀ PHẠM VI TÀI LIỆU

Yêu cầu đặt ra là xây dựng kịch bản khảo sát ở mục **phỏng vấn**, nên tài liệu này chỉ trình bày kỹ thuật phỏng vấn. Trong quá trình lập, nhận thấy có ba kỹ thuật khảo sát khác có thể bổ sung — **nêu ra để nhóm quyết định, không tự làm thêm:**

| Kỹ thuật | Dùng để làm gì | Vì sao có thể cần |
|---|---|---|
| **Bảng hỏi (questionnaire)** | Khảo sát diện rộng về thói quen mua hàng điện tử và mức tin tưởng trợ lý ảo | Phỏng vấn 4–6 người là mẫu quá nhỏ để rút ra kết luận có sức thuyết phục khi bảo vệ. Một bảng hỏi phát cho 50–100 sinh viên sẽ cho số liệu định lượng bổ sung cho phần định tính từ phỏng vấn |
| **Rà soát đối thủ (competitive analysis)** | Lập bảng đối chiếu chức năng với các sàn thương mại điện tử đang hoạt động | Trả lời được câu hỏi *"sản phẩm này khác gì thứ đã có?"* — câu hỏi gần như chắc chắn sẽ gặp khi bảo vệ |
| **Quan sát người dùng thao tác (usability testing)** | Cho người chưa biết hệ thống tự thao tác và ghi lại chỗ họ vướng | Áp dụng ở giai đoạn sau, khi đã có bản chạy được. Phát hiện được vấn đề giao diện mà phỏng vấn không lộ ra, vì người ta thường không nhớ chính xác mình đã vướng ở đâu |

Nếu nhóm cần, các kịch bản này sẽ được lập trong tài liệu riêng.

---

## 9. PHÊ DUYỆT

| Vai trò | Họ tên | Ngày | Ý kiến |
|---|---|---|---|
| Người lập | | | |
| Đại diện nhóm dự án | | | |

---

*Hết tài liệu BA-03-INT v1.0*
