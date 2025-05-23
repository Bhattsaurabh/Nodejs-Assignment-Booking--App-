import  {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"



const generateAccessandRefreshTokens = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken                    // assigning refreshtoken to user
        await user.save({ validateBeforeSave: false })        // saving refereshtoken in user

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser  =   asyncHandler( async (req, res) =>{
    // get user details from frontend
    // validation   -   not empty
    // check if user is already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response



    // extract data from req.body (sirf text data hold krta h)
    console.log(req.body);
    const { name, email, phone, password } = req.body          //destructuring
    console.log("fullName: ", name, "email: ", email, "Phone: ", phone)

    // check if any field is empty or not
    if (
        [ name, email, phone, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }

    //checking email validation
    if (req.body.email.indexOf('@') == -1) {
        throw new ApiError(400, "Email is not valid.")
    }

    //checking user exists or not
    const existedUser = await User.findOne({
        $or: [{ name }, { email }]          //  means checking all field using OR operation
    })

    if (existedUser) {                          // if user already registered then throw error
        throw new ApiError(409, "User with email or name already exists")
    }

    console.log("user created")


    // create entry in db
    // save hone  se  pehle pre method chlega

    const user = await User.create({
        name: name.toLowerCase(),
        email,
        phone,
        password
    })


    // remove password and refresh token field from response
    const createdUser = await User.findById(user.id).select(         // mongoDB auto generate a id for every entry 
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }


    console.log("User Registered Successfully")
    //returning  response to user interface
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


})



const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    // email
    // find the user
    // verify user is there or not
    // check password
    // access and refresh token
    // send cookie

    const { email, password } = req.body

    //checking  email is there or not
    if (!email) {
        throw new ApiError(400, "email is required")
    }

    // find user has a valid email by checking in mongoDB
    const user = await User.findOne({email : email})

    if (!user) {
        throw new ApiError(404, "user does not exists")
    }

    // check user input password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    // getting accesstoken and refreshtoken
    // accesstoken => user ko login krte time accesstoken provide kiya jata h for a fixed time.
    // refreshtoken => accesstoken expire hone k baad user ko bina dubara login kraye refreshtoken se user ko login rkha jata h agr
    // user ka refreshtoken DB k refreshtoken se match hogya.
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id)

    //sending cookie
    const loggedInUser = await User.findById(user.id).select("-password -refreshToken")

    const options = {
        httpOnly: true,         // cookie only manage by server
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged in Successfully"
            )
        )
})

// logout user
// logout karne k liye user ko jo login pr tokens diye wo sb clear karne honge.
// user ko logout karne k liye user ka access lena pdega tabhi toh accesstoken and refreshtoken hatayenge
// issliye ye middleware ka use krk logout method par jane se pehle req mai req.user ko add krdenge jisme  access and refresh tokens honge.



const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user.id,
        {
            $unset: {
                refreshToken: 1     //this remove the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))

})



// jab user ka accesstoken expire hojyga then usko dubara login na krne k liye uska refreshtoken verify krenge
// login pe user ko jo refreshtoken diya h usko DB mai save wale se verify krenge.
// user ko diya hua koi b token encoded hota h or DB mai decoded m hota h
const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = await generateAccessandRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newrefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})




export {registerUser, loginUser, logoutUser, generateAccessandRefreshTokens, refreshAccessToken}