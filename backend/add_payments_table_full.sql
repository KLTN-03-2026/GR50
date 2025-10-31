USE medischedule;

DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,                      -- e.g., pay_01
    username VARCHAR(100),
    full_name VARCHAR(255),
    email VARCHAR(255),
    role ENUM('payment') DEFAULT 'payment',

    appointment_id INT NOT NULL,                       -- Liên kết với appointments.id
    patient_id VARCHAR(10) NOT NULL,                   -- e.g., p_01
    doctor_id VARCHAR(10) NOT NULL,                    -- e.g., d_01
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'credit_card', 'momo', 'zalopay', 'vnpay') DEFAULT 'cash',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME,

    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(user_id) ON DELETE CASCADE,

    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
