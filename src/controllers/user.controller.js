import asyncHandler from "../utils/asyncHandler.js";

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

    const {fullName, email, username, password, avatar, coverImage} = req.body
    console.log("fullname",fullName)
}) 

export { registerUser }