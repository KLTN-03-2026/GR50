import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Activity, Stethoscope, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AIConsultation() {
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) {
            toast.error("Vui lòng nhập triệu chứng của bạn");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API}/ai/analyze`,
                { symptoms },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // The backend already saves the diagnosis to the database (sends to Admin)
            setResult(response.data);
            toast.success("Đã phân tích và gửi kết quả về hệ thống!");
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error("Có lỗi xảy ra khi phân tích. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 pl-0 hover:bg-transparent hover:text-purple-700 mb-2">
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                </Button>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-purple-700">
                    <Brain className="w-10 h-10" />
                    Tư vấn Sức khỏe AI
                </h1>
                <p className="text-gray-600 mt-2">
                    Mô tả triệu chứng của bạn để nhận chẩn đoán sơ bộ từ AI.
                    Kết quả sẽ được lưu và gửi đến quản trị viên để hỗ trợ tư vấn bác sĩ phù hợp.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Nhập triệu chứng
                            </CardTitle>
                            <CardDescription>
                                Mô tả chi tiết các triệu chứng bạn đang gặp phải (ví dụ: đau đầu, sốt cao, buồn nôn...)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Ví dụ: Tôi bị đau đầu dữ dội từ sáng nay, kèm theo buồn nôn và chóng mặt khi đứng dậy..."
                                className="min-h-[200px] text-base p-4"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                            />
                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                size="lg"
                                onClick={handleAnalyze}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>Đang phân tích...</>
                                ) : (
                                    <>
                                        <Brain className="w-4 h-4 mr-2" />
                                        Phân tích triệu chứng
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Lưu ý quan trọng</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                            Đây là chẩn đoán sơ bộ từ AI và chỉ mang tính chất tham khảo.
                            Không thay thế cho việc thăm khám trực tiếp với bác sĩ chuyên khoa.
                        </AlertDescription>
                    </Alert>
                </div>

                <div className="space-y-6">
                    {result ? (
                        <Card className="border-purple-200 shadow-lg overflow-hidden">
                            <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center justify-between">
                                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5" />
                                    Kết quả phân tích
                                </h3>
                                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                    AI Powered
                                </span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                {/* Parse the result text if it's a string, or use fields if backend returns object structure */}
                                {/* Assuming backend returns { result: "string..." } or structured data. 
                                    Based on previous aiController, it returns { result: aiResult }. 
                                    We might need to parse it or just display it. 
                                    Let's try to display the raw text nicely or parse if possible.
                                */}
                                <div className="prose prose-purple max-w-none">
                                    <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                                        {result.result}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-green-800">Đã gửi đến hệ thống</p>
                                            <p className="text-sm text-green-700 mt-1">
                                                Thông tin này đã được lưu vào hồ sơ. Quản trị viên sẽ xem xét và có thể liên hệ để giới thiệu bác sĩ phù hợp.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center bg-gray-50 border-dashed">
                            <CardContent className="text-center text-gray-400 p-8">
                                <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Kết quả phân tích sẽ hiển thị tại đây</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
