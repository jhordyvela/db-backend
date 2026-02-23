import { Storage } from '@google-cloud/storage';
import { format } from 'util';
import { v4 as uuidv4 } from 'uuid';

// Configuración mediante variables de entorno:
// GC_PROJECT_ID, GC_KEYFILE (opcional), GC_BUCKET
// Build Storage client options so we can support two modes:
// - Production (Render): credentials JSON is provided in env var GC_KEYFILE_JSON
// - Local development: provide path to JSON file in GC_KEYFILE
const storageOptions = {};
if (process.env.GC_PROJECT_ID) storageOptions.projectId = process.env.GC_PROJECT_ID;
if (process.env.GC_KEYFILE_JSON) {
  try {
    storageOptions.credentials = JSON.parse(process.env.GC_KEYFILE_JSON);
  } catch (err) {
    console.error('Error parsing GC_KEYFILE_JSON:', err);
  }
} else if (process.env.GC_KEYFILE) {
  storageOptions.keyFilename = process.env.GC_KEYFILE;
}

const storageClient = new Storage(storageOptions);

const bucketName = process.env.GC_BUCKET || '';
if (!bucketName) {
  console.warn('GC_BUCKET is not set. uploadToGCS will fail until GC_BUCKET is configured.');
}
const bucket = storageClient.bucket(bucketName);

export const uploadToGCS = (file, destPath) => {
  return new Promise((resolve, reject) => {
    if (!file || !destPath) return reject(new Error('Parámetros inválidos para uploadToGCS'));

    const uuid = uuidv4();
    const fileUpload = bucket.file(destPath);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('finish', () => {
      const url = format(
        `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${uuid}`
      );
      resolve(url);
    });

    stream.end(file.buffer);
  });
};
