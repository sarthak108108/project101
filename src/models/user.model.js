import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true
    },
    phoneNumber : {
        type : Number,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    orderHistory:
        [
            {
                type: Schema.Types.ObjectId,
                ref: "Order"
            }
        ],
    refreshToken : {
        type: String
    }

})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
)}

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign({
        _id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
)
    
}

export const User = mongoose.model("User", userSchema)
