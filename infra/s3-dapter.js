
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

// Configurar as credenciais do DigitalOcean
const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'DO00U9J66E38XN8TBHRR',
    secretAccessKey: 'jckbwMZxrXy0G6DkpwRW1YamoMhhbQncmD0i47CDwC0'
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