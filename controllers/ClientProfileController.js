'use strict';

/**
 * 
 * Controller for handling Podcasts' Management routes in the Bliss App.
 * 
 * @param {Sequelize} postgresClient Sequelize Database Connection Object
 * 
 */
module.exports = (postgresClient, DynamoDBClient) => {

    //Importing Modules
    const models = require('../models')
    const crypto = require('crypto');

    //Initializing Variables
    const Model = models(postgresClient);
    const clientProfileModel = Model.clientProfileModel;
    const clientCredentialModel = Model.clientCredentialsModel;
    const clientPaymentHistoryModel = Model.clientPaymentHistoryModel;

    const MagicWord = process.env.MAGIC_WORD;
    const clientFCMTokenTable = process.env.CLIENT_FCM_TOKEN_TABLE;

    const uploadClientProfileData = async (clientId, clientCategory, clientDOB, clientContactNumber, clientOriginCountry, clientBio) => {
        const currTime = new Date().getTime();
        const clientData = {};

        clientData['client_id'] = clientId;
        clientData['client_category'] = clientCategory;
        clientData['client_dob'] = clientDOB;
        clientData['client_contact_number'] = clientContactNumber;
        clientData['client_origin_country'] = clientOriginCountry;
        clientData['client_bio'] = clientBio;
        clientData['client_profile_image_link'] = `${clientId}.png`;
        clientData['client_joining_date'] = currTime;
        clientData['client_update_date'] = currTime;

        await clientProfileModel.create(clientData);
        return true;
    };

    const getClientId = (clientEmail) => {
        const emailSalted = clientEmail + "" + MagicWord;
        const clientId = crypto.createHash('sha256').update(emailSalted).digest('base64');
        return clientId;
    };

    const deleteProfileData = async (clientId) => {
        await clientPaymentHistoryModel.delete({ where: { client_id: clientId } });
        await clientCredentialModel.delete({ where: { client_id: clientId } });
        await clientProfileModel.delete({ where: { client_id: clientId } });

        return true;
    };

    /**
     * 
     * Function to check whether celeb profile exists in the database
     * 
     * @param {string } celebName Name of the celeb, whose profile is being checked
     * @returns boolean true, if profile exists. false, if it doesn't
     * 
     */
    const checkClientProfileExists = async clientId => {
        const clientProfile = await clientProfileModel.findAll({
            where: {
                client_id: clientId
            }
        });

        if(clientProfile.length === 0) {
            return false;
        } else {
            return true;
        };
    }
    
    const uploadClientFCMToken = async (clientId, clientFCMToken) => {
        return new Promise((resolve, reject) => {
            try {
                const celebTokenParam = {
                    TableName: clientFCMTokenTable,
                    Item: {
                        'CLIENT_ID': { S: clientId },
                        'CLIENT_FCM_TOKEN': { S: clientFCMToken }
                    }
                };

                DynamoDBClient.putItem(celebTokenParam, function(err, token) {
                    if (err)
                        return reject(err);
                    else {
                        return resolve(token);
                    }
                });
            }
            catch(err) {
                reject(err);
            }
        })
    };

    const updateClientName = async (clientId, clientName) => {
        await clientCredentialModel.update({
            client_name: clientName
        }, {
            where: {
                client_id: clientId
            }
        });
    };

    const updateClientBio = async (clientId, clientBio) => {
        await clientCredentialModel.update({
            client_bio: clientBio
        }, {
            where: {
                client_id: clientId
            }
        });
    };

    const updateClientContactNumber = async (clientId, clientContactNumber) => {
        await clientCredentialModel.update({
            client_contact_number: clientContactNumber
        }, {
            where: {
                client_id: clientId
            }
        });
    };

    const updateClientCategory = async (clientId, clientCategory) => {
        await clientCredentialModel.update({
            client_category: clientCategory
        }, {
            where: {
                client_id: clientId
            }
        });
    };

    const uploadClientCredentials = async (clientId, clientEmail, clientName, clientPassword) => {
        const clientCredentialData = {};

        clientCredentialData['client_id'] = clientId;
        clientCredentialData['client_email'] = clientEmail;
        clientCredentialData['client_name'] = clientName;
        clientCredentialData['client_password'] = clientPassword;

        await clientCredentialModel.create(clientCredentialData);
        return true;
    };

    const getClientProfile = async (clientId) => {
        const profile = await clientProfileModel.findAll({
            where: {
                client_id: clientId
            }
        });

        return profile[0]['dataValues'];
    }

    return {
        uploadClientProfileData,
        getClientId,
        checkClientProfileExists,
        uploadClientFCMToken,
        uploadClientCredentials,
        deleteProfileData,
        updateClientName,
        updateClientContactNumber,
        updateClientBio,
        updateClientCategory,
        getClientProfile
    };
}