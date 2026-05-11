/**
 * Standard sorting logic for operational lists
 * Sort by:
 * 1. Priority Score (DESC) - Medical urgency first
 * 2. Entered At (ASC) - First In First Out
 * 3. Appointment Time (ASC) - Original appointment order
 */
const getQueueOrder = () => {
    return [
        ['priority_score', 'DESC'],
        ['enteredAt', 'ASC'],
        ['createdAt', 'ASC'] // Fallback to creation time
    ];
};

module.exports = {
    getQueueOrder
};
