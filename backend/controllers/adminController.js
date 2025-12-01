const { Payment, Appointment, User, Doctor, Patient, Specialty } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const total_patients = await User.count({ where: { role: 'patient' } });
        const total_doctors = await User.count({ where: { role: 'doctor' } });
        const total_appointments = await Appointment.count();

        const pending_appointments = await Appointment.count({ where: { status: 'pending' } });
        const confirmed_appointments = await Appointment.count({ where: { status: 'confirmed' } });
        const completed_appointments = await Appointment.count({ where: { status: 'completed' } });
        const cancelled_appointments = await Appointment.count({ where: { status: 'cancelled' } });

        // Appointment type not yet implemented in model, returning 0
        const online_consultations = 0;
        const in_person_consultations = 0;

        const pending_doctors = await Doctor.count({ where: { status: 'pending' } });
        const approved_doctors = await Doctor.count({ where: { status: 'approved' } });

        res.json({
            total_patients,
            total_doctors,
            total_appointments,
            pending_appointments,
            confirmed_appointments,
            completed_appointments,
            cancelled_appointments,
            online_consultations,
            in_person_consultations,
            pending_doctors,
            approved_doctors
        });
    } catch (error) {
        console.error('Admin get stats error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.findAll({
            where: { role: 'doctor' },
            include: [{
                model: Doctor,
                include: [{ model: Specialty, attributes: ['name'] }]
            }],
            attributes: ['id', 'full_name', 'email', 'phone', 'avatar', 'createdAt']
        });

        const formattedDoctors = doctors.map(d => ({
            user_id: d.id,
            full_name: d.full_name,
            email: d.email,
            phone_number: d.phone,
            avatar_url: d.avatar,
            status: d.Doctor?.status || 'pending',
            specialty_name: d.Doctor?.Specialty?.name,
            bio: d.Doctor?.bio,
            experience_years: d.Doctor?.experience_years,
            consultation_fee: d.Doctor?.consultation_fee,
            joined_at: d.createdAt
        }));

        res.json(formattedDoctors);
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await User.findAll({
            where: { role: 'patient' },
            include: [{ model: Patient }],
            attributes: ['id', 'full_name', 'email', 'phone', 'avatar', 'createdAt']
        });

        const formattedPatients = patients.map(p => ({
            user_id: p.id,
            full_name: p.full_name,
            email: p.email,
            phone_number: p.phone,
            avatar_url: p.avatar,
            date_of_birth: p.Patient?.date_of_birth,
            gender: p.Patient?.gender,
            address: p.Patient?.address,
            joined_at: p.createdAt
        }));

        res.json(formattedPatients);
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ detail: 'Invalid status' });
        }

        const doctor = await Doctor.findOne({ where: { user_id: id } });
        if (!doctor) {
            return res.status(404).json({ detail: 'Doctor profile not found' });
        }

        doctor.status = status;
        await doctor.save();

        res.json({ message: `Doctor ${status} successfully` });
    } catch (error) {
        console.error('Approve doctor error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ detail: 'User not found' });
        }

        // Prevent deleting self
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ detail: 'Cannot delete yourself' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        // Fetch all payments with associations
        const payments = await Payment.findAll({
            include: [
                {
                    model: Appointment,
                    include: [
                        { model: User, as: 'Doctor', attributes: ['full_name'] },
                        { model: User, as: 'Patient', attributes: ['full_name'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate stats
        const total_revenue = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        const completed_payments = payments.filter(p => p.status === 'completed').length;
        const pending_payments = payments.filter(p => p.status === 'pending').length;
        const total_payments = payments.length;

        // Format payments list
        const formattedPayments = payments.map(p => ({
            payment_id: p.id,
            status: p.status,
            doctor_name: p.Appointment?.Doctor?.full_name || 'Unknown Doctor',
            patient_name: p.Appointment?.Patient?.full_name || 'Unknown Patient',
            amount: parseFloat(p.amount),
            payment_method: p.payment_method,
            transaction_id: p.transaction_id,
            created_at: p.createdAt,
            payment_date: p.payment_date
        }));

        res.json({
            stats: {
                total_revenue,
                completed_payments,
                pending_payments,
                total_payments
            },
            payments: formattedPayments
        });

    } catch (error) {
        console.error('Admin get payments error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id', 'full_name', 'email', 'createdAt']
        });

        const adminsWithPermissions = await Promise.all(admins.map(async (admin) => {
            const permissions = await require('../models').AdminPermission.findOne({ where: { user_id: admin.id } });
            const adminData = admin.toJSON();
            if (permissions) {
                adminData.admin_permissions = permissions;
            }
            return adminData;
        }));

        res.json(adminsWithPermissions);
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { email, password, full_name, can_create_admins, can_manage_doctors, can_manage_patients, can_view_stats } = req.body;
        const bcrypt = require('bcryptjs');

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ detail: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            username: email, // Use email as username for admins
            password: hashedPassword,
            full_name,
            role: 'admin'
        });

        await require('../models').AdminPermission.create({
            user_id: user.id,
            can_create_admins: can_create_admins || false,
            can_manage_doctors: can_manage_doctors || false,
            can_manage_patients: can_manage_patients || false,
            can_view_stats: can_view_stats || false
        });

        res.status(201).json({ message: 'Admin created successfully', user });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ detail: 'Cannot delete yourself' });
        }

        const admin = await User.findOne({ where: { id, role: 'admin' } });
        if (!admin) {
            return res.status(404).json({ detail: 'Admin not found' });
        }

        await admin.destroy();
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.updatePermissions = async (req, res) => {
    try {
        const { admin_id, permissions } = req.body;
        const { AdminPermission } = require('../models');

        let perm = await AdminPermission.findOne({ where: { user_id: admin_id } });

        if (!perm) {
            perm = await AdminPermission.create({
                user_id: admin_id,
                ...permissions
            });
        } else {
            await perm.update(permissions);
        }

        res.json({ message: 'Permissions updated successfully', permissions: perm });
    } catch (error) {
        console.error('Update permissions error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};
