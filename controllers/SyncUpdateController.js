'use strict';

module.exports = (postgresClient) => {

    const models = require('../models');

    const Model = models(postgresClient);
    const clientSyncMessageModel = Model.clientSyncMessageModel;

    const syncClient = async (clientId) => {
        return new Promise(async (resolve, reject) => {
            const syncContent = [];

            try {
                const syncRecords = await clientSyncMessageModel.findAll({
                    where: {
                        client_id: clientId
                    }
                });

                syncRecords.forEach(syncData => syncContent.push(syncData));

                return resolve(syncContent);

            } catch(err) {
                return reject(err);
            };   
        });
    };

    const deleteSyncRecord = async (clientId, responseId = undefined, requestId = undefined, podcastTitle = undefined, podcastEpisodeTitle = undefined) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(responseId !== undefined) {
                    await clientSyncMessageModel.destroy({
                        where: {
                            client_id: clientId,
                            bliss_response_id: responseId
                        }
                    });
                };

                if(requestId !== undefined) {
                    await clientSyncMessageModel.destroy({
                        where: {
                            client_id: clientId,
                            bliss_request_id: requestId
                        }
                    });
                };

                if(podcast_title !== undefined && podcast_episode_title !== undefined) {
                    await clientSyncMessageModel.destroy({
                        where: {
                            client_id: clientId,
                            podcast_title: podcastTitle,
                            podcast_episode_title: podcastEpisodeTitle
                        }
                    });
                };

                return resolve(true);
            } catch(err) {
                return reject(err);
            };   
        })
    };

    const deleteProfileSync = async (clientId) => {
        await clientSyncMessageModel.destroy({ where: { client_id: clientId }});
        return true;
    };

    return {
        syncClient,
        deleteSyncRecord,
        deleteProfileSync
    };
}