import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as prompt } from './prompt.js';
const app = express();
import { config } from 'dotenv';
config({ path: './../.env' });

// import 'dotenv/config';
// import express from 'express';
// Adding Helmet to enhance APIs security
app.use(helmet());

// Using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// Enabling CORS for all requests
app.use(cors());

// Adding morgan to log HTTP requests
app.use(morgan('combined'));

app.response.respond = function({ data = {}, result = 'success', status = 200, message = '' } = {}) {

    const jsonResponse = {
        result,
        status,
        data,
        message,
    };

    return this.contentType('application/json')
        .status(status)
        .send(jsonResponse);
};

app.get('/', (req, res) => {
    return res.respond({});
});

app.use('/prompt', prompt);

const server = app.listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}`),
);

