'use strict';

require('dotenv').config();

const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const clientRoutes = require('./routes/routes');
const chalk = require('./chalk.console');
const postgresConnection = require('./connections/PostgresConnection');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

if(ENV === 'development') {
    console.log(chalk.info("##### SERVER IS RUNNING IN DEVELOPMENT MODE #####"));
} else if(ENV === 'production') {
    console.log(chalk.info("##### SERVER IS RUNNING IN PRODUCTION MODE #####"));
} else {
    console.log(chalk.error("NO NODE_ENV IS PROVIDED"));
    process.exit(1);
}

AWS.config.getCredentials((err) => {
    if(err) {
        console.error(chalk.error(`CREDENTIALS NOT LOADED`));
        process.exit(1);
    }
    else console.log(chalk.info(`##### AWS ACCESS KEY IS VALID #####`));
});

AWS.config.update({region: 'us-east-2'});

const S3Client = new AWS.S3({apiVersion: '2006-03-01'});
const DynamoDBClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const postgresClient = postgresConnection(ENV);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

postgresClient
    .authenticate()
    .then(() => console.info(`Database Connection Established Successfully!`))
    .then(() => app.use(`/client`, clientRoutes(postgresClient, DynamoDBClient, S3Client)))
    .then(() => console.info(`Routes Established Successfully!`))
    .catch((err) => console.error(`Database Connection Failed!\nError:${err}`));


app.listen(PORT, () => console.log(chalk.info(`Server Running on port ${PORT}`)));