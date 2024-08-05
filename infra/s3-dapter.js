
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
// Importando as variaveis de ambiente
require('dotenv').config()

// Configurar as credenciais do DigitalOcean
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.S3_BUCKET_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET
});

// Configurar o multer para armazenar os arquivos temporariamente
const storage = multer.memoryStorage();
module.exports.upload = multer({ storage: storage });

// Função para fazer o upload
module.exports.uploadFile = (file, bucketName, keyPrefix) => {
    const params = {
        Bucket: bucketName,
        Key: `${keyPrefix}/${file.originalname}`, // Nome do arquivo no Space
        Body: file.buffer,
        ACL: 'public-read' // Deixar o arquivo público (opcional)
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data.Location);
        });
    });
};


// Função para listar todas as URLs em uma pasta
module.exports.listAllFiles = (keyPrefix) => {
    const bucketName = 'smart-images'
    const params = {
        Bucket: bucketName,
        Prefix: keyPrefix
    };

    return new Promise((resolve, reject) => {
        s3.listObjectsV2(params, (err, data) => {
            if (err) {
                return reject(err);
            }

            const urls = data.Contents.map(item => {
                return `https://${bucketName}.${spacesEndpoint.hostname}/${item.Key}`;
            });

            resolve(urls);
        });
    });
};