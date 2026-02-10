import "dotenv"
import mongoose from "mongoose";

export async function connectToDatabase(){
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
            console.log("Mongoose ")
        
    } catch (error) {
        console.log("Mongoose connection failed", error);
        process.exit(1);
    }

}
