// Dependencies
import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
//import fs from 'fs/promises';
//import path from 'path';

//Express Router
const router = Router();

// Error handling middleware should be after router creation
router.use((err: Error, _req: Request, res: Response, _next: Function) => {
    // ... code ...
});

//Import route modules, api/html, and weather data and search history
import apiRoutes from './api/index.js';
import htmlRoutes from '../../Develop old/server/src/routes/htmlRoutes.js';

//All api routes
router.use('/api', apiRoutes);
//All html routes
router.use('/', htmlRoutes);

//Export router
export default router;
