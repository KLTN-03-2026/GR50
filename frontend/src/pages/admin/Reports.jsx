import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { API } from '@/config';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, FileText, Download, Filter, 
  Calendar, DollarSign, Users, ChevronRight, Search
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminReports() {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('appointments');
    const [data, setData] = useState({
        appointments: [],
        payments: [],
        doctors: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [appRes, payRes, docRes] = await Promise.all([
                axios.get(`${API}/admin/appointments/all`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/admin/payments`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/admin/doctors`, { headers: { Authorization: `Bearer ${token}` } })
            ]);


            setData({
                appointments: appRes.data || [],
                payments: payRes.data?.payments || [],
                doctors: docRes.data || []
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Không thể tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = (tableData, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
        toast.success(`Đã xuất file Excel: ${fileName}`);
    };

    const exportToPDF = (headers, tableData, fileName) => {
        const doc = new jsPDF();
        doc.text(fileName, 14, 15);
        doc.autoTable({
            head: [headers],
            body: tableData.map(row => Object.values(row)),
            startY: 20,
        });
        doc.save(`${fileName}_${new Date().getTime()}.pdf`);
        toast.success(`Đã xuất file PDF: ${fileName}`);
    };

    const filteredData = () => {
        const currentData = data[activeTab];
        if (!searchTerm) return currentData;
        return currentData.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    const handleExport = (type) => {
        const reportTitle = activeTab === 'appointments' ? 'Báo cáo Lịch hẹn' : 
                           activeTab === 'payments' ? 'Báo cáo Doanh thu' : 'Báo cáo Bác sĩ';
        
        const currentData = filteredData();

        if (type === 'excel') {
            exportToExcel(currentData, reportTitle);
        } else {
            const headers = activeTab === 'appointments' ? ['ID', 'Bệnh nhân', 'Bác sĩ', 'Ngày', 'Trạng thái'] :
                           activeTab === 'payments' ? ['ID', 'Bệnh nhân', 'Số tiền', 'Phương thức', 'Ngày'] :
                           ['ID', 'Bác sĩ', 'Chuyên khoa', 'Email', 'Trạng thái'];
            exportToPDF(headers, currentData, reportTitle);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Báo cáo & Xuất dữ liệu</h1>
                            <p className="text-gray-500 text-sm">Kết xuất dữ liệu hệ thống phục vụ nghiệp vụ kế toán và quản trị</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleExport('excel')} className="bg-white hover:bg-green-50 text-green-600 border-green-200">
                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                            </Button>
                            <Button variant="outline" onClick={() => handleExport('pdf')} className="bg-white hover:bg-red-50 text-red-600 border-red-200">
                                <FileText className="w-4 h-4 mr-2" /> PDF
                            </Button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-1 p-1 bg-gray-200/50 dark:bg-gray-800 rounded-xl w-fit">
                        <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} icon={<Calendar />} label="Lịch hẹn" />
                        <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<DollarSign />} label="Doanh thu" />
                        <TabButton active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} icon={<Users />} label="Bác sĩ" />
                    </div>

                    {/* Search & Stats Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                         <div className="lg:col-span-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm nhanh trong bảng dữ liệu..."
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                         </div>
                         <Card className="rounded-2xl border-none shadow-sm bg-teal-600 text-white">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-teal-100 text-xs uppercase font-bold tracking-wider">Tổng mục đã lọc</p>
                                    <p className="text-2xl font-black">{filteredData().length}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Filter className="w-5 h-5" />
                                </div>
                            </CardContent>
                         </Card>
                    </div>

                    {/* Data Table */}
                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white dark:bg-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        {activeTab === 'appointments' && (
                                            <>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Bệnh nhân</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Bác sĩ</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Ngày khám</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Trạng thái</th>
                                            </>
                                        )}
                                        {activeTab === 'payments' && (
                                            <>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Mã GD</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Bệnh nhân</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Số tiền</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Ngày</th>
                                            </>
                                        )}
                                        {activeTab === 'doctors' && (
                                            <>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Họ tên</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Chuyên khoa</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Email</th>
                                                <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Trạng thái</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">
                                                Đang truy xuất dữ liệu...
                                            </td>
                                        </tr>
                                    ) : filteredData().length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">
                                                Không tìm thấy dữ liệu phù hợp.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData().map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                                {activeTab === 'appointments' && (
                                                    <>
                                                        <td className="px-6 py-4 font-medium">{item.patient_name}</td>
                                                        <td className="px-6 py-4">{item.doctor_name}</td>
                                                        <td className="px-6 py-4">{item.NgayKham}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                item.TrangThai === 'DaKham' ? 'bg-green-100 text-green-700' : 
                                                                item.TrangThai === 'Huy' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {item.TrangThai}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab === 'payments' && (
                                                    <>
                                                        <td className="px-6 py-4 font-mono text-xs">{item.transaction_id || 'N/A'}</td>
                                                        <td className="px-6 py-4 font-medium">{item.patient_name}</td>
                                                        <td className="px-6 py-4 font-bold text-teal-600">{item.amount?.toLocaleString()} đ</td>
                                                        <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                                                    </>
                                                )}
                                                {activeTab === 'doctors' && (
                                                    <>
                                                        <td className="px-6 py-4 font-medium">{item.full_name}</td>
                                                        <td className="px-6 py-4">{item.specialty_name}</td>
                                                        <td className="px-6 py-4 text-gray-500">{item.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`w-3 h-3 inline-block rounded-full mr-2 ${item.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            {item.status}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                active 
                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {React.cloneElement(icon, { size: 16 })}
            {label}
        </button>
    );
}
