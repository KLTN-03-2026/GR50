-- MEDISCHED AI - FULL DATABASE SCHEMA (31 TABLES)
-- Optimized and Consolidated

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Identity & RBAC (6 tables)
CREATE TABLE IF NOT EXISTS `nguoidung` (
  `Id_NguoiDung` int(11) NOT NULL AUTO_INCREMENT,
  `Ho` varchar(50) DEFAULT NULL,
  `Ten` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `MatKhau` varchar(255) DEFAULT NULL,
  `GioiTinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `NgaySinh` date DEFAULT NULL,
  `AnhDaiDien` text DEFAULT NULL,
  `TrangThai` enum('HoatDong','Khoa') DEFAULT 'HoatDong',
  `YeuCauDoiMatKhau` tinyint(1) DEFAULT '0',
  `RefreshToken` text DEFAULT NULL,
  `NgayTao` datetime DEFAULT NULL,
  `NgayCapNhat` datetime DEFAULT NULL,
  `NgayXoa` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_NguoiDung`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vaitro` (
  `Id_VaiTro` int(11) NOT NULL AUTO_INCREMENT,
  `TenVaiTro` varchar(50) DEFAULT NULL,
  `MaVaiTro` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`Id_VaiTro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `nguoidung_vaitro` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_NguoiDung` int(11) DEFAULT NULL,
  `Id_VaiTro` int(11) DEFAULT NULL,
  `NgayGan` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  FOREIGN KEY (`Id_NguoiDung`) REFERENCES `nguoidung` (`Id_NguoiDung`) ON DELETE CASCADE,
  FOREIGN KEY (`Id_VaiTro`) REFERENCES `vaitro` (`Id_VaiTro`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `authtokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_NguoiDung` int(11) DEFAULT NULL,
  `Type` enum('PASSWORD_RESET_OTP','PASSWORD_RESET_TOKEN','EMAIL_VERIFICATION') NOT NULL,
  `Token` varchar(255) NOT NULL,
  `Contact` varchar(100) DEFAULT NULL,
  `ExpiresAt` datetime NOT NULL,
  `IsUsed` tinyint(1) DEFAULT '0',
  `AttemptCount` int(11) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`Id_NguoiDung`) REFERENCES `nguoidung` (`Id_NguoiDung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `StaffProfile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `position_title` varchar(100) DEFAULT NULL,
  `note` text,
  `status` enum('active','inactive','pending') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  FOREIGN KEY (`user_id`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `thongbao` (
  `Id_ThongBao` int(11) NOT NULL AUTO_INCREMENT,
  `Id_NguoiDung` int(11) DEFAULT NULL,
  `TieuDe` varchar(255) DEFAULT NULL,
  `NoiDung` text,
  `Loai` varchar(50) DEFAULT NULL,
  `DaDoc` tinyint(1) DEFAULT '0',
  `NgayTao` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_ThongBao`),
  FOREIGN KEY (`Id_NguoiDung`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. Clinical Roles (3 tables)
CREATE TABLE IF NOT EXISTS `chuyenkhoa` (
  `Id_ChuyenKhoa` int(11) NOT NULL AUTO_INCREMENT,
  `TenChuyenKhoa` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `AnhChuyenKhoa` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_ChuyenKhoa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bacsi` (
  `Id_BacSi` int(11) NOT NULL AUTO_INCREMENT,
  `Id_NguoiDung` int(11) DEFAULT NULL,
  `Id_ChuyenKhoa` int(11) DEFAULT NULL,
  `SoChungChiHanhNghe` varchar(100) DEFAULT NULL,
  `SoNamKinhNghiem` int(11) DEFAULT NULL,
  `PhiTuVan` decimal(12,2) DEFAULT '0.00',
  `GioiThieu` text DEFAULT NULL,
  `TrangThai` enum('HoatDong','NgungHoatDong') DEFAULT 'HoatDong',
  `NgayTao` datetime DEFAULT NULL,
  `NgayCapNhat` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_BacSi`),
  FOREIGN KEY (`Id_NguoiDung`) REFERENCES `nguoidung` (`Id_NguoiDung`),
  FOREIGN KEY (`Id_ChuyenKhoa`) REFERENCES `chuyenkhoa` (`Id_ChuyenKhoa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `benhnhan` (
  `Id_BenhNhan` int(11) NOT NULL AUTO_INCREMENT,
  `Id_NguoiDung` int(11) DEFAULT NULL,
  `MaBenhNhan` varchar(30) DEFAULT NULL,
  `NhomMau` varchar(5) DEFAULT NULL,
  `TienSuBenh` text DEFAULT NULL,
  `NgayTao` datetime DEFAULT NULL,
  `NgayCapNhat` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_BenhNhan`),
  FOREIGN KEY (`Id_NguoiDung`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. Facilities & Assignments (5 tables)
CREATE TABLE IF NOT EXISTS `PhongKham` (
  `Id_PhongKham` int(11) NOT NULL AUTO_INCREMENT,
  `TenPhongKham` varchar(255) NOT NULL,
  `DiaChi` text,
  `SoDienThoai` varchar(20) DEFAULT NULL,
  `ToaDo_Lat` decimal(10,8) DEFAULT NULL,
  `ToaDo_Lng` decimal(10,8) DEFAULT NULL,
  `TrangThai` enum('HoatDong','NgungHoatDong','BaoTri') DEFAULT 'HoatDong',
  PRIMARY KEY (`Id_PhongKham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bacsi_phongkham` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` int(11) DEFAULT NULL,
  `facility_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `bacsi` (`Id_BacSi`),
  FOREIGN KEY (`facility_id`) REFERENCES `PhongKham` (`Id_PhongKham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `nguoidung_phongkham` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) DEFAULT NULL,
  `facility_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_manager` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`staff_id`) REFERENCES `nguoidung` (`Id_NguoiDung`),
  FOREIGN KEY (`facility_id`) REFERENCES `PhongKham` (`Id_PhongKham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Staff_Facility` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) DEFAULT NULL,
  `facility_id` int(11) DEFAULT NULL,
  `can_reception` tinyint(1) DEFAULT '0',
  `can_payment` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`staff_id`) REFERENCES `StaffProfile` (`id`),
  FOREIGN KEY (`facility_id`) REFERENCES `PhongKham` (`Id_PhongKham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4. Scheduling & Clinical (4 tables)
CREATE TABLE IF NOT EXISTS `lichkham` (
  `Id_LichKham` int(11) NOT NULL AUTO_INCREMENT,
  `Id_BacSi` int(11) DEFAULT NULL,
  `Id_PhongKham` int(11) DEFAULT NULL,
  `NgayDate` date DEFAULT NULL,
  `GioBatDau` time DEFAULT NULL,
  `GioKetThuc` time DEFAULT NULL,
  `LoaiKham` enum('TrucTiep','Online') DEFAULT 'TrucTiep',
  `SoLuongToiDa` int(11) DEFAULT NULL,
  `SoLuongDaDat` int(11) DEFAULT '0',
  PRIMARY KEY (`Id_LichKham`),
  FOREIGN KEY (`Id_BacSi`) REFERENCES `bacsi` (`Id_BacSi`),
  FOREIGN KEY (`Id_PhongKham`) REFERENCES `PhongKham` (`Id_PhongKham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `datlich` (
  `Id_DatLich` int(11) NOT NULL AUTO_INCREMENT,
  `MaDatLich` varchar(30) DEFAULT NULL,
  `Id_BenhNhan` int(11) DEFAULT NULL,
  `Id_LichKham` int(11) DEFAULT NULL,
  `Id_PhongKham` int(11) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'PENDING',
  `GiaTien` decimal(12,2) DEFAULT NULL,
  `TrieuChungSoBo` text,
  `LinkPhongHop` text,
  `LinkGhiAm` text,
  `RoomStatus` enum('WAITING','ACTIVE','FINISHED') DEFAULT 'WAITING',
  `NgayTao` datetime DEFAULT NULL,
  `NgayCapNhat` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_DatLich`),
  FOREIGN KEY (`Id_BenhNhan`) REFERENCES `benhnhan` (`Id_BenhNhan`),
  FOREIGN KEY (`Id_LichKham`) REFERENCES `lichkham` (`Id_LichKham`),
  FOREIGN KEY (`Id_PhongKham`) REFERENCES `PhongKham` (`Id_PhongKham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `hosobenhan` (
  `Id_HoSo` int(11) NOT NULL AUTO_INCREMENT,
  `Id_DatLich` int(11) DEFAULT NULL,
  `Id_BenhNhan` int(11) DEFAULT NULL,
  `Id_BacSi` int(11) DEFAULT NULL,
  `ChanDoan` text,
  `LoiDan` text,
  `NgayTao` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_HoSo`),
  FOREIGN KEY (`Id_DatLich`) REFERENCES `datlich` (`Id_DatLich`),
  FOREIGN KEY (`Id_BenhNhan`) REFERENCES `benhnhan` (`Id_BenhNhan`),
  FOREIGN KEY (`Id_BacSi`) REFERENCES `bacsi` (`Id_BacSi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `danhgia` (
  `Id_DanhGia` int(11) NOT NULL AUTO_INCREMENT,
  `Id_BacSi` int(11) DEFAULT NULL,
  `Id_BenhNhan` int(11) DEFAULT NULL,
  `Id_DatLich` int(11) DEFAULT NULL,
  `SoSao` int(11) DEFAULT NULL,
  `BinhLuan` text,
  `NgayTao` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_DanhGia`),
  FOREIGN KEY (`Id_BacSi`) REFERENCES `bacsi` (`Id_BacSi`),
  FOREIGN KEY (`Id_BenhNhan`) REFERENCES `benhnhan` (`Id_BenhNhan`),
  FOREIGN KEY (`Id_DatLich`) REFERENCES `datlich` (`Id_DatLich`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5. Prescriptions (2 tables)
CREATE TABLE IF NOT EXISTS `donthuoc` (
  `Id_DonThuoc` int(11) NOT NULL AUTO_INCREMENT,
  `Id_HoSo` int(11) DEFAULT NULL,
  `NgayKe` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_DonThuoc`),
  FOREIGN KEY (`Id_HoSo`) REFERENCES `hosobenhan` (`Id_HoSo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chitietdonthuoc` (
  `Id_ChiTiet` int(11) NOT NULL AUTO_INCREMENT,
  `Id_DonThuoc` int(11) DEFAULT NULL,
  `TenThuoc` varchar(255) DEFAULT NULL,
  `SoLuong` int(11) DEFAULT NULL,
  `LieuDung` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_ChiTiet`),
  FOREIGN KEY (`Id_DonThuoc`) REFERENCES `donthuoc` (`Id_DonThuoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6. Financial (2 tables)
CREATE TABLE IF NOT EXISTS `hoadon` (
  `Id_HoaDon` int(11) NOT NULL AUTO_INCREMENT,
  `Id_DatLich` int(11) DEFAULT NULL,
  `TongTien` decimal(12,2) DEFAULT '0.00',
  `TrangThai` enum('ISSUED','PAID','CANCELLED') DEFAULT 'ISSUED',
  `NgayTao` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_HoaDon`),
  FOREIGN KEY (`Id_DatLich`) REFERENCES `datlich` (`Id_DatLich`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `thanhtoan` (
  `Id_ThanhToan` int(11) NOT NULL AUTO_INCREMENT,
  `Id_HoaDon` int(11) DEFAULT NULL,
  `MaGiaoDich` varchar(100) DEFAULT NULL,
  `PhuongThuc` enum('VNPay','Momo','TienMat') DEFAULT NULL,
  `SoTien` decimal(12,2) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT NULL,
  `NgayTao` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_ThanhToan`),
  FOREIGN KEY (`Id_HoaDon`) REFERENCES `hoadon` (`Id_HoaDon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 7. Messaging & Telemedicine (6 tables)
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` enum('direct','group','support','appointment') DEFAULT 'direct',
  `appointment_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `datlich` (`Id_DatLich`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `conversation_participants` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `content` text,
  `type` enum('text','image','file','system') DEFAULT 'text',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  FOREIGN KEY (`sender_id`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `message_attachments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `message_id` bigint(20) DEFAULT NULL,
  `file_url` text,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `call_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `call_participants` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `call_session_id` bigint(20) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`call_session_id`) REFERENCES `call_sessions` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 8. AI & Support (3 tables)
CREATE TABLE IF NOT EXISTS `aituanphien` (
  `Id_AITuVanPhien` int(11) NOT NULL AUTO_INCREMENT,
  `Id_NguoiDung` int(11) DEFAULT NULL,
  `TrieuChungTomTat` text,
  `GoiYChuyenKhoa` varchar(255) DEFAULT NULL,
  `MucDoUuTien` varchar(50) DEFAULT NULL,
  `NgayTao` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_AITuVanPhien`),
  FOREIGN KEY (`Id_NguoiDung`) REFERENCES `nguoidung` (`Id_NguoiDung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `aituantinnhan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_AITuVanPhien` int(11) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `content` text,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`Id_AITuVanPhien`) REFERENCES `aituanphien` (`Id_AITuVanPhien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `support_cases` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `benhnhan` (`Id_BenhNhan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
