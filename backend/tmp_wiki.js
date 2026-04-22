const https = require('https');

const hospitals = [
    'Bệnh viện Đà Nẵng',
    'Bệnh viện Đa khoa Hoàn Mỹ Đà Nẵng',
    'Bệnh viện Đa khoa Quốc tế Vinmec Đà Nẵng',
    'Bệnh viện C Đà Nẵng'
];

async function getWikiImage(title) {
    return new Promise((resolve) => {
        const url = `https://vi.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
        https.get(url, { headers: { 'User-Agent': 'MediScheduleBot/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== '-1' && pages[pageId].original) {
                        resolve(pages[pageId].original.source);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    for (const h of hospitals) {
        const img = await getWikiImage(h);
        console.log(`${h}: ${img}`);
    }
}
run();
