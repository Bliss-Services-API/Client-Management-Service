'use strict';

/**
 * 
 * Returns all the Models in the Server
 * 
 * @param {Sequelize} postgresClient Sequelize Database Connection Object
 */
module.exports = (postgresClient) => {
    const clientProfileModel = require('./ClientProfileModel')(postgresClient);
    const clientCredentialsModel = require('./ClientCredentialsModel')(postgresClient);

    clientCredentialsModel.belongsTo(clientProfileModel, {foreignKey: 'client_id'});    
    clientProfileModel.hasOne(clientCredentialsModel, {foreignKey: 'client_id'});

    return {
        clientProfileModel,
        clientCredentialsModel
    };
};