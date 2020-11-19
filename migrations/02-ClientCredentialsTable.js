'use strict';

/**
 * 
 * Migration of podcast_indices table in the Database podcasts
 * 
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('client_credentials', {
            client_id:                      { type: Sequelize.STRING, allowNull: false, primaryKey: true, references: {
                                                model: 'client_profiles',
                                                key: 'client_id',
                                            }, onUpdate: 'cascade', onDelete: 'cascade' },
            client_email:                   { type: Sequelize.STRING, allowNull: false },
            client_name:                    { type: Sequelize.STRING, allowNull: false },
            client_password:                { type: Sequelize.STRING, allowNull: false }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('client_credentials');
    }
};