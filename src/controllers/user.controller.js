import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs"
import path from "path";

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

    const {username, email, fullName, password} = req.body
    // console.log("fullname",fullName)
    // console.log("email",email)

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
    console.log("avatar local path: ", avatarLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required in local")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log("avatar for cloudinary upload", avatar)

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

export { registerUser }