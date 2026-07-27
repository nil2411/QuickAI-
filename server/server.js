import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/Cloudinary.js'
import USerRouter from "./routes/UserRoutes.js"

const app = express();
const clerk = clerkMiddleware();

const hasRequiredEnv = (...names) =>
  names.every((name) => process.env[name]?.trim());

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => res.send('Server is live !'));

connectCloudinary();

app.use((req, res, next) => {
  if (!hasRequiredEnv('CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY')) {
    return res.status(500).json({
      success: false,
      message: 'Clerk is not configured. Add CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to your Vercel environment variables.',
    });
  }

  try {
    const result = clerk(req, res, next);
    return result?.catch ? result.catch(next) : result;
  } catch (error) {
    return next(error);
  }
});

app.use('/api/ai', aiRouter);
app.use('/api/user', USerRouter);

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
});

// Local / traditional Node hosting
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('Server is running on port ', PORT);
  });
}

// Vercel serverless expects a default export of the Express app
export default app;
