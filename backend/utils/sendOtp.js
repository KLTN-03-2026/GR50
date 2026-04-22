// Mẫu demo. Sau này có thể nối với Gmail hoặc SMS gateway thật.

async function sendOtpToEmail(email, otp) {
    console.log(`[INFO] Send OTP ${otp} to email: ${email}`);
    // TODO: dùng nodemailer để gửi mail thật
}

async function sendOtpToPhone(phone, otp) {
    console.log(`[INFO] Send OTP ${otp} to phone: ${phone}`);
    // TODO: dùng Twilio/Vonage/... để gửi SMS thật
}

module.exports = {
    sendOtpToEmail,
    sendOtpToPhone,
};
