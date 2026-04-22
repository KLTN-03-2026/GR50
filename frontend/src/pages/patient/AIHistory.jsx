import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, Calendar, Stethoscope, ArrowLeft, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Layout from '@/components/Layout';
import { getAISessions, getAISessionDetail, hideAISession } from '@/api/aiApi';

const PRIORITY_COLORS = {
    Thap: 'bg-green-100 text-green-800',
    TrungBinh: 'bg-yellow-100 text-yellow-800',
    Cao: 'bg-orange-100 text-orange-800',
    KhanCap: 'bg-red-100 text-red-800',
};

const PRIORITY_LABELS = {
    Thap: 'Thấp',
    TrungBinh: 'Trung bình',
    Cao: 'Cao',
    KhanCap: 'Khẩn cấp',
};

export default function AIHistory() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await getAISessions();
            setSessions(res.data || []);
        } catch (err) {
            setError('Không thể tải lịch sử tư vấn AI');
            toast.error('Không thể tải lịch sử tư vấn AI');
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (id) => {
        try {
            setDetailLoading(true);
            const res = await getAISessionDetail(id);
            setSelectedSession(res.data);
        } catch (err) {
            toast.error('Không thể tải chi tiết phiên tư vấn');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleHide = async (id, e) => {
        e.stopPropagation();
        try {
            await hideAISession(id);
            setSessions((prev) => prev.filter((s) => s.Id_AITuVanPhien !== id));
            if (selectedSession?.Id_AITuVanPhien === id) setSelectedSession(null);
            toast.success('Đã ẩn phiên tư vấn');
        } catch (err) {
            toast.error('Không thể ẩn phiên tư vấn');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return '—';
        }
    };

    if (loading) return <Layout><div className="p-8 text-center">Đang tải dữ liệu...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6 container mx-auto p-6 max-w-5xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-700">
                        <Brain className="w-8 h-8" />
                        Lịch sử Tư vấn AI
                    </h1>
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 gap-2"
                        onClick={() => window.dispatchEvent(new Event('toggle-floating-chat'))}
                    >
                        <Brain className="w-4 h-4" />
                        Tư vấn mới
                    </Button>
                </div>

                {error && (
                    <div className="text-center py-8 text-red-500">{error}</div>
                )}

                {!error && sessions.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">Bạn chưa có lịch sử tư vấn AI.</p>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => window.dispatchEvent(new Event('toggle-floating-chat'))}
                            >
                                Bắt đầu tư vấn AI
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {sessions.map((item) => (
                        <Card
                            key={item.Id_AITuVanPhien}
                            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-300"
                            onClick={() => openDetail(item.Id_AITuVanPhien)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {item.TieuDe || 'Phiên tư vấn AI'}
                                            </h3>
                                            {item.MucDoUuTien && (
                                                <Badge className={`text-xs ${PRIORITY_COLORS[item.MucDoUuTien] || ''}`}>
                                                    {PRIORITY_LABELS[item.MucDoUuTien] || item.MucDoUuTien}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mb-2">
                                            {item.TrieuChungTomTat || 'Chưa có tóm tắt'}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                                            {item.GoiYChuyenKhoa && (
                                                <span className="flex items-center gap-1">
                                                    <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                                                    {item.GoiYChuyenKhoa}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(item.NgayCapNhat || item.NgayTao)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                            onClick={(e) => { e.stopPropagation(); openDetail(item.Id_AITuVanPhien); }}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Chi tiết
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => handleHide(item.Id_AITuVanPhien, e)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Ẩn
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-700">
                            <Brain className="w-5 h-5" />
                            {selectedSession?.TieuDe || 'Chi tiết hội thoại AI'}
                        </DialogTitle>
                    </DialogHeader>

                    {detailLoading && <div className="text-center py-8">Đang tải chi tiết...</div>}

                    {!detailLoading && selectedSession && (
                        <div className="space-y-3 py-2">
                            {/* Meta info */}
                            <div className="flex gap-2 flex-wrap text-sm text-gray-500 pb-2 border-b">
                                {selectedSession.GoiYChuyenKhoa && (
                                    <span className="flex items-center gap-1">
                                        <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                                        {selectedSession.GoiYChuyenKhoa}
                                    </span>
                                )}
                                {selectedSession.MucDoUuTien && (
                                    <Badge className={`text-xs ${PRIORITY_COLORS[selectedSession.MucDoUuTien] || ''}`}>
                                        {PRIORITY_LABELS[selectedSession.MucDoUuTien] || selectedSession.MucDoUuTien}
                                    </Badge>
                                )}
                            </div>

                            {/* Messages */}
                            {selectedSession.messages?.map((msg) => (
                                <div
                                    key={msg.Id_AITuVanTinNhan}
                                    className={`flex ${msg.VaiTro === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.VaiTro === 'user' ? (
                                        <div className="max-w-[75%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
                                            <p className="opacity-70 text-xs mb-1">Bạn</p>
                                            <p className="whitespace-pre-wrap">{msg.NoiDung}</p>
                                        </div>
                                    ) : (
                                        <div className="max-w-[75%] bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                                            <p className="text-purple-700 font-medium text-xs mb-1">AI MediSchedule</p>
                                            <p className="text-gray-800 whitespace-pre-wrap">{msg.NoiDung}</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {(!selectedSession.messages || selectedSession.messages.length === 0) && (
                                <p className="text-center text-gray-400 py-4">Không có tin nhắn trong phiên này.</p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
