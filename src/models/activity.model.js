import mongoose from "mongoose";


const activitySchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        }
    },
    
    {timestamps: true}
)



export const Activity = mongoose.model("Activity", activitySchema)