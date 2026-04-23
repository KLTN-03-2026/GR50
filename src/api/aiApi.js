import axios from 'axios';
import { API } from '@/config';

const aiClient = axios.create({
    baseURL: `${API}/ai`,
});

aiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const sendAIMessage = async (payload) => {
    const res = await aiClient.post('/chat-session', payload);
    return res.data;
};

export const getAISessions = async () => {
    const res = await aiClient.get('/sessions');
    return res.data;
};

export const getAISessionDetail = async (id) => {
    const res = await aiClient.get(`/sessions/${id}`);
    return res.data;
};

export const hideAISession = async (id) => {
    const res = await aiClient.delete(`/sessions/${id}`);
    return res.data;
};
