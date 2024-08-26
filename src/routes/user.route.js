import { Router } from "express";
import { registerUser, loginUser, logoutUser, fetchUser } from "../controllers/user.controller.js";
import { cookieAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router()

//public routes

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(loginUser)

//secured routes

userRouter.route('/logout').post(cookieAuth, logoutUser)
userRouter.route('/fetch-user').post(cookieAuth, fetchUser)
export default userRouter