'use strict';

/**
 * 
 * Migration of podcast_indices table in the Database podcasts
 * 
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('client_payment_mappings', {
            client_id:                      { type: Sequelize.STRING, allowNull: false, primaryKey: true, references: {
                                                model: 'client_profiles',
                                                key: 'client_id',
                                            }, onUpdate: 'cascade', onDelete: 'cascade' },
            celeb_name:                     { type: Sequelize.STRING, allowNull: false },
            client_payment_date:            { type: Sequelize.DATE, allowNull: false },
            celeb_payment_intent:           { type: Sequelize.STRING, allowNull: false }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('client_payment_mappings');
    }
};