const { 
  Conversation, 
  ConversationParticipant, 
  Message, 
  MessageAttachment, 
  CallSession, 
  CallParticipant, 
  SupportCase,
  Appointment,
  NguoiDung,
  BacSi,
  BenhNhan,
  DoctorSchedule
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
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: BenhNhan, include: [{ model: NguoiDung }] },
        { 
          model: DoctorSchedule, 
          as: 'DoctorSchedule',
          include: [{ model: BacSi, as: 'Doctor', include: [{ model: NguoiDung }] }] 
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ detail: 'Appointment not found' });
    }

    // Permission check
    const numericUserId = Number(userId);
    const isDoctor = userRole === 'doctor' && appointment.DoctorSchedule?.Doctor?.Id_NguoiDung === numericUserId;
    const isPatient = userRole === 'patient' && appointment.BenhNhan?.Id_NguoiDung === numericUserId;
    const isStaff = userRole === 'staff' || userRole === 'admin';

    console.log(`[ChatDebug] Permissions: isDoctor=${isDoctor}, isPatient=${isPatient}, isStaff=${isStaff}`);
    if (appointment.DoctorSchedule?.Doctor) {
      console.log(`[ChatDebug] Appointment Doctor UserID: ${appointment.DoctorSchedule.Doctor.Id_NguoiDung}`);
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
        conversationType: 'appointment_chat',
        appointmentId: appointmentId,
        facilityId: appointment.Id_PhongKham || null,
        createdBy: userId,
        status: 'open',
        title: `Tư vấn: ${appointment.DoctorSchedule.Doctor.NguoiDung.Ho} ${appointment.DoctorSchedule.Doctor.NguoiDung.Ten} - ${appointment.BenhNhan.NguoiDung.Ho} ${appointment.BenhNhan.NguoiDung.Ten}`
      });

      // Add participants
      const participants = [];
      
      if (appointment.BenhNhan?.Id_NguoiDung) {
        participants.push({
          conversationId: conversation.id,
          userId: appointment.BenhNhan.Id_NguoiDung,
          roleInConversation: 'patient'
        });
      }
      
      if (appointment.DoctorSchedule?.Doctor?.Id_NguoiDung) {
        participants.push({
          conversationId: conversation.id,
          userId: appointment.DoctorSchedule.Doctor.Id_NguoiDung,
          roleInConversation: 'doctor'
        });
      }

      if (participants.length > 0) {
        await ConversationParticipant.bulkCreate(participants);
      }
    }

    res.json(conversation);
  } catch (error) {
    console.error('getOrCreateAppointmentConversation error detail:', {
        message: error.message,
        stack: error.stack,
        appointmentId,
        userId
    });
    res.status(500).json({ detail: `Lỗi lấy hội thoại: ${error.message}` });
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
      conversationType: 'support_chat',
      supportCaseId: supportCase.id,
      facilityId: facility_id || null,
      createdBy: userId,
      status: 'open',
      title: `Hỗ trợ: ${support_case_type}`
    });

    // Get patient user ID
    const patient = await BenhNhan.findByPk(patient_id);
    
    // Add participants
    const participants = [
      {
        conversationId: conversation.id,
        userId: patient.Id_NguoiDung,
        roleInConversation: 'patient'
      }
    ];

    if (staff_id) {
      participants.push({
        conversationId: conversation.id,
        userId: staff_id,
        roleInConversation: 'staff'
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
    const { type, facility_id } = req.query;

    const whereClause = {};
    if (type) {
      whereClause.conversation_type = type;
    }

    let conversationIds = [];

    if (req.user.role === 'staff' && facility_id) {
        // Staff sees all conversations in their facility of type support_chat or internal_chat
        // Or any conversation they are actually participating in
        const conversationsInFacility = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { facility_id: facility_id },
                    { id: { [Op.in]: await getParticipantConvIds(userId) } }
                ],
                ...whereClause
            },
            attributes: ['id']
        });
        conversationIds = conversationsInFacility.map(c => c.id);
    } else {
        // Patients and Doctors only see conversations they participate in
        conversationIds = await getParticipantConvIds(userId);
    }

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
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(conversations);
  } catch (error) {
    console.error('getMyConversations error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

// Helper
async function getParticipantConvIds(userId) {
    const participants = await ConversationParticipant.findAll({
        where: { userId: userId, isActive: true },
        attributes: ['conversationId']
    });
    return participants.map(p => p.conversationId);
}


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
          model: Appointment,
          as: 'Appointment'
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
      where: { conversationId: id, userId: userId }
    });

    if (!participant && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const offset = (page - 1) * limit;
    const messages = await Message.findAll({
      where: { conversationId: id, isDeleted: false },
      include: [
        { model: NguoiDung, as: 'sender', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'AnhDaiDien'] },
        { model: MessageAttachment, as: 'attachments' }
      ],
      order: [['createdAt', 'DESC']],
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
      where: { conversationId: id, userId: userId }
    });

    if (!participant) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      senderRole: getUserRoleInConversation(userRole),
      messageType: message_type,
      content,
      replyToMessageId: reply_to_message_id
    });

    // Update conversation last message timestamp
    await Conversation.update(
      { lastMessageAt: new Date() },
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
      where: { conversationId: id },
      order: [['createdAt', 'DESC']]
    });

    if (lastMessage) {
      await ConversationParticipant.update(
        { 
          lastReadMessageId: lastMessage.id,
          lastReadAt: new Date()
        },
        { where: { conversationId: id, userId: userId } }
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
      conversationId: id,
      appointmentId: conversation.appointmentId || conversation.appointment_id,
      facilityId: conversation.facilityId || conversation.facility_id,
      callType: call_type,
      provider: 'webrtc',
      roomCode: roomCode,
      startedBy: userId,
      status: 'waiting',
      startedAt: new Date()
    });

    // Create message about call starting
    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      senderRole: getUserRoleInConversation(req.user.role),
      messageType: 'call_event',
      content: `${req.user.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'} đã bắt đầu cuộc gọi ${call_type === 'video' ? 'video' : 'thoại'}.`
    });

    // Add starter as participant
    await CallParticipant.create({
      callSessionId: callSession.id,
      userId: userId,
      joinedAt: new Date(),
      joinStatus: 'joined'
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
    console.error('startCall error detail:', {
        message: error.message,
        stack: error.stack,
        conversation_id: id,
        user_id: userId
    });
    res.status(500).json({ detail: `Không thể khởi tạo cuộc gọi: ${error.message}` });
  }
};
