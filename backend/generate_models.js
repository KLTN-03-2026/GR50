const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');

const models = {
    'VaiTro.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VaiTro = sequelize.define('VaiTro', {
    Id_VaiTro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaVaiTro: { type: DataTypes.STRING(30), allowNull: false },
    TenVaiTro: { type: DataTypes.STRING(100), allowNull: false },
    MoTa: { type: DataTypes.STRING(255) }
}, { tableName: 'vaitro', timestamps: true, createdAt: 'NgayTao', updatedAt: false });

module.exports = VaiTro;`,

    'NguoiDung.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NguoiDung = sequelize.define('NguoiDung', {
    Id_NguoiDung: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Ho: { type: DataTypes.STRING(50) },
    Ten: { type: DataTypes.STRING(50) },
    Email: { type: DataTypes.STRING(100), unique: true },
    SoDienThoai: { type: DataTypes.STRING(20) },
    MatKhau: { type: DataTypes.STRING(255) },
    GioiTinh: { type: DataTypes.ENUM('Nam', 'Nu', 'Khac') },
    NgaySinh: { type: DataTypes.DATEONLY },
    AnhDaiDien: { type: DataTypes.TEXT },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'Khoa') },
    RefreshToken: { type: DataTypes.TEXT }
}, { tableName: 'nguoidung', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat', deletedAt: 'NgayXoa', paranoid: true });

module.exports = NguoiDung;`,

    'NguoiDung_VaiTro.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NguoiDung_VaiTro = sequelize.define('NguoiDung_VaiTro', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_VaiTro: { type: DataTypes.INTEGER, references: { model: 'vaitro', key: 'Id_VaiTro' } }
}, { tableName: 'nguoidung_vaitro', timestamps: true, createdAt: 'NgayGan', updatedAt: false });

module.exports = NguoiDung_VaiTro;`,

    'BenhNhan.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BenhNhan = sequelize.define('BenhNhan', {
    Id_BenhNhan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    MaBenhNhan: { type: DataTypes.STRING(30) },
    NhomMau: { type: DataTypes.STRING(5) },
    TienSuBenh: { type: DataTypes.TEXT },
    NguoiLienHe: { type: DataTypes.STRING(100) },
    SoDienThoaiLienHe: { type: DataTypes.STRING(20) }
}, { tableName: 'benhnhan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = BenhNhan;`,

    'ChuyenKhoa.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChuyenKhoa = sequelize.define('ChuyenKhoa', {
    Id_ChuyenKhoa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenChuyenKhoa: { type: DataTypes.STRING(100) },
    MoTa: { type: DataTypes.TEXT },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong') }
}, { tableName: 'chuyenkhoa', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat', deletedAt: 'NgayXoa', paranoid: true });

module.exports = ChuyenKhoa;`,

    'BacSi.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BacSi = sequelize.define('BacSi', {
    Id_BacSi: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_ChuyenKhoa: { type: DataTypes.INTEGER, references: { model: 'chuyenkhoa', key: 'Id_ChuyenKhoa' } },
    SoChungChiHanhNghe: { type: DataTypes.STRING(100) },
    SoNamKinhNghiem: { type: DataTypes.INTEGER },
    PhiTuVan: { type: DataTypes.DECIMAL(12, 2) },
    GioiThieu: { type: DataTypes.TEXT },
    HocHamHocVi: { type: DataTypes.STRING(150) },
    NoiLamViec: { type: DataTypes.STRING(255) },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong') }
}, { tableName: 'bacsi', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat', deletedAt: 'NgayXoa', paranoid: true });

module.exports = BacSi;`,

    'LichKham.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LichKham = sequelize.define('LichKham', {
    Id_LichKham: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    NgayDate: { type: DataTypes.DATEONLY },
    GioBatDau: { type: DataTypes.TIME },
    GioKetThuc: { type: DataTypes.TIME },
    LoaiKham: { type: DataTypes.ENUM('TrucTiep', 'Online') },
    SoLuongToiDa: { type: DataTypes.INTEGER },
    SoLuongDaDat: { type: DataTypes.INTEGER, defaultValue: 0 },
    TrangThai: { type: DataTypes.ENUM('KhaDung', 'DaDay', 'Huy') }
}, { tableName: 'lichkham', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = LichKham;`,

    'DatLich.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DatLich = sequelize.define('DatLich', {
    Id_DatLich: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaDatLich: { type: DataTypes.STRING(30) },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_LichKham: { type: DataTypes.INTEGER, references: { model: 'lichkham', key: 'Id_LichKham' } },
    TrangThai: { type: DataTypes.ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'Huy') },
    TrieuChungSoBo: { type: DataTypes.TEXT },
    GhiChu: { type: DataTypes.TEXT },
    LyDoHuy: { type: DataTypes.TEXT },
    DaGuiNhac: { type: DataTypes.TINYINT },
    GiaTien: { type: DataTypes.DECIMAL(12, 2) },
    ThoiDiemDat: { type: DataTypes.DATE }
}, { tableName: 'datlich', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = DatLich;`,

    'HoSoBenhAn.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoSoBenhAn = sequelize.define('HoSoBenhAn', {
    Id_HoSo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    TrieuChungChuQuan: { type: DataTypes.TEXT },
    KhamLamSang: { type: DataTypes.TEXT },
    DanhGia: { type: DataTypes.TEXT },
    KeHoachDieuTri: { type: DataTypes.TEXT },
    ChanDoan: { type: DataTypes.TEXT },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'hosobenhan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = HoSoBenhAn;`,

    'DonThuoc.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonThuoc = sequelize.define('DonThuoc', {
    Id_DonThuoc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_HoSo: { type: DataTypes.INTEGER, references: { model: 'hosobenhan', key: 'Id_HoSo' } },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'donthuoc', timestamps: true, createdAt: 'NgayKe', updatedAt: false });

module.exports = DonThuoc;`,

    'ChiTietDonThuoc.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChiTietDonThuoc = sequelize.define('ChiTietDonThuoc', {
    Id_ChiTietDonThuoc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DonThuoc: { type: DataTypes.INTEGER, references: { model: 'donthuoc', key: 'Id_DonThuoc' } },
    TenThuoc: { type: DataTypes.STRING(255) },
    DonVi: { type: DataTypes.STRING(50) },
    SoLuong: { type: DataTypes.INTEGER },
    LieuDung: { type: DataTypes.STRING(255) },
    CachDung: { type: DataTypes.TEXT }
}, { tableName: 'chitietdonthuoc', timestamps: false });

module.exports = ChiTietDonThuoc;`,

    'ThanhToan.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThanhToan = sequelize.define('ThanhToan', {
    Id_ThanhToan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    MaDonHang: { type: DataTypes.STRING(100) },
    MaGiaoDich: { type: DataTypes.STRING(100) },
    SoTien: { type: DataTypes.DECIMAL(12, 2) },
    PhuongThuc: { type: DataTypes.ENUM('VNPay', 'Momo', 'TienMat') },
    TrangThai: { type: DataTypes.ENUM('ChoThanhToan', 'ThanhCong', 'ThatBai') },
    MoTa: { type: DataTypes.TEXT }
}, { tableName: 'thanhtoan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = ThanhToan;`,

    'KhamOnline.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KhamOnline = sequelize.define('KhamOnline', {
    Id_KhamOnline: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    LoaiTuVan: { type: DataTypes.ENUM('Video', 'Chat') },
    TrangThai: { type: DataTypes.ENUM('ChoKham', 'DangKham', 'HoanThanh') },
    LinkPhongHop: { type: DataTypes.TEXT },
    LinkGhiAm: { type: DataTypes.TEXT },
    ThoiGianBatDau: { type: DataTypes.DATE },
    ThoiGianKetThuc: { type: DataTypes.DATE }
}, { tableName: 'khamonline', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = KhamOnline;`,

    'TinNhanKham.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TinNhanKham = sequelize.define('TinNhanKham', {
    Id_TinNhan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_KhamOnline: { type: DataTypes.INTEGER, references: { model: 'khamonline', key: 'Id_KhamOnline' } },
    Id_NguoiGui: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    LoaiTinNhan: { type: DataTypes.ENUM('Text', 'File', 'Image') },
    NoiDung: { type: DataTypes.TEXT },
    TapDinhKem: { type: DataTypes.TEXT },
    DaDoc: { type: DataTypes.TINYINT }
}, { tableName: 'tinnhankham', timestamps: true, createdAt: 'ThoiGianGui', updatedAt: false });

module.exports = TinNhanKham;`,

    'NoiDungChoDuyet.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoiDungChoDuyet = sequelize.define('NoiDungChoDuyet', {
    Id_NoiDungChoDuyet: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    CauHoiNguoiDung: { type: DataTypes.TEXT },
    PhanHoiAI: { type: DataTypes.TEXT },
    TuKhoaPhatHien: { type: DataTypes.STRING(255) },
    TrangThai: { type: DataTypes.ENUM('ChoDuyet', 'DaDuyet', 'TuChoi') },
    Id_QuanTriVien: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } }
}, { tableName: 'noidungchoduyet', timestamps: true, updatedAt: 'NgayDuyet', createdAt: false });

module.exports = NoiDungChoDuyet;`,

    'NoiDungDaDuyet.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoiDungDaDuyet = sequelize.define('NoiDungDaDuyet', {
    Id_NoiDungDaDuyet: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    NoiDung: { type: DataTypes.TEXT },
    TuKhoa: { type: DataTypes.STRING(100) },
    DanhMuc: { type: DataTypes.STRING(100) },
    PhanHoi: { type: DataTypes.TEXT },
    NguoiDuyet: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_NguonChoDuyet: { type: DataTypes.INTEGER, references: { model: 'noidungchoduyet', key: 'Id_NoiDungChoDuyet' } }
}, { tableName: 'noidungdaduyet', timestamps: true, updatedAt: 'NgayDuyet', createdAt: false });

module.exports = NoiDungDaDuyet;`
};

for (const [filename, content] of Object.entries(models)) {
    fs.writeFileSync(path.join(modelsDir, filename), content.replace(/VARCHAR/g, 'STRING').replace(/DATETIME/g, 'DATE'));
}

console.log('All 16 models generated successfully!');
