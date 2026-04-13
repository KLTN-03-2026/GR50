function validateChatSession(req, res, next) {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập mô tả triệu chứng',
        });
    }

    if (message.trim().length > 3000) {
        return res.status(400).json({
            success: false,
            message: 'Tin nhắn quá dài, tối đa 3000 ký tự',
        });
    }

    if (
        sessionId !== undefined &&
        sessionId !== null &&
        (!Number.isInteger(Number(sessionId)) || Number(sessionId) <= 0)
    ) {
        return res.status(400).json({
            success: false,
            message: 'sessionId không hợp lệ',
        });
    }

    next();
}

module.exports = {
    validateChatSession,
};
