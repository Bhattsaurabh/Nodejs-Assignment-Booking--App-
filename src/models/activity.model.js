import mongoose from "mongoose";


const activitySchema = new mongoose.Schema(
    {
        eventId : {
            type: String,
            required: true,
            unique: true,
            trim: true
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
        },
         date: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
         time: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },


    },
    
    {timestamps: true}
)



export const Activity = mongoose.model("Activity", activitySchema)