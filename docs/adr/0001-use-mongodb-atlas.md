# Sử dụng MongoDB Atlas (SDN302) làm cơ sở dữ liệu chính

Dự án quyết định kết nối trực tiếp tới cụm MongoDB Atlas `cluster0.fybfxpn.mongodb.net` (database `sdnproject`) thay vì yêu cầu chạy dịch vụ mongod cục bộ trên máy trạm của từng thành viên, giúp đồng bộ hóa dữ liệu kiểm thử trực tiếp qua MongoDB Compass và giảm thiểu sự cố môi trường khi làm việc nhóm.

