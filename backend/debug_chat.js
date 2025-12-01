const { Consultation, Message, User } = require('./models');

async function checkChat() {
    try {
        const appointmentId = 132;
        console.log(`Checking chat for appointment ${appointmentId}...`);

        const consultation = await Consultation.findOne({ where: { appointment_id: appointmentId } });

        if (!consultation) {
            console.log('No consultation found for this appointment.');
            return;
        }

        console.log(`Found consultation ID: ${consultation.id}`);

        const messages = await Message.findAll({
            where: { consultation_id: consultation.id },
            include: [{ model: User, as: 'Sender', attributes: ['id', 'full_name', 'role'] }]
        });

        console.log(`Found ${messages.length} messages:`);
        messages.forEach(msg => {
            console.log(`[${msg.createdAt}] ${msg.Sender ? msg.Sender.full_name : 'Unknown'} (${msg.sender_id}): ${msg.content}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkChat();
