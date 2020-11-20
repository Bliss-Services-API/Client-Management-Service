'use strict';

/**
 * 
 * Migration of podcast_indices table in the Database podcasts
 * 
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('client_sync_messages', {
            client_id:                      { type: Sequelize.STRING, allowNull: false, references: {
                                                model: 'client_profiles',
                                                key: 'client_id',
                                            }, onUpdate: 'cascade', onDelete: 'cascade' },
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
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('client_sync_messages');
    }
};