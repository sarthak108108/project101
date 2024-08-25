import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}${DB_NAME}`)
        console.log(`\n Database : ${DB_NAME} connected successfully ${connectionInstance.connection.host}`);
        // console.log(connectionInstance)
        
    } catch (error) {
        console.log(`connection failed`, error);
        process.exit(1)
    }
}

export default connectDb