const request = require('request');
const d3 = require('d3');
const dataS3 = require('data-s3');

const accessKeyId = process.env.AWS_KEY;
const secretAccessKey = process.env.AWS_SECRET;
const region = process.env.AWS_REGION;
const bucket = process.env.AWS_BUCKET;

const SHEET_OPTS = {
	id: '14q0-XFUKBGJSbUjkn79haheJSQ5EdCN1vt_fOI79COI',
	gid: '589998460'
};

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

function parse(response) {
	const approved = response.filter(d => d.approved);
	approved.sort((a, b) => d3.descending(new Date(a.Timestamp), new Date(b.Timestamp)));
	const top = approved.slice(0, 100);
	const timestamp = Date.now();
	const data = { timestamp, data: top };

	return Promise.resolve(data);
}

async function upload(data) {
	const path = 'misc/sadlunchbreak';
	const file = 'data.json';
	await dataS3.upload({ bucket, path, file, data });
	process.exit();
}

function init() {
	dataS3.init({ accessKeyId, secretAccessKey, region });
	
	downloadSheet(SHEET_OPTS)
		.then(parse)
		.then(upload)
		.catch(console.error);
}

init();
