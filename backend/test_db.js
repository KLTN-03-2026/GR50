const { Conversation, ConversationParticipant, NguoiDung } = require('./models');

async function test() {
  const convs = await Conversation.findAll();
  console.log("Conversations:", convs.length);
  const parts = await ConversationParticipant.findAll();
  console.log("Participants:", parts.length);
  process.exit();
}

test().catch(console.error);
