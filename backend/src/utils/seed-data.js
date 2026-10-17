const DEFAULT_PASSWORD = 'Fptu@2026';

const admins = [
  { name: 'Admin', email: 'admin@fpt.edu.vn', role: 'admin' },
];

const lecturers = [
  {
    name: 'Nguyễn Hải Đăng',
    email: 'dangnh@fe.edu.vn',
    role: 'lecturer',
    major: 'Kỹ thuật phần mềm',
    description: 'Giảng viên bộ môn Kỹ thuật phần mềm, quan tâm tới kiến trúc microservices và DevOps.',
    skills: ['Java', 'Spring Boot', 'System Design', 'Docker'],
  },
  {
    name: 'Trần Thị Mai Hương',
    email: 'huongttm@fe.edu.vn',
    role: 'lecturer',
    major: 'Trí tuệ nhân tạo',
    description: 'Giảng viên Trí tuệ nhân tạo, hướng nghiên cứu về xử lý ngôn ngữ tự nhiên tiếng Việt.',
    skills: ['Python', 'Machine Learning', 'NLP', 'PyTorch'],
  },
  {
    name: 'Lê Quốc Bảo',
    email: 'baolq@fe.edu.vn',
    role: 'lecturer',
    major: 'An toàn thông tin',
    description: 'Giảng viên An toàn thông tin, phụ trách các học phần về bảo mật mạng và mật mã học.',
    skills: ['Network Security', 'Cryptography', 'Linux', 'Penetration Testing'],
  },
  {
    name: 'Phạm Thùy Dung',
    email: 'dungpt@fe.edu.vn',
    role: 'lecturer',
    major: 'Thiết kế đồ họa',
    description: 'Giảng viên Thiết kế đồ họa, chuyên về trải nghiệm người dùng và nhận diện thương hiệu.',
    skills: ['UI/UX', 'Figma', 'Adobe Illustrator', 'Design System'],
  },
  {
    name: 'Đỗ Minh Khôi',
    email: 'khoidm@fe.edu.vn',
    role: 'lecturer',
    major: 'Quản trị kinh doanh',
    description: 'Giảng viên Quản trị kinh doanh, giảng dạy khởi nghiệp và quản trị dự án.',
    skills: ['Project Management', 'Marketing', 'Business Analysis'],
  },
];

const clubLeaders = [
  {
    name: 'Vũ Anh Tuấn',
    email: 'tuanva.clb@fpt.edu.vn',
    role: 'club_leader',
    major: 'Kỹ thuật phần mềm',
    description: 'Chủ nhiệm CLB Lập trình FCode, tổ chức các sự kiện hackathon và workshop công nghệ.',
    skills: ['JavaScript', 'React', 'Community'],
  },
];

const students = [
  {
    name: 'Nguyễn Minh Thuận',
    email: 'thuannmhe161234@fpt.edu.vn',
    major: 'Kỹ thuật phần mềm',
    gpa: 3.6,
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    interests: ['Web Development', 'Startup', 'Y tế số'],
    description: 'Sinh viên năm 3 ngành Kỹ thuật phần mềm, thích xây dựng sản phẩm web thực tế, đang tìm nhóm làm đồ án về y tế và sức khỏe.',
  },
  {
    name: 'Trần Gia Bảo',
    email: 'baotghe162001@fpt.edu.vn',
    major: 'Kỹ thuật phần mềm',
    gpa: 3.2,
    skills: ['Java', 'Spring Boot', 'MySQL'],
    interests: ['Backend', 'Fintech'],
    description: 'Yêu thích lập trình backend và hệ thống thanh toán, mong muốn tham gia dự án fintech.',
  },
  {
    name: 'Lê Thảo Nguyên',
    email: 'nguyenltse160877@fpt.edu.vn',
    major: 'Trí tuệ nhân tạo',
    gpa: 3.8,
    skills: ['Python', 'Machine Learning', 'Pandas', 'TensorFlow'],
    interests: ['AI', 'Y tế số', 'Nghiên cứu'],
    description: 'Đam mê trí tuệ nhân tạo ứng dụng trong y tế, có kinh nghiệm với các mô hình học máy.',
  },
  {
    name: 'Phạm Đức Anh',
    email: 'anhpdhe163344@fpt.edu.vn',
    major: 'An toàn thông tin',
    gpa: 3.1,
    skills: ['Linux', 'Network Security', 'Python'],
    interests: ['Cyber Security', 'CTF'],
    description: 'Thành viên đội CTF của trường, quan tâm tới bảo mật ứng dụng web.',
  },
  {
    name: 'Hoàng Thị Kim Ngân',
    email: 'nganhtkse161122@fpt.edu.vn',
    major: 'Thiết kế đồ họa',
    gpa: 3.5,
    skills: ['Figma', 'UI/UX', 'Photoshop', 'Illustrator'],
    interests: ['Design', 'Branding', 'Startup'],
    description: 'Chuyên thiết kế giao diện và trải nghiệm người dùng, tìm nhóm cần vị trí UI/UX cho sản phẩm khởi nghiệp.',
  },
  {
    name: 'Đặng Quốc Huy',
    email: 'huydqhe162788@fpt.edu.vn',
    major: 'Kỹ thuật phần mềm',
    gpa: 2.9,
    skills: ['C#', '.NET', 'SQL Server'],
    interests: ['Game Development', 'Web Development'],
    description: 'Thích phát triển ứng dụng desktop và web bằng hệ sinh thái .NET.',
  },
  {
    name: 'Bùi Phương Linh',
    email: 'linhbpse160455@fpt.edu.vn',
    major: 'Digital Marketing',
    gpa: 3.4,
    skills: ['Content Marketing', 'SEO', 'Canva', 'Social Media'],
    interests: ['Marketing', 'Startup', 'Sự kiện'],
    description: 'Sinh viên Digital Marketing, có kinh nghiệm truyền thông sự kiện, muốn hỗ trợ mảng marketing cho các nhóm dự án.',
  },
  {
    name: 'Ngô Tấn Phát',
    email: 'phatnthe164900@fpt.edu.vn',
    major: 'Trí tuệ nhân tạo',
    gpa: 3.0,
    skills: ['Python', 'Data Analysis', 'SQL'],
    interests: ['Data Science', 'Fintech'],
    description: 'Quan tâm tới phân tích dữ liệu và khoa học dữ liệu ứng dụng trong tài chính.',
  },
  {
    name: 'Vương Hải Yến',
    email: 'yenvhse161600@fpt.edu.vn',
    major: 'Kỹ thuật phần mềm',
    gpa: 3.7,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    interests: ['Web Development', 'Y tế số'],
    description: 'Lập trình viên fullstack, thích các dự án tạo tác động xã hội trong lĩnh vực y tế.',
  },
  {
    name: 'Trịnh Văn Khánh',
    email: 'khanhtvhe162355@fpt.edu.vn',
    major: 'An toàn thông tin',
    gpa: 2.7,
    skills: ['Python', 'Docker', 'Linux'],
    interests: ['DevOps', 'Cyber Security'],
    description: 'Đang học về DevOps và bảo mật hạ tầng, muốn tham gia nhóm cần vị trí vận hành hệ thống.',
  },
  {
    name: 'Lý Gia Hân',
    email: 'hanlgse160199@fpt.edu.vn',
    major: 'Quản trị kinh doanh',
    gpa: 3.3,
    skills: ['Business Analysis', 'Excel', 'Project Management'],
    interests: ['Startup', 'Fintech', 'Sự kiện'],
    description: 'Sinh viên Quản trị kinh doanh, mạnh về phân tích nghiệp vụ và điều phối dự án.',
  },
  {
    name: 'Cao Nhật Nam',
    email: 'namcnhe163011@fpt.edu.vn',
    major: 'Kỹ thuật phần mềm',
    gpa: 3.9,
    skills: ['Java', 'Algorithms', 'System Design', 'Kubernetes'],
    interests: ['Backend', 'Competitive Programming'],
    description: 'Thành viên đội tuyển lập trình ICPC, mạnh về thuật toán và thiết kế hệ thống backend.',
  },
];

const courses = [
  {
    code: 'PRF192',
    title: 'Lập trình cơ bản với C',
    description: 'Nhập môn lập trình sử dụng ngôn ngữ C: biến, kiểu dữ liệu, cấu trúc điều khiển, hàm và con trỏ.',
    semester: 'Fall 2026',
    lecturerEmail: 'dangnh@fe.edu.vn',
  },
  {
    code: 'PRO192',
    title: 'Lập trình hướng đối tượng',
    description: 'Các nguyên lý lập trình hướng đối tượng với Java: đóng gói, kế thừa, đa hình và trừu tượng.',
    semester: 'Fall 2026',
    lecturerEmail: 'dangnh@fe.edu.vn',
  },
  {
    code: 'CSD201',
    title: 'Cấu trúc dữ liệu và giải thuật',
    description: 'Các cấu trúc dữ liệu nền tảng và giải thuật: danh sách, cây, đồ thị, sắp xếp và tìm kiếm.',
    semester: 'Fall 2026',
    lecturerEmail: 'dangnh@fe.edu.vn',
  },
  {
    code: 'DBI202',
    title: 'Hệ quản trị cơ sở dữ liệu',
    description: 'Thiết kế cơ sở dữ liệu quan hệ, mô hình thực thể liên kết, chuẩn hóa và ngôn ngữ truy vấn SQL.',
    semester: 'Fall 2026',
    lecturerEmail: 'baolq@fe.edu.vn',
  },
  {
    code: 'PRJ301',
    title: 'Lập trình Java Web',
    description: 'Xây dựng ứng dụng web với Java Servlet, JSP, mô hình MVC và kết nối cơ sở dữ liệu.',
    semester: 'Spring 2026',
    lecturerEmail: 'dangnh@fe.edu.vn',
  },
  {
    code: 'AIL303m',
    title: 'Học máy',
    description: 'Nền tảng học máy: hồi quy, phân loại, cây quyết định, mạng nơ-ron và đánh giá mô hình.',
    semester: 'Spring 2026',
    lecturerEmail: 'huongttm@fe.edu.vn',
  },
  {
    code: 'IAO202',
    title: 'Nhập môn An toàn thông tin',
    description: 'Các khái niệm cơ bản về an toàn thông tin: mật mã, xác thực, kiểm soát truy cập và bảo mật mạng.',
    semester: 'Spring 2026',
    lecturerEmail: 'baolq@fe.edu.vn',
  },
  {
    code: 'GDE101',
    title: 'Nguyên lý thiết kế đồ họa',
    description: 'Nguyên lý bố cục, màu sắc, kiểu chữ và tư duy thiết kế lấy người dùng làm trung tâm.',
    semester: 'Spring 2026',
    lecturerEmail: 'dungpt@fe.edu.vn',
  },
];

const materialTemplates = [
  {
    courseCode: 'CSD201',
    title: 'Chương 1 - Tổng quan cấu trúc dữ liệu',
    description: 'Bài giảng giới thiệu các cấu trúc dữ liệu nền tảng và độ phức tạp thuật toán.',
    fileName: 'csd201-chuong1-tong-quan.txt',
    text:
      'Cấu trúc dữ liệu là cách tổ chức và lưu trữ dữ liệu trong bộ nhớ máy tính nhằm truy cập và xử lý hiệu quả. ' +
      'Mảng là cấu trúc dữ liệu tuyến tính lưu trữ các phần tử liên tiếp nhau trong bộ nhớ với thời gian truy cập không đổi. ' +
      'Danh sách liên kết bao gồm các nút được nối với nhau thông qua con trỏ và cho phép chèn xóa phần tử linh hoạt. ' +
      'Ngăn xếp là cấu trúc hoạt động theo nguyên tắc vào sau ra trước và thường dùng trong việc quản lý lời gọi hàm. ' +
      'Hàng đợi là cấu trúc hoạt động theo nguyên tắc vào trước ra trước và được ứng dụng trong xử lý tác vụ tuần tự. ' +
      'Cây nhị phân tìm kiếm giúp tìm kiếm chèn và xóa phần tử với độ phức tạp trung bình là logarit của số phần tử. ' +
      'Bảng băm ánh xạ khóa tới giá trị thông qua hàm băm và cho phép truy xuất dữ liệu gần như tức thời trong thực tế. ' +
      'Độ phức tạp thời gian mô tả mức tăng của số phép tính khi kích thước dữ liệu đầu vào tăng lên đáng kể.',
  },
  {
    courseCode: 'DBI202',
    title: 'Chương 2 - Mô hình quan hệ và chuẩn hóa',
    description: 'Tài liệu về mô hình dữ liệu quan hệ, khóa chính, khóa ngoại và các dạng chuẩn.',
    fileName: 'dbi202-chuong2-chuan-hoa.txt',
    text:
      'Mô hình quan hệ tổ chức dữ liệu thành các bảng gồm hàng và cột với mỗi hàng đại diện cho một bản ghi duy nhất. ' +
      'Khóa chính là một hoặc nhiều cột dùng để xác định duy nhất mỗi bản ghi trong một bảng dữ liệu quan hệ. ' +
      'Khóa ngoại là cột tham chiếu tới khóa chính của bảng khác nhằm thiết lập mối quan hệ ràng buộc giữa các bảng. ' +
      'Chuẩn hóa là quá trình tổ chức lại dữ liệu để giảm dư thừa và tránh các bất thường khi thêm sửa hoặc xóa dữ liệu. ' +
      'Dạng chuẩn thứ nhất yêu cầu mọi thuộc tính trong bảng đều mang giá trị nguyên tố và không chứa nhóm lặp lại. ' +
      'Dạng chuẩn thứ hai yêu cầu bảng đã ở dạng chuẩn thứ nhất và mọi thuộc tính phụ thuộc hoàn toàn vào khóa chính. ' +
      'Dạng chuẩn thứ ba loại bỏ phụ thuộc bắc cầu giữa các thuộc tính không phải là khóa trong bảng dữ liệu. ' +
      'Chỉ mục giúp tăng tốc độ truy vấn bằng cách tạo cấu trúc tìm kiếm trên các cột được truy vấn thường xuyên.',
  },
  {
    courseCode: 'AIL303m',
    title: 'Chương 1 - Giới thiệu học máy',
    description: 'Bài giảng tổng quan về học máy, học có giám sát và học không giám sát.',
    fileName: 'ail303m-chuong1-gioi-thieu.txt',
    text:
      'Học máy là lĩnh vực giúp máy tính tự động cải thiện hiệu suất thông qua dữ liệu mà không cần lập trình tường minh. ' +
      'Học có giám sát sử dụng dữ liệu đã được gán nhãn để huấn luyện mô hình dự đoán kết quả cho dữ liệu mới. ' +
      'Học không giám sát tìm kiếm cấu trúc ẩn trong dữ liệu chưa được gán nhãn thông qua phân cụm và giảm chiều. ' +
      'Hồi quy tuyến tính là mô hình dự đoán một giá trị liên tục dựa trên mối quan hệ tuyến tính giữa các biến đầu vào. ' +
      'Phân loại là bài toán gán mỗi mẫu dữ liệu vào một trong các nhóm rời rạc đã được xác định trước đó. ' +
      'Quá khớp xảy ra khi mô hình học quá kỹ dữ liệu huấn luyện và mất khả năng khái quát trên dữ liệu chưa từng thấy. ' +
      'Tập kiểm định được dùng để đánh giá khách quan hiệu năng của mô hình trước khi triển khai vào thực tế. ' +
      'Mạng nơ-ron nhân tạo mô phỏng cách hoạt động của các nơ-ron sinh học để học các đặc trưng phức tạp từ dữ liệu.',
  },
  {
    courseCode: 'PRO192',
    title: 'Chương 3 - Kế thừa và đa hình',
    description: 'Tài liệu về kế thừa, đa hình và các nguyên lý thiết kế hướng đối tượng trong Java.',
    fileName: 'pro192-chuong3-ke-thua.txt',
    text:
      'Lập trình hướng đối tượng tổ chức chương trình thành các đối tượng bao gồm dữ liệu và các phương thức xử lý dữ liệu. ' +
      'Đóng gói là nguyên lý ẩn giấu chi tiết cài đặt bên trong và chỉ cung cấp giao diện cần thiết ra bên ngoài. ' +
      'Kế thừa cho phép một lớp con tái sử dụng thuộc tính và phương thức của lớp cha nhằm giảm sự trùng lặp mã nguồn. ' +
      'Đa hình cho phép cùng một lời gọi phương thức thực thi hành vi khác nhau tùy theo kiểu thực tế của đối tượng. ' +
      'Trừu tượng giúp tập trung vào các đặc điểm quan trọng của đối tượng và bỏ qua những chi tiết không cần thiết. ' +
      'Lớp trừu tượng không thể khởi tạo trực tiếp và thường định nghĩa các phương thức chung cho những lớp con kế thừa. ' +
      'Giao diện định nghĩa một tập hợp các phương thức mà lớp cài đặt bắt buộc phải triển khai đầy đủ. ' +
      'Nguyên lý đơn trách nhiệm khuyến nghị mỗi lớp chỉ nên đảm nhận một nhiệm vụ duy nhất trong hệ thống.',
  },
];

const teamTemplates = [
  {
    name: 'HealthMate - Trợ lý sức khỏe',
    description: 'Xây dựng ứng dụng nhắc lịch uống thuốc và theo dõi sức khỏe cá nhân cho người cao tuổi.',
    topic: 'Y tế số, sức khỏe, ứng dụng di động',
    major: 'Kỹ thuật phần mềm',
    skillsNeeded: ['react', 'node.js', 'ui/ux', 'machine learning'],
    maxMembers: 5,
    leaderEmail: 'thuannmhe161234@fpt.edu.vn',
    memberEmails: ['yenvhse161600@fpt.edu.vn'],
  },
  {
    name: 'PayFlow - Ví điện tử sinh viên',
    description: 'Nền tảng thanh toán và quản lý chi tiêu dành cho sinh viên với tính năng chia tiền nhóm.',
    topic: 'Fintech, thanh toán, quản lý chi tiêu',
    major: 'Kỹ thuật phần mềm',
    skillsNeeded: ['java', 'spring boot', 'business analysis', 'data analysis'],
    maxMembers: 5,
    leaderEmail: 'baotghe162001@fpt.edu.vn',
    memberEmails: ['hanlgse160199@fpt.edu.vn'],
  },
  {
    name: 'MediScan AI',
    description: 'Ứng dụng học máy hỗ trợ sàng lọc hình ảnh y tế và gợi ý chẩn đoán sơ bộ cho bác sĩ.',
    topic: 'Trí tuệ nhân tạo, y tế, xử lý ảnh',
    major: 'Trí tuệ nhân tạo',
    skillsNeeded: ['python', 'machine learning', 'tensorflow', 'ui/ux'],
    maxMembers: 4,
    leaderEmail: 'nguyenltse160877@fpt.edu.vn',
    memberEmails: [],
  },
];

const joinRequestTemplates = [
  { teamName: 'MediScan AI', applicantEmail: 'nganhtkse161122@fpt.edu.vn', message: 'Mình là UI/UX designer, rất muốn tham gia mảng giao diện cho dự án y tế của nhóm.' },
  { teamName: 'HealthMate - Trợ lý sức khỏe', applicantEmail: 'linhbpse160455@fpt.edu.vn', message: 'Mình phụ trách marketing và truyền thông, mong được đồng hành cùng nhóm.' },
  { teamName: 'PayFlow - Ví điện tử sinh viên', applicantEmail: 'phatnthe164900@fpt.edu.vn', message: 'Mình mạnh về phân tích dữ liệu tài chính, muốn hỗ trợ nhóm phần báo cáo chi tiêu.' },
];

const announcementTemplates = [
  {
    title: 'Lịch nghỉ lễ Quốc khánh 2/9',
    content: 'Nhà trường thông báo lịch nghỉ lễ Quốc khánh từ ngày 01/09 đến hết ngày 03/09. Lịch học sẽ trở lại bình thường từ ngày 04/09.',
    scope: 'global',
    audience: 'all',
    authorEmail: 'admin@fpt.edu.vn',
    broadcast: true,
  },
  {
    title: 'Hạn nộp đồ án môn CSD201',
    content: 'Sinh viên lớp Cấu trúc dữ liệu và giải thuật vui lòng nộp báo cáo đồ án cuối kỳ trước 23h59 ngày 20/07 qua hệ thống.',
    scope: 'course',
    courseCode: 'CSD201',
    audience: 'students',
    authorEmail: 'dangnh@fe.edu.vn',
  },
  {
    title: 'Cập nhật đề cương học phần Học máy',
    content: 'Đề cương học phần AIL303m đã được cập nhật bổ sung phần thực hành với PyTorch. Sinh viên vui lòng xem tài liệu mới trên hệ thống.',
    scope: 'course',
    courseCode: 'AIL303m',
    audience: 'students',
    authorEmail: 'huongttm@fe.edu.vn',
  },
];

const postTemplates = [
  {
    type: 'event',
    title: 'AI Hackathon 2026 - Giải pháp cho Y tế Việt Nam',
    content: 'CLB FCode tổ chức cuộc thi AI Hackathon 2026 với chủ đề ứng dụng trí tuệ nhân tạo trong y tế. Giải thưởng lên tới 50 triệu đồng. Các đội cần tuyển thành viên Backend, UI/UX và Marketing. Nhấn nút tìm đồng đội để kết nối ngay!',
    tagsNeeded: ['Backend', 'UI/UX', 'Marketing'],
    eventDate: '2026-08-15T08:00:00.000Z',
    authorEmail: 'tuanva.clb@fpt.edu.vn',
  },
  {
    type: 'event',
    title: 'Workshop: Thiết kế hệ thống chịu tải cao',
    content: 'Buổi workshop chia sẻ kinh nghiệm thiết kế hệ thống backend chịu tải cao với diễn giả đến từ doanh nghiệp. Số lượng chỗ ngồi có hạn, đăng ký sớm để giữ chỗ.',
    tagsNeeded: ['Backend', 'System Design'],
    eventDate: '2026-07-25T13:30:00.000Z',
    authorEmail: 'tuanva.clb@fpt.edu.vn',
  },
  {
    type: 'academic_update',
    title: 'Mở đăng ký học kỳ Fall 2026',
    content: 'Cổng đăng ký môn học kỳ Fall 2026 đã mở. Sinh viên vui lòng hoàn tất đăng ký trước ngày 10/07 để đảm bảo có lớp phù hợp.',
    tagsNeeded: [],
    authorEmail: 'khoidm@fe.edu.vn',
  },
];

const quizTemplates = [
  {
    title: 'Ôn tập Cấu trúc dữ liệu - Chương 1',
    courseCode: 'CSD201',
    creatorEmail: 'dangnh@fe.edu.vn',
    questions: [
      {
        questionText: 'Ngăn xếp (Stack) hoạt động theo nguyên tắc nào?',
        options: ['Vào trước ra trước (FIFO)', 'Vào sau ra trước (LIFO)', 'Truy cập ngẫu nhiên', 'Ưu tiên theo trọng số'],
        correctIndexes: [1],
      },
      {
        questionText: 'Cấu trúc dữ liệu nào cho phép truy cập phần tử với thời gian không đổi qua chỉ số?',
        options: ['Danh sách liên kết', 'Mảng', 'Cây nhị phân', 'Hàng đợi'],
        correctIndexes: [1],
      },
      {
        questionText: 'Độ phức tạp trung bình khi tìm kiếm trên cây nhị phân tìm kiếm cân bằng là?',
        options: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'],
        correctIndexes: [2],
      },
      {
        questionText: 'Những cấu trúc dữ liệu nào sau đây là cấu trúc tuyến tính? (chọn nhiều đáp án)',
        options: ['Mảng', 'Cây nhị phân', 'Danh sách liên kết', 'Đồ thị'],
        correctIndexes: [0, 2],
      },
    ],
  },
  {
    title: 'Kiểm tra nhanh về Cơ sở dữ liệu',
    courseCode: 'DBI202',
    creatorEmail: 'baolq@fe.edu.vn',
    questions: [
      {
        questionText: 'Khóa ngoại được dùng để làm gì?',
        options: ['Xác định duy nhất một bản ghi', 'Thiết lập quan hệ giữa các bảng', 'Tăng tốc độ truy vấn', 'Mã hóa dữ liệu'],
        correctIndexes: [1],
      },
      {
        questionText: 'Dạng chuẩn thứ ba (3NF) loại bỏ điều gì?',
        options: ['Nhóm lặp lại', 'Phụ thuộc một phần', 'Phụ thuộc bắc cầu', 'Khóa chính'],
        correctIndexes: [2],
      },
      {
        questionText: 'Những phát biểu nào đúng về khóa chính? (chọn nhiều đáp án)',
        options: [
          'Xác định duy nhất mỗi bản ghi',
          'Có thể chứa giá trị NULL',
          'Một bảng chỉ có một khóa chính',
          'Bắt buộc phải là kiểu số',
        ],
        correctIndexes: [0, 2],
      },
    ],
  },
];

const enrollmentTemplates = [
  { studentEmail: 'thuannmhe161234@fpt.edu.vn', courseCodes: ['CSD201', 'DBI202', 'PRJ301'] },
  { studentEmail: 'baotghe162001@fpt.edu.vn', courseCodes: ['CSD201', 'PRJ301'] },
  { studentEmail: 'nguyenltse160877@fpt.edu.vn', courseCodes: ['AIL303m', 'CSD201'] },
  { studentEmail: 'anhpdhe163344@fpt.edu.vn', courseCodes: ['IAO202', 'DBI202'] },
  { studentEmail: 'nganhtkse161122@fpt.edu.vn', courseCodes: ['GDE101'] },
  { studentEmail: 'huydqhe162788@fpt.edu.vn', courseCodes: ['PRO192', 'CSD201'] },
  { studentEmail: 'linhbpse160455@fpt.edu.vn', courseCodes: ['GDE101'] },
  { studentEmail: 'phatnthe164900@fpt.edu.vn', courseCodes: ['AIL303m', 'DBI202'] },
  { studentEmail: 'yenvhse161600@fpt.edu.vn', courseCodes: ['CSD201', 'PRJ301'] },
  { studentEmail: 'khanhtvhe162355@fpt.edu.vn', courseCodes: ['IAO202'] },
  { studentEmail: 'hanlgse160199@fpt.edu.vn', courseCodes: ['DBI202'] },
  { studentEmail: 'namcnhe163011@fpt.edu.vn', courseCodes: ['CSD201', 'PRO192'] },
];

const lessonTemplates = [
  {
    courseCode: 'CSD201',
    order: 1,
    title: 'Tổng quan cấu trúc dữ liệu và độ phức tạp',
    content:
      'Bài học giới thiệu khái niệm cấu trúc dữ liệu, vai trò của việc lựa chọn cấu trúc phù hợp và cách phân tích độ phức tạp thời gian bằng ký hiệu Big-O. Sinh viên đọc tài liệu đính kèm và hoàn thành bài trắc nghiệm ôn tập.',
    materialTitles: ['Chương 1 - Tổng quan cấu trúc dữ liệu'],
    quizTitle: 'Ôn tập Cấu trúc dữ liệu - Chương 1',
  },
  {
    courseCode: 'CSD201',
    order: 2,
    title: 'Ngăn xếp và hàng đợi',
    content:
      'Tìm hiểu nguyên lý hoạt động LIFO của ngăn xếp và FIFO của hàng đợi, các phép toán cơ bản push, pop, enqueue, dequeue cùng những ứng dụng thực tế như quản lý lời gọi hàm và xử lý tác vụ.',
  },
  {
    courseCode: 'CSD201',
    order: 3,
    title: 'Cây nhị phân tìm kiếm',
    content:
      'Cấu trúc cây nhị phân tìm kiếm, các phép duyệt cây theo thứ tự trước, giữa và sau, cùng phân tích độ phức tạp của thao tác tìm kiếm, chèn và xóa trên cây cân bằng.',
  },
  {
    courseCode: 'DBI202',
    order: 1,
    title: 'Mô hình quan hệ và các loại khóa',
    content:
      'Giới thiệu mô hình dữ liệu quan hệ, khái niệm bảng, bản ghi, thuộc tính cùng vai trò của khóa chính và khóa ngoại trong việc thiết lập ràng buộc toàn vẹn giữa các bảng.',
    materialTitles: ['Chương 2 - Mô hình quan hệ và chuẩn hóa'],
    quizTitle: 'Kiểm tra nhanh về Cơ sở dữ liệu',
  },
  {
    courseCode: 'DBI202',
    order: 2,
    title: 'Chuẩn hóa cơ sở dữ liệu',
    content:
      'Quy trình chuẩn hóa dữ liệu qua các dạng chuẩn 1NF, 2NF và 3NF nhằm loại bỏ dư thừa dữ liệu và tránh các bất thường khi thêm, sửa, xóa bản ghi.',
  },
  {
    courseCode: 'AIL303m',
    order: 1,
    title: 'Giới thiệu học máy',
    content:
      'Tổng quan về học máy, phân biệt học có giám sát và học không giám sát, quy trình xây dựng một mô hình từ thu thập dữ liệu đến đánh giá kết quả.',
    materialTitles: ['Chương 1 - Giới thiệu học máy'],
  },
  {
    courseCode: 'AIL303m',
    order: 2,
    title: 'Hồi quy tuyến tính',
    content:
      'Mô hình hồi quy tuyến tính đơn biến và đa biến, hàm mất mát bình phương trung bình và thuật toán hạ gradient để tối ưu tham số mô hình.',
  },
];

const lessonProgressTemplates = [
  { studentEmail: 'thuannmhe161234@fpt.edu.vn', courseCode: 'CSD201', completedOrders: [1, 2] },
  { studentEmail: 'thuannmhe161234@fpt.edu.vn', courseCode: 'DBI202', completedOrders: [1] },
  { studentEmail: 'yenvhse161600@fpt.edu.vn', courseCode: 'CSD201', completedOrders: [1, 2, 3] },
  { studentEmail: 'namcnhe163011@fpt.edu.vn', courseCode: 'CSD201', completedOrders: [1, 2, 3] },
  { studentEmail: 'nguyenltse160877@fpt.edu.vn', courseCode: 'AIL303m', completedOrders: [1, 2] },
  { studentEmail: 'phatnthe164900@fpt.edu.vn', courseCode: 'AIL303m', completedOrders: [1] },
  { studentEmail: 'anhpdhe163344@fpt.edu.vn', courseCode: 'DBI202', completedOrders: [1] },
];

const assignmentTemplates = [
  {
    courseCode: 'CSD201',
    title: 'Bài tập tuần 3: Cài đặt ngăn xếp và hàng đợi',
    description:
      'Cài đặt ngăn xếp và hàng đợi bằng danh sách liên kết, kèm chương trình kiểm thử các phép toán cơ bản. Nộp mã nguồn kèm báo cáo ngắn mô tả thiết kế.',
    dueDate: '2026-07-10T16:59:00.000Z',
    maxScore: 10,
  },
  {
    courseCode: 'CSD201',
    title: 'Bài tập lớn: Xây dựng cây nhị phân tìm kiếm',
    description:
      'Xây dựng cây nhị phân tìm kiếm hỗ trợ chèn, xóa, tìm kiếm và ba phép duyệt cây. So sánh hiệu năng với tìm kiếm tuyến tính trên cùng bộ dữ liệu.',
    dueDate: '2026-07-20T16:59:00.000Z',
    maxScore: 10,
  },
  {
    courseCode: 'DBI202',
    title: 'Thiết kế CSDL quản lý thư viện',
    description:
      'Thiết kế lược đồ cơ sở dữ liệu cho hệ thống quản lý thư viện: vẽ sơ đồ thực thể liên kết, chuẩn hóa tới 3NF và viết các câu truy vấn SQL minh họa.',
    dueDate: '2026-07-25T16:59:00.000Z',
    maxScore: 10,
  },
  {
    courseCode: 'AIL303m',
    title: 'Phân tích dữ liệu với hồi quy tuyến tính',
    description:
      'Sử dụng bộ dữ liệu giá nhà được cung cấp để huấn luyện mô hình hồi quy tuyến tính, đánh giá bằng RMSE và viết báo cáo nhận xét kết quả.',
    dueDate: '2026-07-30T16:59:00.000Z',
    maxScore: 10,
  },
];

const submissionTemplates = [
  {
    assignmentTitle: 'Bài tập tuần 3: Cài đặt ngăn xếp và hàng đợi',
    studentEmail: 'thuannmhe161234@fpt.edu.vn',
    content: 'Em nộp bài cài đặt ngăn xếp và hàng đợi bằng danh sách liên kết đơn, kèm chương trình kiểm thử trong hàm main.',
    score: 8.5,
    feedback: 'Cài đặt đúng và rõ ràng. Cần bổ sung xử lý trường hợp hàng đợi rỗng khi dequeue.',
  },
  {
    assignmentTitle: 'Bài tập tuần 3: Cài đặt ngăn xếp và hàng đợi',
    studentEmail: 'yenvhse161600@fpt.edu.vn',
    content: 'Bài làm gồm hai lớp Stack và Queue dùng generic, có kiểm thử bằng JUnit.',
    score: 9.5,
    feedback: 'Bài làm rất tốt, có kiểm thử đầy đủ.',
  },
  {
    assignmentTitle: 'Bài tập tuần 3: Cài đặt ngăn xếp và hàng đợi',
    studentEmail: 'namcnhe163011@fpt.edu.vn',
    content: 'Em cài đặt thêm phiên bản dùng mảng động để so sánh hiệu năng với danh sách liên kết.',
    score: 10,
    feedback: 'Xuất sắc, phần so sánh hiệu năng vượt yêu cầu.',
  },
  {
    assignmentTitle: 'Bài tập tuần 3: Cài đặt ngăn xếp và hàng đợi',
    studentEmail: 'baotghe162001@fpt.edu.vn',
    content: 'Em nộp bài cài đặt bằng Java, phần báo cáo ở cuối tệp.',
  },
  {
    assignmentTitle: 'Thiết kế CSDL quản lý thư viện',
    studentEmail: 'anhpdhe163344@fpt.edu.vn',
    content: 'Sơ đồ thực thể liên kết gồm 6 bảng đã chuẩn hóa 3NF, kèm 10 câu truy vấn SQL minh họa.',
    score: 7,
    feedback: 'Lược đồ hợp lý nhưng thiếu ràng buộc về số lượng sách mượn tối đa.',
  },
  {
    assignmentTitle: 'Thiết kế CSDL quản lý thư viện',
    studentEmail: 'hanlgse160199@fpt.edu.vn',
    content: 'Em nộp bản thiết kế kèm phân tích nghiệp vụ mượn trả sách.',
  },
  {
    assignmentTitle: 'Phân tích dữ liệu với hồi quy tuyến tính',
    studentEmail: 'nguyenltse160877@fpt.edu.vn',
    content: 'Notebook gồm bước tiền xử lý, huấn luyện mô hình và đánh giá RMSE trên tập kiểm định.',
    score: 9.5,
    feedback: 'Phân tích kỹ lưỡng, trực quan hóa dữ liệu đẹp và dễ hiểu.',
  },
];

const commentTemplates = [
  {
    postTitle: 'AI Hackathon 2026 - Giải pháp cho Y tế Việt Nam',
    authorEmail: 'thuannmhe161234@fpt.edu.vn',
    content: 'Nhóm HealthMate của mình đang tìm thêm thành viên Machine Learning cho cuộc thi này, bạn nào quan tâm liên hệ nhé!',
  },
  {
    postTitle: 'AI Hackathon 2026 - Giải pháp cho Y tế Việt Nam',
    authorEmail: 'nguyenltse160877@fpt.edu.vn',
    content: 'Chủ đề y tế rất hay, cho mình hỏi mỗi đội tối đa bao nhiêu thành viên vậy ạ?',
  },
  {
    postTitle: 'AI Hackathon 2026 - Giải pháp cho Y tế Việt Nam',
    authorEmail: 'tuanva.clb@fpt.edu.vn',
    content: 'Mỗi đội từ 3 đến 5 thành viên nhé, hạn đăng ký là 01/08.',
  },
  {
    postTitle: 'Workshop: Thiết kế hệ thống chịu tải cao',
    authorEmail: 'namcnhe163011@fpt.edu.vn',
    content: 'Workshop này có phát tài liệu sau buổi chia sẻ không ạ?',
  },
  {
    postTitle: 'Mở đăng ký học kỳ Fall 2026',
    authorEmail: 'huydqhe162788@fpt.edu.vn',
    content: 'Cho em hỏi lớp PRO192 còn slot không ạ?',
  },
];

const teamMessageTemplates = [
  {
    teamName: 'HealthMate - Trợ lý sức khỏe',
    senderEmail: 'thuannmhe161234@fpt.edu.vn',
    content: 'Chào cả nhóm, tuần này mình hoàn thiện wireframe màn hình nhắc uống thuốc nhé.',
  },
  {
    teamName: 'HealthMate - Trợ lý sức khỏe',
    senderEmail: 'yenvhse161600@fpt.edu.vn',
    content: 'Ok bạn, mình sẽ dựng trước phần API danh sách thuốc, tối nay đẩy lên repo.',
  },
  {
    teamName: 'HealthMate - Trợ lý sức khỏe',
    senderEmail: 'thuannmhe161234@fpt.edu.vn',
    content: 'Tuyệt vời, cuối tuần họp nhóm chốt tính năng cho bản demo nha.',
  },
  {
    teamName: 'PayFlow - Ví điện tử sinh viên',
    senderEmail: 'baotghe162001@fpt.edu.vn',
    content: 'Mình vừa cập nhật tài liệu phân tích nghiệp vụ chia tiền nhóm, mọi người xem trong không gian làm việc nhé.',
  },
  {
    teamName: 'PayFlow - Ví điện tử sinh viên',
    senderEmail: 'hanlgse160199@fpt.edu.vn',
    content: 'Đã xem, phần luồng hoàn tiền mình sẽ bổ sung thêm sơ đồ trước thứ Sáu.',
  },
];

const quizAttemptTemplates = [
  { quizTitle: 'Ôn tập Cấu trúc dữ liệu - Chương 1', studentEmail: 'thuannmhe161234@fpt.edu.vn', wrongQuestionIndexes: [3] },
  { quizTitle: 'Ôn tập Cấu trúc dữ liệu - Chương 1', studentEmail: 'yenvhse161600@fpt.edu.vn', wrongQuestionIndexes: [] },
  { quizTitle: 'Ôn tập Cấu trúc dữ liệu - Chương 1', studentEmail: 'namcnhe163011@fpt.edu.vn', wrongQuestionIndexes: [] },
  { quizTitle: 'Ôn tập Cấu trúc dữ liệu - Chương 1', studentEmail: 'huydqhe162788@fpt.edu.vn', wrongQuestionIndexes: [1, 3] },
  { quizTitle: 'Kiểm tra nhanh về Cơ sở dữ liệu', studentEmail: 'thuannmhe161234@fpt.edu.vn', wrongQuestionIndexes: [2] },
  { quizTitle: 'Kiểm tra nhanh về Cơ sở dữ liệu', studentEmail: 'anhpdhe163344@fpt.edu.vn', wrongQuestionIndexes: [] },
  { quizTitle: 'Kiểm tra nhanh về Cơ sở dữ liệu', studentEmail: 'phatnthe164900@fpt.edu.vn', wrongQuestionIndexes: [1] },
];

module.exports = {
  DEFAULT_PASSWORD,
  admins,
  lecturers,
  clubLeaders,
  students,
  courses,
  materialTemplates,
  teamTemplates,
  joinRequestTemplates,
  announcementTemplates,
  postTemplates,
  quizTemplates,
  enrollmentTemplates,
  lessonTemplates,
  lessonProgressTemplates,
  assignmentTemplates,
  submissionTemplates,
  commentTemplates,
  teamMessageTemplates,
  quizAttemptTemplates,
};
