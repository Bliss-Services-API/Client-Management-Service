'use strict';

/**
 * 
 * Migration of podcast_indices table in the Database podcasts
 * 
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('client_profiles', {
            client_id:                      { type: Sequelize.STRING, allowNull: false, primaryKey: true },
            client_category:                { type: Sequelize.STRING, allowNull: false },
            client_dob:                     { type: Sequelize.DATE, allowNull: false },
            client_contact_number:          { type: Sequelize.BIGINT },
            client_origin_country:          { type: Sequelize.STRING, allowNull: false },
            client_bio:                     { type: Sequelize.TEXT },
            client_profile_image_link:      { type: Sequelize.STRING, allowNull: false },
            client_joining_date:            { type: Sequelize.DATE, allowNull: false },
            client_update_date:             { type: Sequelize.DATE, allowNull: false },
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('client_profiles');
    }
};