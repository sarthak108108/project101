import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// Global constants

const cookie = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong :/")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, phoneNumber, password, name, email } = req.body
    //check if all feilds are entered
    //check if username or email already exist for a user
    //check password validity for user(this will be done in the frontend)
    //check if phone number entered is valid
    //create user in mongodb
    if (email == "" || phoneNumber == "" || password == "" || name == "" || username == "") {
        throw new ApiError(400, "all fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User with email/username already exists")
    }

    const newUser = await User.create({
        username,
        email,
        phoneNumber,
        password,
        name
    })

    if (!newUser) {
        throw new ApiError(509, "internal server error")
    }

    return res.status(200).json(
        new ApiResponse(201, newUser, "User created successfully")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    // get username or email from req.body
    // get password from req.body 
    // find user with email or username
    // compare password 
    // generate access and refresh token 
    // store access and refresh token in cookies
    // return loggedIn user 

    const { email, username, password } = req.body

    if (!email && !username) {
        throw new ApiError(401, "enter username or email")
    }

    if (!password) {
        throw new ApiError(401, "password can't be empty")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user not found, make sure you entered correct email/username")
    }

    const passwordStatus = await user.isPasswordCorrect(password)

    if (!passwordStatus) {
        throw new ApiError(401, "invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "something went wrong :/")
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookie)
        .cookie("refreshToken", refreshToken, cookie)
        .json(
            new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, `logged in as: ${loggedInUser.username}`)
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    // verify user is logged in with cookieAuth 
    // delete cookies in user browser
    // delete refresh token in database

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            returnOriginal: false
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", cookie)
        .clearCookie("refreshToken", cookie)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        )

})

const fetchUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(201, req.user, "user fetched successfully"))
})

const updateUser = asyncHandler(async (req, res) => {
    const user = req.user
    const { newName, newUsername, newEmail, newPhoneNumber } = req.body

    const existingUsername = await User.findOne({ newUsername })
    if (existingUsername) {
        throw new ApiError(401, "User with username already exists")
    }

    const existingEmail = await User.findOne({ newEmail })
    if (existingEmail) {
        throw new ApiError(401, "User with email already exists")
    }

    const existingPhoneNumber = await User.findOne({ newPhoneNumber })
    if (existingPhoneNumber) {
        throw new ApiError(401, "User with phone-number already exists")
    }

    const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                username: newUsername,
                email: newEmail,
                phoneNumber: newPhoneNumber,
                name: newName
            }
        },
        {
            new: true
        }
    ).select("-password -refeshToken")

    if(!updatedUser){
        throw new ApiError(500, "something went wrong while trying to update user")
    }

    return res
        .status(200)
        .json(new ApiResponse(201, updatedUser, "user details updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    fetchUser,
    updateUser
}