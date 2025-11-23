-- Migration: Add conversations table and update chat_messages
-- Date: 2025-01-XX
-- Description: Support independent chat conversations without requiring appointments

-- Step 1: Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_last_message (last_message_at),
    UNIQUE KEY unique_patient_doctor (patient_id, doctor_id, appointment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add conversation_id column to chat_messages
ALTER TABLE chat_messages 
ADD COLUMN conversation_id INT NULL AFTER id,
ADD FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- Step 3: Migrate existing chat_messages to conversations
-- Create conversations for existing appointment-based chats
INSERT INTO conversations (patient_id, doctor_id, appointment_id, created_at, last_message_at)
SELECT 
    a.patient_id,
    a.doctor_id,
    a.id as appointment_id,
    MIN(cm.created_at) as created_at,
    MAX(cm.created_at) as last_message_at
FROM chat_messages cm
JOIN appointments a ON cm.appointment_id = a.id
WHERE cm.appointment_id IS NOT NULL
GROUP BY a.patient_id, a.doctor_id, a.id
ON DUPLICATE KEY UPDATE last_message_at = VALUES(last_message_at);

-- Step 4: Update chat_messages with conversation_id
UPDATE chat_messages cm
JOIN appointments a ON cm.appointment_id = a.id
JOIN conversations c ON c.patient_id = a.patient_id 
    AND c.doctor_id = a.doctor_id 
    AND c.appointment_id = a.id
SET cm.conversation_id = c.id
WHERE cm.appointment_id IS NOT NULL;

-- Step 5: Make conversation_id NOT NULL after migration
-- (Run this after verifying all messages have been migrated)
-- ALTER TABLE chat_messages MODIFY COLUMN conversation_id INT NOT NULL;

-- Step 6: Make appointment_id nullable (it's already nullable in the new schema)
-- No action needed as appointment_id is already nullable
