const { Message, Consultation, User, Appointment } = require('../models');

exports.getMessagesByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        console.log(`[Chat] Fetching messages for appointment: ${appointmentId}`);

        // Find consultation
        const consultation = await Consultation.findOne({ where: { appointment_id: appointmentId } });

        if (!consultation) {
            console.log(`[Chat] No consultation found for appointment: ${appointmentId}`);
            return res.json([]); // No messages yet
        }
        console.log(`[Chat] Found consultation: ${consultation.id}`);

        const messages = await Message.findAll({
            where: { consultation_id: consultation.id },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'full_name', 'avatar'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        console.log(`[Chat] Found ${messages.length} messages`);

        const result = messages.map(msg => ({
            id: msg.id,
            message: (msg.type === 'text' || !msg.type) ? msg.content : null,
            image_url: msg.type === 'image' ? msg.content : null,
            sender_id: msg.sender_id,
            sender_name: msg.Sender ? msg.Sender.full_name : 'Unknown',
            created_at: msg.createdAt
        }));

        res.json(result);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendMessageByAppointment = async (req, res) => {
    try {
        const { appointment_id, message, image_url } = req.body;
        const sender_id = req.user.id;

        console.log(`[Chat] Sending message for appointment: ${appointment_id}, sender: ${sender_id}`);

        // Find or create consultation
        let consultation = await Consultation.findOne({ where: { appointment_id } });
        if (!consultation) {
            console.log(`[Chat] Creating new consultation for appointment: ${appointment_id}`);
            consultation = await Consultation.create({ appointment_id });
        }

        if (message) {
            await Message.create({
                consultation_id: consultation.id,
                sender_id,
                content: message,
                type: 'text'
            });
        }

        if (image_url) {
            await Message.create({
                consultation_id: consultation.id,
                sender_id,
                content: image_url,
                type: 'image'
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
