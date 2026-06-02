import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideo = asyncHandler(async (req, res) => {

    let {page = 1, limit = 10, query, sortBy= 'createdAt', sortType= 'desc', userId, search} = req.query
    console.log(search)

    //TODO: get all videos based on query, sort, pagination

         page = parseInt(page)  || 1;
         limit = parseInt(limit)

         let filter = {}

         if(search){
            filter.title = { $regex: search, $options: 'i' }; // case-insensitive search
         }

         console.log("query filter", filter)
        //Pagination calculation
        const skip = (page - 1) * limit;
        const video = await Video.find(filter).sort(
            {
                [sortBy]: sortType
            }
        ).skip(skip).limit(limit)

        if(video.length === 0){
            throw new ApiError(400, "Video List not found")
        }

        const totalVideo = await Video.countDocuments(filter)
        if(!totalVideo) {
            throw new ApiError(400, "Video count not found")
        }

        return res.status(200).json(
            new ApiResponse(200, {video, totalVideo, page, totalPages: Math.ceil(totalVideo / limit)}, "Video list found successfully")
        )

})

const publishVideo = asyncHandler(async (req, res)=> {
    try {
        const {title, description} =  req.body
        console.log("video title", title)
    
        if(!(title || description)) throw new ApiError(400, "Title and description are required")
    
        const videoLocalPath = req.files?.videoFile[0]?.path
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
        console.log( "video file",req.files)
    
        if(!videoLocalPath) throw new ApiError(400, "Video file is required")
    
        const video = await uploadOnCloudinary(videoLocalPath)
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
        if(!video) throw new ApiError(400, "Video file is required on cloudinary")
    
        const createdVideo = await Video.create({
            title,
            description,
            videoFile: video?.url,
            thumbnail: thumbnail?.url || "",
            duration: video?.duration ,
            owner: req?.user?._id
        })
    
        return res.status(200).json(
            new ApiResponse(200, createdVideo, "video published successfully")
        )
    } catch (error) {

        console.log("ERROR: ", error)
        throw new ApiError(500, "Something went wrong")
        
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    console.log("id: ",videoId)

    if(!videoId) throw new ApiError(400, "Video'id is missing")

    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(404, "Video not found")

    return res.status(200).json(
        new ApiResponse(200, video, "Video found sucessfully")
    )
})
const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description} = req.body

    if(!(title || description)) throw new ApiError(400, "All fields are required")
    //TODO: update video details like title, description, thumbnail

    if(!videoId) throw new ApiError(400, "video id is missing")
    
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: {title, description}
        },
        {
            new: true
        }
    )

    if(!video) throw new ApiError(404, "Video not found")
    
    return res.status(200).json(
        new ApiResponse(200, video, "Video detail updtaed successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log("delete video id", videoId)
    //TODO: delete video
    if(!videoId) throw new ApiError(400, "Video id is missing")
    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, [], "Video deleted successfully")
    )
})
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId) throw new ApiError(400, "Video id is missing")

      const video = await Video.findByIdAndUpdate(videoId, 
            {
                isPublished: !isPublished
            },
            {
                new: true
            }
        )
        if(!video) throw new ApiError(404, "Video id not exist")

            return res.status(200).json(
                ApiResponse(200, video, "Publish status updated successfully")
            )


})

export {getAllVideo, publishVideo, getVideoById, updateVideoDetails, deleteVideo, togglePublishStatus};