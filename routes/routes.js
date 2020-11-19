'use strict';

module.exports = (postgresClient, DynamoDBClient, S3Client) => {
    const express = require('express');
    const controller = require('../controllers');
    const multer = require('multer');
    const fs = require('fs');
    const chalk = require('../chalk.console');

    const router = express.Router();
    const Controller = controller(postgresClient, DynamoDBClient, S3Client);
    const clientProfileImageMultipart = multer({dest: 'tmp/client_images'});

    const clientProfileController = Controller.clientProfileController;
    const clientImageController = Controller.clientProfileImageController;
    const clientSyncController = Controller.clientSyncController;

    router.get('/ping', (req, res) => {
        res.send('OK');
    });

    router.post('/register', 
        clientProfileImageMultipart.single('client_image'),
        async (req, res) => {
            try {
                const clientCategory = req.body.client_category;
                const clientDOB = req.body.client_dob;
                const clientContactNumber = req.body.client_contact_number;
                const clientOriginCountry = req.body.client_origin_country;
                const clientBio = req.body.client_bio;

                const clientEmail = req.body.client_email;
                const clientName = req.body.client_name;
                const clientPassword = req.body.client_password;

                const clientToken = req.body.client_token;

                const clientImageStream = fs.createReadStream(req.file.path);
                const clientImageFileName = `${clientId}.png`;
                const clientImageMIMEType = req.file.mimetype;

                const clientId = clientProfileController.getClientId(clientEmail);

                //check if image exists
                const imageExists = await clientImageController.checkClientImageExist(clientImageFileName);
                const profileExists = await clientProfileController.checkClientProfileExists(clientId);

                if(!imageExists && !profileExists) {

                    await clientImageController.uploadClientImage(clientImageStream, clientImageFileName, clientImageMIMEType);
                    await clientProfileController.uploadClientProfileData(clientId, clientCategory, clientDOB, clientContactNumber, clientOriginCountry, clientBio);
                    await clientProfileController.uploadClientFCMToken(clientId, clientToken);
                    await clientProfileController.uploadClientCredentials(clientId, clientEmail, clientName, clientPassword);

                    res.send({
                        MESSAGE: 'DONE',
                        RESPONSE: 'Client Profile Created!',
                        CODE: 'CLIENT_PROFILE_CREATED',
                        CLIENTID: clientId
                    });

                }
                else if(imageExists){
                    throw new Error('Client Profile Image Already Exists');
                }
                else {
                    throw new Error('Client Profile Data Exists');
                };
            }
            catch(err) {
                console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

                res.status(400).send({
                    ERR: err.message,
                    RESPONSE: 'Client Profile Creation Failed!',
                    CODE: 'CLIENT_PROFILE_CREATION_FAILED'
                });
            }
            finally {
                fs.unlinkSync(req.file.path);
            }
        }
    );

    router.get('/sync', async (req, res) => {
        const clientId = req.query.client_id;
        
        try {
            const syncContent = await clientSyncController.syncClient(clientId);
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Content Synced Successfully!',
                CODE: 'CLIENT_SYNCED_SUCCESSFULLY',
                CONTENT: syncContent
            });
        }
        catch (err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Content Syncing Failed',
                CODE: 'CLIENT_SYNC_FAILED'
            });
        }
    })

    router.delete('/sync/delete', async (req, res) => {
        const clientId = req.query.client_id;
        const contentTimestamp = req.query.content_timestamp;
        
        try {
            const syncContent = await clientSyncController.deleteSyncRecord(clientId, contentTimestamp);
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Content Synced Successfully!',
                CODE: 'CLIENT_SYNCED_SUCCESSFULLY',
                CONTENT: syncContent
            });
        }
        catch (err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Content Syncing Failed',
                CODE: 'CLIENT_SYNC_FAILED'
            });
        }
    });

    return router;
}