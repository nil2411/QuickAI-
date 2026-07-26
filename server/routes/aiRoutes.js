import express from "express";
import {auth} from "../middleware/auth.js"
import { upload } from "../configs/multer.js";
import { generateArticle, generateBlogTitle, generateImage, RemoveImageBackground, RemoveImageObject, ResumeReview } from "../controllers/aicontroller.js";

const aiRouter = express.Router();

aiRouter.post('/generate-article',auth,generateArticle);
aiRouter.post('/generate-blog-title',auth,generateBlogTitle);
aiRouter.post('/generate-image',auth,generateImage);
aiRouter.post('/remove-image-background',upload.single('image'),auth,RemoveImageBackground);
aiRouter.post('/remove-image-object',upload.single('image'),auth,RemoveImageObject);
aiRouter.post('/resume-review',upload.single('resume'),auth,ResumeReview);

export default aiRouter;



