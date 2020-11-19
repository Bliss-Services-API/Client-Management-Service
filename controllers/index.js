'use strict';

module.exports = (postgresClient, DynamoDBClient, S3Client) => {
    const clientProfileController = require('./ClientProfileController')(postgresClient, DynamoDBClient);
    const clientProfileImageController = require('./ClientProfileImageController')(S3Client);
    const clientSyncController = require('./SyncUpdateController')(S3Client);

    return  {
        clientProfileController,
        clientProfileImageController,
        clientSyncController
    }
}