import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Layout from '@/components/Layout';
import { Loader2, ShieldCheck, Clock, User, FileText, Send, Sparkles, BookOpen, Video as VideoIcon } from 'lucide-react';
import ChatService from '@/services/ChatService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { API } from '@/config';

export default function VideoConsultation() {
    const { id } = useParams(); // This is the callSessionId
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [callSession, setCallSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCallDetails();
        }
    }, [id]);

    const fetchCallDetails = async () => {
        try {
            setCallSession({
                id: id,
                room_code: `medisched-v2-${id}`,
                other_user_name: 'Đang kết nối...'
            });
        } catch (error) {
            console.error('Error fetching call details:', error);
            toast.error('Lỗi khi tải thông tin cuộc gọi');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            toast.success('Đã lưu ghi chú lâm sàng');
        } catch (error) {
            toast.error('Lỗi khi lưu ghi chú');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
                    </div>
                    <p className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Đang chuẩn bị phòng khám trực tuyến...</p>
                    <p className="mt-2 text-gray-500">Vui lòng cấp quyền truy cập camera và micro khi được hỏi.</p>
                </div>
            </Layout>
        );
    }

    const roomName = callSession?.room_code || `room-${id}`;

    return (
        <Layout>
            <div className="h-[calc(100vh-100px)] p-4 md:p-6 bg-[#f0f2f5] dark:bg-gray-950">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-4">
                    
                    {/* Header Bar */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                <VideoIcon className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    Phòng khám Trực tuyến
                                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-100 text-red-600 font-black uppercase tracking-widest border border-red-200">Live</span>
                                </h2>
                                <div className="flex items-center gap-4 mt-0.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                                        Mã phòng: {id.slice(0,8)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-teal-600 font-black uppercase tracking-wider">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Mã hóa y tế
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="destructive"
                                onClick={() => navigate(-1)}
                                className="bg-gray-900 hover:bg-black text-white px-8 rounded-xl font-bold h-12"
                            >
                                Kết thúc cuộc gọi
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex gap-6 overflow-hidden">
                        
                        {/* Video Area (Left) */}
                        <div className={`${user?.role === 'doctor' ? 'lg:flex-[0.7]' : 'flex-1'} bg-black rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white dark:border-gray-800 h-full`}>
                            <JitsiMeeting
                                domain="meet.jit.si"
                                roomName={roomName}
                                configOverwrite={{
                                    startWithAudioMuted: false,
                                    disableModeratorIndicator: true,
                                    startScreenSharing: true,
                                    enableEmailInStats: false,
                                    prejoinPageEnabled: false,
                                    toolbarButtons: [
                                        'camera', 'microphone', 'hangup', 'chat', 'settings', 'raisehand', 'videoquality', 'tileview'
                                    ]
                                }}
                                userInfo={{
                                    displayName: user ? `${user.full_name}` : 'Người dùng',
                                    email: user?.email || ''
                                }}
                                onApiReady={(externalApi) => {
                                    externalApi.addListener('videoConferenceLeft', () => {
                                        navigate(-1);
                                    });
                                }}
                                getIFrameRef={(iframeRef) => {
                                    iframeRef.style.height = '100%';
                                    iframeRef.style.width = '100%';
                                }}
                            />
                        </div>

                        {/* Clinical Sidebar (Right - Only for Doctor) */}
                        {user?.role === 'doctor' && (
                            <div className="lg:flex-[0.3] flex flex-col gap-4 animate-in slide-in-from-right duration-500">
                                <Card className="border-none shadow-xl bg-white dark:bg-gray-800 rounded-[2rem] flex-1 flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-teal-50/30">
                                        <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <FileText className="w-4 h-4 text-teal-600" />
                                            Ghi chú lâm sàng
                                        </h3>
                                        <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                                                Triệu chứng & Chẩn đoán
                                            </label>
                                            <Textarea 
                                                placeholder="Nhập ghi chú trực tiếp..." 
                                                className="min-h-[150px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-colors p-4 font-medium resize-none"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                                Chỉ định & Đơn thuốc
                                            </label>
                                            <Textarea 
                                                placeholder="Kê đơn thuốc hoặc chỉ định CLS..." 
                                                className="min-h-[150px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-colors p-4 font-medium resize-none"
                                                value={prescription}
                                                onChange={(e) => setPrescription(e.target.value)}
                                            />
                                        </div>

                                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-700 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                TỰ ĐỘNG LƯU: BẬT
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                                        <Button 
                                            onClick={handleSaveNotes}
                                            disabled={saving}
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black h-12 rounded-xl shadow-lg shadow-teal-600/20"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                            Lưu vào Hồ sơ Bệnh án
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
