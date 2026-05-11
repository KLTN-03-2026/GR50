const { DisplaySequence } = require('../models');
const { Op } = require('sequelize');

/**
 * Generates the next display ID for a specific facility, type and date.
 * Format: {PREFIX}-{NUMBER} e.g. BK-001
 * Full Internal Format: {FACILITY_ID}-{DATE}-{PREFIX}-{NUMBER}
 */
const getNextSequence = async (facilityId, sequenceType, date = new Date().toISOString().split('T')[0]) => {
    const prefixes = {
        'BOOKING': 'BK',
        'APPOINTMENT': 'AP',
        'QUEUE': 'Q',
        'PAYMENT': 'PAYQ',
        'REFUND': 'RFQ'
    };

    const prefix = prefixes[sequenceType];
    
    // Find or create the sequence record for today
    let sequence = await DisplaySequence.findOne({
        where: {
            facilityId,
            sequenceType,
            date
        }
    });

    if (!sequence) {
        sequence = await DisplaySequence.create({
            facilityId,
            sequenceType,
            date,
            currentNumber: 1,
            prefix,
            resetRule: 'DAILY'
        });
    } else {
        sequence.currentNumber += 1;
        await sequence.save();
    }

    const paddedNumber = sequence.currentNumber.toString().padStart(3, '0');
    
    return {
        displayId: `${prefix}-${paddedNumber}`,
        internalId: `FAC${facilityId.toString().padStart(3, '0')}-${date.replace(/-/g, '')}-${prefix}-${paddedNumber}`
    };
};

module.exports = {
    getNextSequence
};
