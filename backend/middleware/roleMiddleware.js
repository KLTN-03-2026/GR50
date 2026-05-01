/**
 * Middleware to check user roles and permissions.
 * These ensure "Independent Branching" (Phân nhánh độc lập) and prevent logic overlap.
 */

const isPatient = (req, res, next) => {
    if (req.user && req.user.role === 'patient') {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Patient role required.' });
};

const isDoctor = (req, res, next) => {
    if (req.user && req.user.role === 'doctor') {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Doctor role required.' });
};

const isStaff = (req, res, next) => {
    if (req.user && req.user.role === 'staff') {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Staff role required.' });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Admin role required.' });
};

const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin' && req.user.admin_type === 'SUPER_ADMIN') {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Super Admin role required.' });
};

const isFacilityAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin' && req.user.admin_type === 'FACILITY_ADMIN') {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Facility Admin role required.' });
};


/**
 * Composite middleware for inherited clinical roles.
 * Allows Doctors AND Department Heads to access clinical functions.
 */
const isMedicalStaff = (req, res, next) => {
    const roles = ['doctor', 'staff'];
    if (req.user && roles.includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ detail: 'Access denied: Medical staff permissions required.' });
};

module.exports = {
    isPatient,
    isDoctor,
    isStaff,
    isAdmin,
    isSuperAdmin,
    isFacilityAdmin,
    isMedicalStaff
};

