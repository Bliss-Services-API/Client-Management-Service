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
    const clientPaymentHistoryController = Controller.clientPaymentHistoryController;

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

    router.delete('/delete/profile', async (req, res) => {
        const clientId = req.query.client_id;
        const clientProfileImageName = `${clientId}.png`;

        try {
            await clientProfileController.deleteProfileData(clientId);
            await clientImageController.deleteClientImage(clientProfileImageName);
            await clientSyncController.deleteProfileSync(clientId);

            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Deleted Successfully!',
                CODE: 'CLIENT_DELETED_SUCCESSFULLY'
            });
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Deletion Failed',
                CODE: 'CLIENT_DELETION_FAILED'
            });
        }
    })

    router.put('/update/image',
        clientProfileImageMultipart.single('client_image'),
        async (req, res) => {
            try {
                const clientImageStream = fs.createReadStream(req.file.path);
                const imageMIMEType = req.file.mimetype;
                const clientId = req.body.client_id;

                const imageFileName = `${clientId}.png`;

                await clientImageController.uploadClientImage(clientImageStream, imageFileName, imageMIMEType);
             
                res.send({
                    MESSAGE: 'DONE',
                    RESPONSE: 'Client Image Updated Successfully!',
                    CODE: 'CLIENT_UPDATED_SUCCESSFULLY'
                });
            }
            catch(err) {
                console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));
    
                res.status(400).send({
                    ERR: err.message,
                    RESPONSE: 'Client Image Upload Failed!',
                    CODE: 'CLIENT_UPDATION_FAILED'
                });
            }
            finally {
                fs.unlinkSync(req.file.path);
            }
        }
    );

    router.put('/update/name', async (req, res) => {
        try {
            const clientId = req.body.client_id;
            const clientName = req.body.client_name;

            await clientProfileController.updateClientName(clientId, clientName);
         
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Username Updated Successfully!',
                CODE: 'CLIENT_UPDATED_SUCCESSFULLY'
            });
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Username Upload Failed!',
                CODE: 'CLIENT_UPDATION_FAILED'
            });
        }
    });

    router.put('/update/bio', async (req, res) => {
        try {
            const clientId = req.body.client_id;
            const clientBio = req.body.client_bio;

            await clientProfileController.updateClientBio(clientId, clientBio);
        
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Bio Updated Successfully!',
                CODE: 'CLIENT_UPDATED_SUCCESSFULLY'
            });
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Bio Upload Failed!',
                CODE: 'CLIENT_UPDATION_FAILED'
            });
        }
    });

    router.put('/update/contactnumber', async (req, res) => {
        try {
            const clientId = req.body.client_id;
            const clientContactNumber = req.body.contact_number;

            await clientProfileController.updateClientContactNumber(clientId, clientContactNumber);
        
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Contact Number Updated Successfully!',
                CODE: 'CLIENT_UPDATED_SUCCESSFULLY'
            });
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Contact Number Upload Failed!',
                CODE: 'CLIENT_UPDATION_FAILED'
            });
        }
    });

    router.get('/fetch/profile', async (req, res) => {
        try {
            const clientId = req.query.client_id;

            const profile = await clientProfileController.getClientProfile(clientId);
        
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Profile Fetched!',
                CODE: 'CLIENT_PROFILE_FETCHED',
                PROFILE: profile
            });
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Profile Fetching Failed!',
                CODE: 'CLIENT_PROFILE_FETCH_FAILED'
            });
        }
    });

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

    router.delete('/delete/sync', async (req, res) => {
        const clientId = req.query.client_id;
        const repsonseId = req.query.response_id;
        const requestId = req.query.request_id;
        const podcastTitle = req.query.podcast_title;
        const podcastEpisodeTitle = req.query.podcast_episode_title;

        try {
            await clientSyncController.deleteSyncRecord(clientId, responseId, requestId, podcastTitle, podcastEpisodeTitle);
            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Message Sync Deleted!',
                CODE: 'CLIENT_SYNC_DELETED',
            });
        }
        catch (err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Message Sync Delete Failed!',
                CODE: 'CLIENT_SYNC_DELETE_FAILED',
            });
        }
    });

    router.get('/fetch/payment/history', async (req, res) => {
        try {
            const clientId = req.query.client_id;
            
            const paymentHistory = await clientPaymentHistoryController.getPaymentRecord(clientId);

            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Payment History Fetched!',
                CODE: 'CLIENT_PAYMENT_HISTORY_FETCHED',
                PAYMENTHISTORY: paymentHistory
            });
        }
        catch (err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Payment History Fetch Failed!',
                CODE: 'CLIENT_PAYMENT_HISTORY_FETCH_FAILED',
            });
        }
    });

    router.get('/fetch/payment/intent', async (req, res) => {
        try {
            const clientId = req.query.client_id;
            const celebName = req.query.celeb_name;
            const clientPaymentTime = req.query.client_payment_time;
            
            const paymentHistory = await clientPaymentHistoryController.getPaymentIntent(clientId, celebName, clientPaymentTime);

            res.send({
                MESSAGE: 'DONE',
                RESPONSE: 'Client Payment Intent Fetched!',
                CODE: 'CLIENT_PAYMENT_INTENT_FETCHED',
                PAYMENTHISTORY: paymentHistory
            });
        }
        catch (err) {
            console.error(chalk.error(`ERR: ${JSON.stringify(err.message)}`));

            res.status(400).send({
                ERR: err.message,
                RESPONSE: 'Client Payment Intent Fetch Failed!',
                CODE: 'CLIENT_PAYMENT_INTENT_FETCH_FAILED',
            });
        }
    });

    return router;
}