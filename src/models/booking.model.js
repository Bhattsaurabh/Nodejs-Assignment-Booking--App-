import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema(
    {
        activity : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            unique: false,
        },

        customer : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: false
        }
        
    },
    
    {timestamps: true}
)



export const Booking = mongoose.model("Booking", bookingSchema)