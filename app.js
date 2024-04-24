const dotenv = require('dotenv').config();
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const csv = require('csv-parser');

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", `Bearer ${process.env.BEARER_TOKEN}`);

const raw = JSON.stringify({
    "filters": {
        "source_created_at": {
            "start": moment().subtract(1, 'days').format('YYYY-MM-DD'),
            "end": moment().format('YYYY-MM-DD')
        },
        "brand_media_types": [
            "UPLOADED"
        ]
    },
    "sort_fields": [
        "DATE"
    ]
});

const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
};

async function checkExistingCSV() {
    return new Promise((resolve, reject) => {
        fs.access('Media Prediction.csv', fs.constants.F_OK, (err) => {
            if (err) {
                resolve(false); // File does not exist
            } else {
                resolve(true); // File exists
            }
        });
    });
}

async function appendToCSV(data) {
    return new Promise((resolve, reject) => {
        const csvWriter = createCsvWriter({
            path: 'Media Prediction.csv',
            header: [
                { id: 'id', title: 'Media ID' },
                { id: 'type', title: 'Media Type' },
                { id: 'source_created_at', title: 'Source Created At' },
                { id: 'name', title: 'Media Name' },
                { id: 'url', title: 'Media URL' },
                { id: 'engagement', title: 'Prediction Rate' }
            ],
            append: true // Append to existing file
        });
        if (data.length > 0) {
            csvWriter.writeRecords(data)
                .then(() => resolve())
                .catch(err => reject(err));
        }
    });
}

(async () => {
    try {
        const fileExists = await checkExistingCSV();
        const response = await fetch(`https://library-backend.dashhudson.com/brands/${process.env.BRAND_ID}/media/v2`, requestOptions);
        const jsonData = await response.json();

        if (jsonData.data.length > 0) {

            const mediaRequestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };
            // Transform JSON data to match CSV column mapping
            const csvDataPromises = jsonData.data.map(async item => {
                const mediaRequest = await fetch(`https://library-backend.dashhudson.com/brands/${process.env.BRAND_ID}/media/v2/${item.id}`, mediaRequestOptions);
                const mediaData = await mediaRequest.json();
            
                //console.log(JSON.stringify(mediaData));
                return {
                    id: item.id,
                    type: item.type.toString(),
                    source_created_at: item.source_created_at,
                    name: mediaData.meta.filename,
                    url: item.type == 'IMAGE' ? item.image.sizes.original.url : item.video.sizes.original.url,
                    engagement: item.predictions.engagement
                };
            });
            
            const csvData = await Promise.all(csvDataPromises);

            if (fileExists) {
                await appendToCSV(csvData);
                console.log('New data appended to existing CSV file.');
            } else {
                // Define CSV header and column mapping
                const csvWriter = createCsvWriter({
                    path: 'Media Prediction.csv',
                    header: [
                        { id: 'id', title: 'Media ID' },
                        { id: 'type', title: 'Media Type' },
                        { id: 'source_created_at', title: 'Source Created At' },
                        { id: 'name', title: 'Media Name' },
                        { id: 'url', title: 'Media URL' },
                        { id: 'engagement', title: 'Prediction Rate' }
                    ]
                });

                await csvWriter.writeRecords(csvData);
                console.log('CSV file written successfully.');
            }
        } else {
            console.log('No data to write to CSV.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
