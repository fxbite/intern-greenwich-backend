import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import morgan from 'morgan';
import { connectDB } from './config/mongodb';
import route from './routes';
import middleware from './middleware';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

// Checking if .env file is available
if (fs.existsSync('.env')) {
    dotenv.config();
} else {
    console.error('.env file not found.');
}

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());

// Middleware
app.use(express.json());

// Catch error
app.use(middleware.errorHandler);

// Connect db
connectDB();

// Route Init
route(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
