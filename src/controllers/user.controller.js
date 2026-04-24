import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs"
import path from "path";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken


        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
        
    } catch (error) {
        console.log("token error: ", error)
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

    // *******steps for register user
    //get user details from frontend
    //validation - not empty
    //check if user already exist: username email
    // check for images, check for avatar
    //upload them to cloudinary avatar
    //create user object - create entry in db
    //remove password and referesh token field from response
    //check for user creation
    //return response

    console.log("req body data", req.body)

    const {username, email, fullName, password} = req.body
    console.log("fullname",fullName)
    console.log("email",email)
    // if(fullName == ""){
    //     throw new ApiError(400, "fullname is required")
    // }

    if([username, email, fullName, password].some((fields) => 
        fields?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    // const filePath = path.resolve("public/temp", req.files.avatar[0].filename);

    // const testPath = path.resolve("public/temp/test-from-node.txt");

    // const buffer = fs.readFileSync(req.files.avatar[0].path);
    // console.log("buffer",buffer.slice(0, 4));

    // fs.writeFileSync(testPath, "Hello from Node");

    // console.log("Test file created at:", testPath);

    // console.log("FILE EXISTS:", fs.existsSync(filePath));
    // console.log("CWD:", process.cwd());
    // console.log("Files:", fs.readdirSync(path.resolve("public/temp")));         
    // // console.log("files: ", req.files)
    // console.log("avatar local path: ", avatarLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required in local")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log("avatar for cloudinary upload", avatar)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required on cloudinary")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500, "Something went wrong while creating user")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully" )
   )



}) 

const loginUser = asyncHandler( async (req, res) => {

    const {email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}] //mongoDB operators $or
    })
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Password is invalid")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

   return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse (
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
        "User Logged In Successfully"
    )
    )


})

const logoutUser = asyncHandler(async (req, res) => {
    
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return req
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200, {}, "User logout successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken;

    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorised user request")
    }

   try {
     const decodedRefreshToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedRefreshToken?._id)
 
     if(!user){
         throw new ApiError(401, "Invalid refresh token")
     }
     if(incommingRefreshToken !== user.refreshToken){
         throw new ApiError(401, "Refreshed token is expired or used")
     }
  
     const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
 
     const options ={
         httpOnly: true,
         secure: true
     }
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
         new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed")
     )
   } catch (error) {
        throw new ApiError(400, "Invalid refresh token" )
   }

})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(
        ApiResponse(200, req.user, "User fetched successfully")
    )
})

const updatedAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!(fullName || email)){
        throw new ApiError(400, "All feilds are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {fullName, email}
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
    .json(
        ApiResponse(200, user, "User details update successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar?.url
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        ApiResponse(200, user, "User avatar updated successfully")
    )

})

export { registerUser,
            loginUser,
            logoutUser,
            refreshAccessToken,
            changeCurrentPassword,
            getCurrentUser,
            updatedAccountDetails,
            updateUserAvatar 
        }