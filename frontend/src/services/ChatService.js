import axios from 'axios';
import { API } from '@/config';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

const ChatService = {
  // Conversations
  getMyConversations: async (token, type) => {
    const url = type ? `${API}/conversations?type=${type}` : `${API}/conversations`;
    const response = await axios.get(url, getHeaders(token));
    return response.data;
  },

  getOrCreateAppointmentConversation: async (token, appointmentId) => {
    const response = await axios.post(`${API}/conversations/appointments/${appointmentId}/conversation`, {}, getHeaders(token));
    return response.data;
  },

  createSupportConversation: async (token, data) => {
    const response = await axios.post(`${API}/conversations/support/conversation`, data, getHeaders(token));
    return response.data;
  },

  getConversationDetails: async (token, id) => {
    const response = await axios.get(`${API}/conversations/${id}`, getHeaders(token));
    return response.data;
  },

  // Messages
  getMessages: async (token, conversationId, page = 1, limit = 50) => {
    const response = await axios.get(`${API}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, getHeaders(token));
    return response.data;
  },

  sendMessage: async (token, conversationId, data) => {
    const response = await axios.post(`${API}/conversations/${conversationId}/messages`, data, getHeaders(token));
    return response.data;
  },

  markAsRead: async (token, conversationId) => {
    const response = await axios.patch(`${API}/conversations/${conversationId}/read`, {}, getHeaders(token));
    return response.data;
  },

  // Calls
  startCall: async (token, conversationId, callType) => {
    const response = await axios.post(`${API}/conversations/${conversationId}/calls`, { call_type: callType }, getHeaders(token));
    return response.data;
  },

  joinCall: async (token, callSessionId) => {
    const response = await axios.post(`${API}/calls/${callSessionId}/join`, {}, getHeaders(token));
    return response.data;
  },

  leaveCall: async (token, callSessionId) => {
    const response = await axios.post(`${API}/calls/${callSessionId}/leave`, {}, getHeaders(token));
    return response.data;
  },

  endCall: async (token, callSessionId) => {
    const response = await axios.post(`${API}/calls/${callSessionId}/end`, {}, getHeaders(token));
    return response.data;
  }
};

export default ChatService;
