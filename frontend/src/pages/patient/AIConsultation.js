import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Stethoscope, AlertCircle, ArrowLeft, Send, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { sendAIMessage } from '@/api/aiApi';

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

export default function AIConsultation() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!message.trim()) {
            setError('Vui lòng nhập mô tả triệu chứng');
            return;
        }

        const userMsg = message.trim();

        try {
            setLoading(true);
            setError('');

            const res = await sendAIMessage({ sessionId, message: userMsg });

            if (!res.success) {
                throw new Error(res.message || 'Lỗi từ server');
            }

            const data = res.data;
            setSessionId(data.sessionId);

            setChatHistory((prev) => [
                ...prev,
                { role: 'user', content: userMsg },
                {
                    role: 'assistant',
                    content: data.reply,
                    suggestedSpecialty: data.suggestedSpecialty,
                    priority: data.priority,
                    needsEmergency: data.needsEmergency,
                    summary: data.summary,
                },
            ]);

            setMessage('');

            if (data.needsEmergency) {
                toast.warning('⚠️ Có dấu hiệu nguy cấp! Vui lòng đến cơ sở y tế ngay.', { duration: 8000 });
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Lỗi kết nối AI';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleAnalyze();
        }
    };

    return (
        <Layout>
            <div className="space-y-6 container mx-auto p-6 max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="gap-2 pl-0 hover:bg-transparent hover:text-purple-700 mb-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </Button>

                <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-700">
                    <Brain className="w-8 h-8" />
                    Tư vấn Sức khỏe AI
                </h1>

                {/* Chat history */}
                {chatHistory.length > 0 && (
                    <div className="space-y-4">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'user' ? (
                                    <div className="max-w-[75%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                                        <p className="text-sm font-medium mb-1 opacity-80">Bạn</p>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                ) : (
                                    <Card className="max-w-[80%] border-purple-100 shadow-sm">
                                        <CardHeader className="pb-2 pt-3 px-4">
                                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-700">
                                                <Brain className="w-4 h-4" />
                                                Trợ lý AI MediSchedule
                                                {msg.needsEmergency && (
                                                    <Badge className="bg-red-100 text-red-800 ml-2 animate-pulse">
                                                        <AlertCircle className="w-3 h-3 mr-1" /> Khẩn cấp
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4 space-y-3">
                                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                                                {msg.suggestedSpecialty && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-700">
                                                        <Stethoscope className="w-3.5 h-3.5" />
                                                        <span className="font-medium">Chuyên khoa gợi ý:</span>
                                                        <span>{msg.suggestedSpecialty}</span>
                                                    </div>
                                                )}
                                                {msg.priority && (
                                                    <Badge className={`text-xs ${PRIORITY_COLORS[msg.priority] || ''}`}>
                                                        Ưu tiên: {PRIORITY_LABELS[msg.priority] || msg.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Input area */}
                <Card className="shadow-md border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                            <MessageCircle className="w-4 h-4 text-purple-600" />
                            {chatHistory.length === 0
                                ? 'Nhập mô tả triệu chứng của bạn'
                                : 'Tiếp tục hỏi thêm'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Textarea
                            rows={5}
                            placeholder="Mô tả chi tiết triệu chứng (thời gian, vị trí, mức độ)... Nhấn Ctrl+Enter để gửi."
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            className="resize-none focus:ring-purple-300"
                            disabled={loading}
                        />

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                ⚕️ Thông tin chỉ mang tính tham khảo, không thay thế bác sĩ.
                            </p>
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !message.trim()}
                                className="bg-purple-600 hover:bg-purple-700 gap-2"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Phân tích triệu chứng</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Link to history */}
                {sessionId && (
                    <div className="text-center">
                        <Button
                            variant="link"
                            className="text-purple-600"
                            onClick={() => navigate('/patient/ai-history')}
                        >
                            Xem toàn bộ lịch sử tư vấn AI →
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
