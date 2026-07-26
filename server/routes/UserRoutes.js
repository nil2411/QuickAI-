import express from "express";
import { auth } from "../middleware/auth.js";
import { getUserCreations,getPublishedCreations, toggleLikeCreations} from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.get('/get-user-creations',auth,getUserCreations);
UserRouter.get('/get-published-creations',auth,getPublishedCreations);
UserRouter.post('/toggle-like-creations',auth,toggleLikeCreations);

export default UserRouter;
