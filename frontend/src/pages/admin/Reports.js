import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '@/config';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, DollarSign, Users, Calendar } from 'lucide-react';

export default function AdminReports() {
    const [stats, setStats] = useState(null);
    const [payments, setPayments] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, paymentsRes, reportsRes] = await Promise.all([
                    axios.get(`${API}/admin/stats`, { headers }),
                    axios.get(`${API}/admin/payments`, { headers }),
                    axios.get(`${API}/admin/reports`, { headers })
                ]);

                setStats(statsRes.data);
                setPayments(paymentsRes.data);
                setReports(reportsRes.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Layout><div className="p-6">Đang tải báo cáo...</div></Layout>;

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Báo cáo tổng hợp</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {payments?.stats?.total_revenue?.toLocaleString()} VNĐ
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {payments?.stats?.completed_payments} giao dịch thành công
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng lịch hẹn</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_appointments}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.completed_appointments} đã hoàn thành
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bác sĩ</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_doctors}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.approved_doctors} đang hoạt động
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bệnh nhân</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_patients}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Tables (Simplified for now) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái lịch hẹn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Chờ xác nhận:</span>
                                    <span className="font-bold">{stats?.pending_appointments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Đã xác nhận:</span>
                                    <span className="font-bold">{stats?.confirmed_appointments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Đã hoàn thành:</span>
                                    <span className="font-bold">{stats?.completed_appointments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Đã hủy:</span>
                                    <span className="font-bold">{stats?.cancelled_appointments}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tổng giao dịch:</span>
                                    <span className="font-bold">{payments?.stats?.total_payments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Thành công:</span>
                                    <span className="font-bold text-green-600">{payments?.stats?.completed_payments}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Chờ xử lý:</span>
                                    <span className="font-bold text-yellow-600">{payments?.stats?.pending_payments}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
