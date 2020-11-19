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
    
    const ClientCredentialsModel = postgresClient.define('client_credential', {
        client_id:                      { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        client_email:                   { type: Sequelize.STRING, allowNull: false },
        client_name:                    { type: Sequelize.STRING, allowNull: false },
        client_password:                { type: Sequelize.STRING, allowNull: false }
    }, {
        timestamps: false
    });
    return ClientCredentialsModel;   
}