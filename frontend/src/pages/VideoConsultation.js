import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';
import { API } from '@/config';
import axios from 'axios';
import { toast } from 'sonner';

export default function VideoConsultation() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversation();
    }, [conversationId]);

    const fetchConversation = async () => {
        try {
            const response = await axios.get(`${API}/conversations/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const conv = response.data.find(c => c.id === parseInt(conversationId));
            if (!conv) {
                toast.error('Không tìm thấy cuộc hội thoại hợp lệ!');
                navigate(-1);
                return;
            }
            setConversation(conv);
        } catch (error) {
            console.error('Error fetching conversation:', error);
            toast.error('Lỗi khi tải thông tin phòng chờ');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                    <p className="mt-4 text-gray-600">Đang khởi tạo phòng video tư vấn...</p>
                </div>
            </Layout>
        );
    }

    const roomName = `bookingcare-video-room-${conversationId}-${conversation?.id || 'public'}`;

    return (
        <Layout>
            <div className="relative w-full h-[calc(100vh-100px)] bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md z-10 relative">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse block"></span>
                            Phòng Tư Vấn Trực Tuyến
                        </h2>
                        <p className="text-sm text-gray-300">Đang tư vấn với: {conversation?.other_user_name}</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        title="Rời phòng trở về trang trước"
                    >
                        Thoát phòng Video
                    </button>
                </div>
                <div className="flex-1 w-full bg-black relative">
                    <JitsiMeeting
                        domain="meet.jit.si"
                        roomName={roomName}
                        configOverwrite={{
                            startWithAudioMuted: false,
                            disableModeratorIndicator: true,
                            startScreenSharing: true,
                            enableEmailInStats: false,
                            prejoinPageEnabled: true
                        }}
                        interfaceConfigOverwrite={{
                            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                        }}
                        userInfo={{
                            displayName: user ? `${user.full_name || user.Ho + ' ' + user.Ten}` : 'Bệnh Nhân',
                            email: user?.email || ''
                        }}
                        onApiReady={(externalApi) => {
                            // Hook events
                            externalApi.addListener('videoConferenceLeft', () => {
                                navigate(-1);
                            });
                            // Add watermark or other cool features
                        }}
                        getIFrameRef={(iframeRef) => {
                            iframeRef.style.height = '100%';
                            iframeRef.style.width = '100%';
                        }}
                    />
                </div>
            </div>
        </Layout>
    );
}
