import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/Cloudinary.js'

import USerRouter from "./routes/UserRoutes.js"


const app = express();

await connectCloudinary(); 


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

app.get('/',(req,res) => res.send('Server is live !'));
app.use('/api/ai',aiRouter);
app.use('/api/user',USerRouter

)


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('Server is running on port ',PORT);
    
})

