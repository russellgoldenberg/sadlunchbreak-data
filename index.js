const request = require('request');
const d3 = require('d3');
const uploadToS3 = require('./upload-to-s3');
const AWS_PATH = 'misc/sadlunchbreak';

function downloadSheet({ id, gid }) {
  return new Promise((resolve, reject) => {
    const base = 'https://docs.google.com/spreadsheets/u/1/d';
    const url = `${base}/${id}/export?format=csv&id=${id}&gid=${gid}`;

    request(url, (err, response, body) => {
      if (err) reject(err);
      const data = d3.csvParse(body);
      resolve(data);
    });
  });
}

function init() {
  downloadSheet({
    id: '14q0-XFUKBGJSbUjkn79haheJSQ5EdCN1vt_fOI79COI',
    gid: '589998460'
  }).then(response => {
    const approved = response.filter(d => d.approved);
    approved.reverse();
    const top = approved.slice(0, 100);
    const timestamp = Date.now();
    const output = { timestamp, data: top };
    const string = JSON.stringify(output, null, 2);
    const path = `${AWS_PATH}/data`;
    uploadToS3({ string, path, ext: 'json' })
      .then(() => {
        process.exit();
      })
      .catch(console.log);
  });
}

init();
