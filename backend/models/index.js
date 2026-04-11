const sequelize = require('../config/database');

const VaiTro = require('./VaiTro.js');
const NguoiDung = require('./NguoiDung.js');
const NguoiDung_VaiTro = require('./NguoiDung_VaiTro.js');
const BenhNhan = require('./BenhNhan.js');
const ChuyenKhoa = require('./ChuyenKhoa.js');
const BacSi = require('./BacSi.js');
const LichKham = require('./LichKham.js');
const DatLich = require('./DatLich.js');
const HoSoBenhAn = require('./HoSoBenhAn.js');
const DonThuoc = require('./DonThuoc.js');
const ChiTietDonThuoc = require('./ChiTietDonThuoc.js');
const ThanhToan = require('./ThanhToan.js');
const KhamOnline = require('./KhamOnline.js');
const TinNhanKham = require('./TinNhanKham.js');
const NoiDungChoDuyet = require('./NoiDungChoDuyet.js');
const NoiDungDaDuyet = require('./NoiDungDaDuyet.js');
const ThongBao = require('./ThongBao.js');
const PhongKham = require('./PhongKham.js');

// Define associations
VaiTro.belongsToMany(NguoiDung, { through: NguoiDung_VaiTro, foreignKey: 'Id_VaiTro', otherKey: 'Id_NguoiDung' });
NguoiDung.belongsToMany(VaiTro, { through: NguoiDung_VaiTro, foreignKey: 'Id_NguoiDung', otherKey: 'Id_VaiTro' });

NguoiDung.hasMany(ThongBao, { foreignKey: 'Id_NguoiDung' });
ThongBao.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });

BenhNhan.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });
NguoiDung.hasOne(BenhNhan, { foreignKey: 'Id_NguoiDung' });

BacSi.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });
NguoiDung.hasOne(BacSi, { foreignKey: 'Id_NguoiDung' });

BacSi.belongsTo(ChuyenKhoa, { foreignKey: 'Id_ChuyenKhoa' });
ChuyenKhoa.hasMany(BacSi, { foreignKey: 'Id_ChuyenKhoa' });

LichKham.belongsTo(BacSi, { foreignKey: 'Id_BacSi' });
BacSi.hasMany(LichKham, { foreignKey: 'Id_BacSi' });

DatLich.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });
BenhNhan.hasMany(DatLich, { foreignKey: 'Id_BenhNhan' });
DatLich.belongsTo(LichKham, { foreignKey: 'Id_LichKham' });
LichKham.hasMany(DatLich, { foreignKey: 'Id_LichKham' });

HoSoBenhAn.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
DatLich.hasOne(HoSoBenhAn, { foreignKey: 'Id_DatLich' });
HoSoBenhAn.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });
HoSoBenhAn.belongsTo(BacSi, { foreignKey: 'Id_BacSi' });

DonThuoc.belongsTo(HoSoBenhAn, { foreignKey: 'Id_HoSo' });
HoSoBenhAn.hasMany(DonThuoc, { foreignKey: 'Id_HoSo' });

ChiTietDonThuoc.belongsTo(DonThuoc, { foreignKey: 'Id_DonThuoc' });
DonThuoc.hasMany(ChiTietDonThuoc, { foreignKey: 'Id_DonThuoc' });

ThanhToan.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
ThanhToan.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });

KhamOnline.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
DatLich.hasOne(KhamOnline, { foreignKey: 'Id_DatLich' });

TinNhanKham.belongsTo(KhamOnline, { foreignKey: 'Id_KhamOnline' });
KhamOnline.hasMany(TinNhanKham, { foreignKey: 'Id_KhamOnline' });
TinNhanKham.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiGui' });

NoiDungChoDuyet.belongsTo(NguoiDung, { foreignKey: 'Id_QuanTriVien' });
NoiDungDaDuyet.belongsTo(NguoiDung, { foreignKey: 'NguoiDuyet' });
NoiDungDaDuyet.belongsTo(NoiDungChoDuyet, { foreignKey: 'Id_NguonChoDuyet' });

module.exports = {
  sequelize,
  VaiTro,
  NguoiDung,
  NguoiDung_VaiTro,
  BenhNhan,
  ChuyenKhoa,
  BacSi,
  LichKham,
  DatLich,
  HoSoBenhAn,
  DonThuoc,
  ChiTietDonThuoc,
  ThanhToan,
  KhamOnline,
  TinNhanKham,
  NoiDungChoDuyet,
  NoiDungDaDuyet,
  ThongBao,
  PhongKham
};
