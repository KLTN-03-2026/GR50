import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Layout from '@/components/Layout';
import { Loader2, ShieldCheck, Clock, User } from 'lucide-react';
import ChatService from '@/services/ChatService';
import { toast } from 'sonner';

export default function VideoConsultation() {
    const { id } = useParams(); // This is the callSessionId
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [callSession, setCallSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchCallDetails();
        }
    }, [id]);

    const fetchCallDetails = async () => {
        try {
            // Using the generic getConversationDetails for now as a fallback or if we add a getCallDetails to ChatService
            const response = await ChatService.getConversationDetails(token, id); // Temporary use id as conversationId
            // In a real implementation, we'd have a ChatService.getCallDetails(token, id)
            // For now, let's assume 'id' passed in URL is the callSessionId
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

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="w-6 h-6 text-teal-500" />
                        </div>
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
            <div className="h-[calc(100vh-100px)] p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto h-full flex flex-col gap-4">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                                <Video className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Tư vấn trực tuyến
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white font-black uppercase tracking-widest animate-pulse">Live</span>
                                </h2>
                                <div className="flex items-center gap-4 mt-0.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        00:00:00
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Mã hóa đầu cuối
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                            >
                                Kết thúc & Thoát
                            </button>
                        </div>
                    </div>

                    {/* Video Area */}
                    <div className="flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white dark:border-gray-800">
                        <JitsiMeeting
                            domain="meet.jit.si"
                            roomName={roomName}
                            configOverwrite={{
                                startWithAudioMuted: false,
                                disableModeratorIndicator: true,
                                startScreenSharing: true,
                                enableEmailInStats: false,
                                prejoinPageEnabled: true,
                                toolbarButtons: [
                                    'camera', 'microphone', 'hangup', 'chat', 'settings', 'raisehand', 'videoquality', 'tileview'
                                ]
                            }}
                            userInfo={{
                                displayName: user ? `${user.full_name}` : 'Bệnh Nhân',
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
                </div>
            </div>
        </Layout>
    );
}

function Video(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 8-6 4 6 4V8Z" />
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
    )
}
