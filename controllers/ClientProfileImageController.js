'use strict'

/**
 * 
 * Controller for Handling Celeb Images in the AWS S3 Bucket.
 * 
 * @param {Sequelize} databaseConnection Sequelize Object, containing the connection for the Database
 * @param {aws-sdk object} S3Client Object containing the AWS S3 reference
 * 
 */
module.exports = (S3Client) => {

    //Initializing Variables
    const clientImageBucket = process.env.CLIENT_IMAGE_BUCKET;
    

    /**
     * 
     * Function to Check Whether Celeb Image exists on the S3 Bucket
     * 
     * @param {string} imageFileName Name of the Celeb Image File (.png)
     * @returns {Promise} Resolve contains true (image exists), and reject contains error
     * or false (image doesn't exists)
     * 
     */
    const checkClientImageExist = async imageFileName => {
        const imageParam = {
            Bucket: clientImageBucket,
            Key: imageFileName
        };

        return new Promise((resolve, reject) => {
            try {
                S3Client.headObject(imageParam, (err, metadate) => {
                    if(err && err.statusCode === 404) {
                        return resolve(false);
                    } else if(err) {
                        return reject(err);
                    }else {
                        return resolve(true);
                    }
                });
            } catch(err) {
                return reject(err);
            };
        })
    };

    /**
     * 
     * Function to Delete Celeb Image from the S3 Bucket, only if the profile
     * doesn't exists corresponding to the image of the celeb
     * 
     * @param {string} imageFileName Name of the Celeb Image File (.png)
     * @returns {Promise} Resolve contains JSON (image has been deleted), and reject contains error
     * or String (Error Message, as why the image couldn't be deleted)
     * 
     */
    const deleteClientImage = async imageFileName => {
        return new Promise(async (resolve, reject) => {
            try {
                const imageParam = {
                    Bucket: clientImageBucket,
                    Key: imageFileName
                };

                S3Client.deleteObject(imageParam, (err, info) => {
                    if(err){
                        return reject(err);
                    } else {
                        return resolve({
                            Message:'DONE',
                            Deleted: true
                        });
                    }
                });
            } catch(err) {
                return reject(err);
            };
        })
    };

    /**
     * 
     * Function to upload celeb image in the S3
     * 
     * @param {stream} imageStream readStream of the image file, uploaded through the multer
     * @param {string} imageFileName Name of the Celeb Image File (.png)
     * @param {string} imageMIMEType MIME of the image upload
     * @returns {string} URL for downloading celeb image from the CDN (cached)
     * 
     */
    const uploadClientImage = async (imageStream, imageFileName, imageMIMEType) => {
        const imageParam = { 
            Bucket: clientImageBucket,
            Key: imageFileName,
            Body: imageStream,
            ContentType: imageMIMEType
        };

        const s3UploadPromise = S3Client.upload(imageParam).promise();

        return s3UploadPromise
        .then(() => {
            return true;
        });
    };
    
    return {
        uploadClientImage, checkClientImageExist, deleteClientImage
    };
}