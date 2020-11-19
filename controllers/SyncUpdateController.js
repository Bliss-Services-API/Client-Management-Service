'use strict';

module.exports = (S3Client) => {

    const blissClientSyncBucket = process.env.BLISS_CLIENT_SYNC_BUCKET;

    const getSyncData = async (clientId, timeStamp) => {
        return new Promise(async (resolve, reject) => {
            try {
                const videoParam = { 
                    Bucket: blissClientSyncBucket,
                    Prefix: `${clientId}/`,
                    Key: `${timeStamp}.bliss`,
                    Expires: 60 * 15
                };
        
                const syncDataSignedUrl = S3Client.getSignedUrl('getObjects', videoParam);
                return resolve(syncDataSignedUrl);
            }
            catch(err) {
                return reject(err);
            };
        })
    };

    const syncClient = async (clientId) => {
        return new Promise(async (resolve, reject) => {
            const syncContent = {};

            try {
                const clientSyncParam = { 
                    Bucket: blissClientSyncBucket,
                    Prefix: `${clientId}/`,
                };
        
                S3Client.listObjects(clientSyncParam, (err, data) => {
                    if(err) {
                        return reject(err);
                    }
                
                    data.Contents.forEach(async syncData => {
                        syncContent[`${syncData.key}`] = await getSyncData(clientId, syncData.key);
                    });

                    return resolve(syncContent);
                });

            } catch(err) {
                return reject(err);
            };   
        });
    };

    const deleteSyncRecord = async (clientId, timeStamp) => {
        return new Promise(async (resolve, reject) => {
            try {
                const clientSyncParam = { 
                    Bucket: blissClientSyncBucket,
                    Prefix: `${clientId}/`,
                    Key: `${timeStamp}.bliss`
                };
        
                S3Client.deleteObject(clientSyncParam, (err, data) => {
                    if(err) {
                        return reject(err);
                    }
                    return resolve(true);
                });

            } catch(err) {
                return reject(err);
            };   
        })
    };

    const getLatestSyncDate = async (clientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const clientSyncParam = { 
                    Bucket: blissClientSyncBucket,
                    Prefix: `${clientId}/`,
                };
        
                S3Client.listObjects(clientSyncParam, (err, data) => {
                    if(err) {
                        return reject(err);
                    }
                
                    const headSyncKey = data.Content[0]['key'];

                    return resolve(headSyncKey);
                });

            } catch(err) {
                return reject(err);
            };   
        })
    }

    return {
        syncClient,
        deleteSyncRecord
    };
}