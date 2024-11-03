import dotenv from 'dotenv';
import express, { Express } from 'express';
import path from 'path';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app: Express = express();

const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist'))); 

// Enable CORS
app.use(cors()); 

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use API routes
app.use('/api', routes);

// Serve index.html for all other routes (only need this once)
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

export default app; 