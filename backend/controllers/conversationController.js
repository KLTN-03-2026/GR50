const { 
  Conversation, 
  ConversationParticipant, 
  Message, 
  MessageAttachment, 
  CallSession, 
  CallParticipant, 
  SupportCase,
  DatLich,
  NguoiDung,
  BacSi,
  BenhNhan,
  LichKham
} = require('../models');
const { Op } = require('sequelize');

// Helper to get user role in conversation context
const getUserRoleInConversation = (userRole) => {
  switch (userRole) {
    case 'doctor': return 'doctor';
    case 'patient': return 'patient';
    case 'staff': return 'staff';
    case 'admin': return 'admin';
    default: return 'system';
  }
};

exports.getOrCreateAppointmentConversation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`[ChatDebug] getOrCreateAppointmentConversation: appointmentId=${appointmentId}, userId=${userId}, role=${userRole}`);

    // Check appointment
    const appointment = await DatLich.findByPk(appointmentId, {
      include: [
        { model: BenhNhan, include: [{ model: NguoiDung }] },
        { 
          model: LichKham, 
          include: [{ model: BacSi, include: [{ model: NguoiDung }] }] 
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ detail: 'Appointment not found' });
    }

    // Permission check
    const numericUserId = Number(userId);
    const isDoctor = userRole === 'doctor' && appointment.LichKham?.BacSi?.Id_NguoiDung === numericUserId;
    const isPatient = userRole === 'patient' && appointment.BenhNhan?.Id_NguoiDung === numericUserId;
    const isStaff = userRole === 'staff' || userRole === 'admin';

    console.log(`[ChatDebug] Permissions: isDoctor=${isDoctor}, isPatient=${isPatient}, isStaff=${isStaff}`);
    if (appointment.LichKham?.BacSi) {
      console.log(`[ChatDebug] Appointment Doctor UserID: ${appointment.LichKham.BacSi.Id_NguoiDung}`);
    }

    if (!isDoctor && !isPatient && !isStaff) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      where: {
        conversation_type: 'appointment_chat',
        appointment_id: appointmentId
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        conversation_type: 'appointment_chat',
        appointment_id: appointmentId,
        facility_id: appointment.Id_PhongKham || null,
        created_by: userId,
        status: 'open',
        title: `Tư vấn: ${appointment.LichKham.BacSi.NguoiDung.Ho} ${appointment.LichKham.BacSi.NguoiDung.Ten} - ${appointment.BenhNhan.NguoiDung.Ho} ${appointment.BenhNhan.NguoiDung.Ten}`
      });

      // Add participants
      const participants = [];
      
      if (appointment.BenhNhan?.Id_NguoiDung) {
        participants.push({
          conversation_id: conversation.id,
          user_id: appointment.BenhNhan.Id_NguoiDung,
          role_in_conversation: 'patient'
        });
      }
      
      if (appointment.LichKham?.BacSi?.Id_NguoiDung) {
        participants.push({
          conversation_id: conversation.id,
          user_id: appointment.LichKham.BacSi.Id_NguoiDung,
          role_in_conversation: 'doctor'
        });
      }

      if (participants.length > 0) {
        await ConversationParticipant.bulkCreate(participants);
      }
    }

    res.json(conversation);
  } catch (error) {
    console.error('getOrCreateAppointmentConversation error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.createSupportConversation = async (req, res) => {
  try {
    const { patient_id, staff_id, support_case_type, note, appointment_id, facility_id } = req.body;
    const userId = req.user.id;

    // Create support case
    const supportCase = await SupportCase.create({
      patient_id,
      staff_id: staff_id || null,
      facility_id: facility_id || null,
      case_type: support_case_type,
      related_appointment_id: appointment_id || null,
      status: 'open',
      note
    });

    // Create conversation
    const conversation = await Conversation.create({
      conversation_type: 'support_chat',
      support_case_id: supportCase.id,
      facility_id: facility_id || null,
      created_by: userId,
      status: 'open',
      title: `Hỗ trợ: ${support_case_type}`
    });

    // Get patient user ID
    const patient = await BenhNhan.findByPk(patient_id);
    
    // Add participants
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: patient.Id_NguoiDung,
        role_in_conversation: 'patient'
      }
    ];

    if (staff_id) {
      participants.push({
        conversation_id: conversation.id,
        user_id: staff_id,
        role_in_conversation: 'staff'
      });
    }

    await ConversationParticipant.bulkCreate(participants);

    res.json({ conversation, supportCase });
  } catch (error) {
    console.error('createSupportConversation error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const whereClause = {};
    if (type) {
      whereClause.conversation_type = type;
    }

    // Find conversation IDs where the user is an active participant
    const userParticipants = await ConversationParticipant.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ['conversation_id']
    });

    const conversationIds = userParticipants.map(p => p.conversation_id);

    if (conversationIds.length === 0) {
      return res.json([]);
    }

    const conversations = await Conversation.findAll({
      where: { 
        ...whereClause,
        id: { [Op.in]: conversationIds }
      },
      include: [
        {
          model: ConversationParticipant,
          as: 'participants',
          include: [{ model: NguoiDung, as: 'user', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'AnhDaiDien'] }]
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['last_message_at', 'DESC'], ['created_at', 'DESC']]
    });

    res.json(conversations);
  } catch (error) {
    console.error('getMyConversations error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getConversationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'participants',
          include: [{ model: NguoiDung, as: 'user', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'AnhDaiDien'] }]
        },
        {
          model: DatLich,
          as: 'appointment'
        },
        {
          model: SupportCase,
          as: 'support_case'
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found' });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(p => p.user_id === userId);
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Access denied' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('getConversationDetails error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Check participation
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId }
    });

    if (!participant && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const offset = (page - 1) * limit;
    const messages = await Message.findAll({
      where: { conversation_id: id, is_deleted: false },
      include: [
        { model: NguoiDung, as: 'sender', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'AnhDaiDien'] },
        { model: MessageAttachment, as: 'attachments' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, message_type = 'text', reply_to_message_id } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check participation
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const message = await Message.create({
      conversation_id: id,
      sender_id: userId,
      sender_role: getUserRoleInConversation(userRole),
      message_type,
      content,
      reply_to_message_id
    });

    // Update conversation last message timestamp
    await Conversation.update(
      { last_message_at: new Date() },
      { where: { id } }
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      const fullMessage = await Message.findByPk(message.id, {
        include: [
          { model: NguoiDung, as: 'sender', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'AnhDaiDien'] },
          { model: MessageAttachment, as: 'attachments' }
        ]
      });
      io.to(`conversation_${id}`).emit('new_message', fullMessage);
    }

    res.json(message);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lastMessage = await Message.findOne({
      where: { conversation_id: id },
      order: [['created_at', 'DESC']]
    });

    if (lastMessage) {
      await ConversationParticipant.update(
        { 
          last_read_message_id: lastMessage.id,
          last_read_at: new Date()
        },
        { where: { conversation_id: id, user_id: userId } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.startCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { call_type } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) return res.status(404).json({ detail: 'Conversation not found' });

    const roomCode = `room_${id}_${Date.now()}`;

    const callSession = await CallSession.create({
      conversation_id: id,
      appointment_id: conversation.appointment_id,
      facility_id: conversation.facility_id,
      call_type,
      provider: 'webrtc',
      room_code: roomCode,
      started_by: userId,
      status: 'waiting',
      started_at: new Date()
    });

    // Create message about call starting
    const message = await Message.create({
      conversation_id: id,
      sender_id: userId,
      sender_role: getUserRoleInConversation(req.user.role),
      message_type: 'call_event',
      content: `${req.user.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'} đã bắt đầu cuộc gọi ${call_type === 'video' ? 'video' : 'thoại'}.`
    });

    // Add starter as participant
    await CallParticipant.create({
      call_session_id: callSession.id,
      user_id: userId,
      joined_at: new Date(),
      join_status: 'joined'
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${id}`).emit('call_started', {
        callSession,
        startedBy: userId
      });
      
      const fullMessage = await Message.findByPk(message.id, {
        include: [{ model: NguoiDung, as: 'sender', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'AnhDaiDien'] }]
      });
      io.to(`conversation_${id}`).emit('new_message', fullMessage);
    }

    res.json(callSession);
  } catch (error) {
    console.error('startCall error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
