const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PhongKham } = require('../models');

const hospitalImages = [
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
    'https://images.unsplash.com/photo-1551076805-e1869043e560',
    'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
    'https://images.unsplash.com/photo-1519494140681-8b17d7678c74',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d'
];

async function updateFacilityImages() {
    try {
        console.log('Connecting to DB...');
        const facilities = await PhongKham.findAll();

        console.log(`Found ${facilities.length} facilities. Updating banners...`);

        let index = 0;
        for (const facility of facilities) {
            const image = hospitalImages[index % hospitalImages.length] + '?auto=format&fit=crop&w=1200&q=80';
            const logo = hospitalImages[index % hospitalImages.length] + '?auto=format&fit=crop&w=400&q=80';
            
            await facility.update({
                UrlBanner: image,
                UrlLogo: logo
            });
            index++;
        }

        console.log(`Successfully updated images for ${facilities.length} facilities!`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating facility images:', error);
        process.exit(1);
    }
}

updateFacilityImages();
