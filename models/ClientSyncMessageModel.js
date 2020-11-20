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
    
    const ClientSyncMessageModel = postgresClient.define('client_sync_message', {
            client_id:                      { type: Sequelize.STRING, allowNull: false },
            celeb_name:                     { type: Sequelize.STRING },
            bliss_response_id:              { type: Sequelize.BIGINT },
            bliss_request_id:               { type: Sequelize.BIGINT },
            bliss_response_date:            { type: Sequelize.STRING },
            bliss_response_time:            { type: Sequelize.STRING },
            bliss_request_date:             { type: Sequelize.STRING },
            bliss_request_time:             { type: Sequelize.STRING },
            podcast_title:                  { type: Sequelize.STRING },
            podcast_episode_title:          { type: Sequelize.STRING },
            sync_type:                      { type: Sequelize.ENUM('EPISODE', 'REQUESTED', 'RESPONDED', 'CANCELED'), allowNull: false }
    }, {
        timestamps: false
    });
    return ClientSyncMessageModel;   
}