import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { cookieAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router()

//public routes

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(loginUser)
userRouter.route('/logout').post(cookieAuth, logoutUser)
export default userRouter