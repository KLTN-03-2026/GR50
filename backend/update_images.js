const { User, Specialty } = require('./models');

// Asian/Vietnamese looking doctor images from Unsplash
const doctorImages = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop', // Asian female doctor
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop', // Asian male doctor
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1000&auto=format&fit=crop', // Doctor with patient
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop', // Doctor
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1000&auto=format&fit=crop', // Asian male doctor
    'https://images.unsplash.com/photo-1594824476969-513346381849?q=80&w=1000&auto=format&fit=crop', // Doctor
    'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=1000&auto=format&fit=crop', // Asian doctor
    'https://images.unsplash.com/photo-1550831147-7245362524d6?q=80&w=1000&auto=format&fit=crop', // Asian doctor
    'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?q=80&w=1000&auto=format&fit=crop', // Doctor
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop', // Medical team
];

// Specialty images (Medical/Clinical)
const specialtyImages = [
    'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop', // General
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop', // Heart/Cardiology
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000&auto=format&fit=crop', // Neurology
    'https://images.unsplash.com/photo-1516574187841-693018954312?q=80&w=1000&auto=format&fit=crop', // Pediatrics
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop', // Dermatology
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop', // Dentistry
    'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1000&auto=format&fit=crop', // Gynecology
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop', // Gastroenterology
    'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?q=80&w=1000&auto=format&fit=crop', // ENT
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1000&auto=format&fit=crop', // General Medicine
];

async function updateData() {
    try {
        // Update Doctors
        const doctors = await User.findAll({ where: { role: 'doctor' } });
        console.log(`Found ${doctors.length} doctors.`);
        for (let i = 0; i < doctors.length; i++) {
            const doctor = doctors[i];
            const image = doctorImages[i % doctorImages.length];
            doctor.avatar = image;
            await doctor.save();
            console.log(`Updated avatar for doctor ${doctor.full_name}`);
        }

        // Update Specialties
        const specialties = await Specialty.findAll();
        console.log(`Found ${specialties.length} specialties.`);
        for (let i = 0; i < specialties.length; i++) {
            const specialty = specialties[i];
            const image = specialtyImages[i % specialtyImages.length];
            specialty.image = image;
            await specialty.save();
            console.log(`Updated image for specialty ${specialty.name}`);
        }

        console.log('All updates completed successfully.');
    } catch (error) {
        console.error('Error updating data:', error);
    } finally {
        process.exit();
    }
}

updateData();
