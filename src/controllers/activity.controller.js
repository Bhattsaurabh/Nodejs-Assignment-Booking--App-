import  {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {Activity} from "../models/activity.model.js"
import {Booking} from "../models/booking.model.js"
import mongoose from "mongoose"


const addActivity =  asyncHandler( async(req, res) => {

      try {
        const {eventId, title, description, location, date, time} = req.body
        const userId = req.user?._id

        console.log(eventId, title, description, location, date, time)

        if(!eventId || !title || !description || !location || !date || !time)
        {
            throw new ApiError(400, "all fields are required")
        }

        const check = await Activity.findOne({ eventId: eventId})

        if(check)
        {
            throw new ApiError(500, "Activity already exist")
        }

        console.log(check)
    
    
        const newActivity  = await Activity.create({
            eventId: eventId,
            title : title,
            description: description,
            location: location,
            date: date,
            time: time
        })
        console.log(newActivity)
    
        if(!newActivity)
        {
             throw new ApiError(500, "Internal server error failed to add activity")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, newActivity, "Activity added successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "something went wrong failed to add activity")
        
    }



})


const bookActivity = asyncHandler( async(req, res) => {

      try {
        const {activity_id} = req.params
        const userId = req.user?._id

        console.log(activity_id)

        if(!activity_id)
        {
            throw new ApiError(400, "activity not found")
        }
        
        const checkBooking = await Booking.findOne({
            activity: activity_id,
            customer: userId
        })
        
        if(checkBooking)
        {
            throw new ApiError(402, "Booking for this activity already done.")
        }

        const newBooking  = await Booking.create({
            activity : activity_id,
            customer: userId
        })
    
        if(!newBooking)
        {
             throw new ApiError(500, "Internal server error failed to book activity")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, newBooking, "Activity added successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "something went wrong failed to book activity")
        
    }



})


const getAllActivity = asyncHandler(async(req, res) => {



     try {

        const userId = req.user?._id

         const pipeline = [
            {
                $match: {
                    customer : userId
                }
            },
            {
                $lookup: {
                    from: "Activity",
                    localField: "activity",
                    foreignField: "_id",
                    as: "bookings",
                    pipeline: [
                        {  
                            $project: {
                                eventId: 1,
                                title: 1,
                                description: 1,
                                location: 1,
                                date: 1,
                                time: 1
                                }
                                    
                        },
                    ]
                }
            },
             {
                $lookup: {
                    from: "User",
                    localField: "customer",
                    foreignField: "_id",
                    as: "watcher",
                    pipeline: [
                        {  
                            $project: {
                               name: 1,
                               email : 1
                                }
                                    
                        },
                    ]
                }
            }
         ]  
    
         const activities = await Booking.aggregate(pipeline)
    
         if(!activities)
         {
            throw new ApiError(500, "Internal server error failed to load activity")
         }
    
         return res
         .status(200)
         .json( new ApiResponse(200, activities, "activity fetched successfully"))
    } catch (error) {
            throw new ApiError(500, error.message || "Internal server error failed to load all activities")
    }



})



export {addActivity, bookActivity, getAllActivity }