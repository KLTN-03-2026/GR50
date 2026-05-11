const { OperationalArchive } = require('../models');

/**
 * Snapshots a record and hides it from the UI.
 */
const archiveOperationalRecord = async (modelInstance, sourceType, archiveReason, archivedBy = 'SYSTEM') => {
    try {
        // 1. Save snapshot
        await OperationalArchive.create({
            sourceType,
            sourceId: modelInstance.id || modelInstance.Id_DatLich,
            facilityId: modelInstance.facility_id || modelInstance.Id_PhongKham,
            snapshotData: modelInstance.toJSON ? modelInstance.toJSON() : modelInstance,
            archiveReason,
            archivedBy,
            archivedAt: new Date()
        });

        // 2. Hide from UI
        modelInstance.isVisible = false;
        modelInstance.archivedAt = new Date();
        await modelInstance.save();

        return true;
    } catch (error) {
        console.error(`Failed to archive ${sourceType} record:`, error);
        return false;
    }
};

module.exports = {
    archiveOperationalRecord
};
