'use strict'

/**
 * 
 * Controller for Handling Celeb Images in the AWS S3 Bucket.
 * 
 * @param {Sequelize} databaseConnection Sequelize Object, containing the connection for the Database
 * @param {aws-sdk object} S3Client Object containing the AWS S3 reference
 * 
 */
module.exports = (postgresClient) => {

    const models = require('../models');

    const Model = models(postgresClient);
    const clientPaymentHistoryModel = Model.clientPaymentHistoryModel;

    const getPaymentRecord = async (clientId) => {
        const payments = [];
        
        const paymentRecords = await clientPaymentHistoryModel.findAll({
            where: {
                client_id: clientId
            }
        });

        paymentRecords.forEach(payment => payments.push(payment['dataValues']));

        return payments;
    };

    const getPaymentIntent = async (clientId, celebName, clientPaymentTime) => {
        const paymentIntents = [];
        
        const paymentIntentRecords = await clientPaymentHistoryModel.findAll({
            where: {
                client_id: clientId,
                celeb_name: celebName,
                client_payment_time: clientPaymentTime
            }
        });

        paymentIntentRecords.forEach(paymentIntent => paymentIntents.push(paymentIntent['dataValues']));

        return paymentIntents;
    };

    return {
        getPaymentRecord,
        getPaymentIntent
    };
}