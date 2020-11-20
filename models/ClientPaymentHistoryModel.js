'use strict';

/**
 * 
 * Model of the client-credentials Table in the Database credentials;
 * 
 * @param {Sequelize Object} postgresClient Sequelize Object
 * 
 */
module.exports = (postgresClient) => {
    const Sequelize = require('sequelize');
    
    const ClientPaymentMappingModel = postgresClient.define('client_payment_mapping', {
        client_id:                      { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        celeb_name:                     { type: Sequelize.STRING, allowNull: false },
        client_payment_time:            { type: Sequelize.DATE, allowNull: false },
        celeb_payment_intent:           { type: Sequelize.STRING, allowNull: false }
    }, {
        timestamps: true,
        updatedAt: false,
        createdAt: 'client_payment_time'
    });
    return ClientPaymentMappingModel;   
}