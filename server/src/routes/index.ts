// Dependencies
import { Router, Request, Response } from 'express';
import weatherRoutes from './weatherRoutes.js';

// Express Router
const router = Router();

// Error handling middleware
router.use((err: Error, _req: Request, res: Response, _next: Function) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Mount weather routes
router.use('/weather', weatherRoutes);

// Serve static files and handle other routes
router.get('*', (_req: Request, res: Response) => {
    res.sendFile('index.html', { root: './public' });
});

// Export router
export default router;
