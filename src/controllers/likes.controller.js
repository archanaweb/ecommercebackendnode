import mongoose from "mongoose"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Like } from "../models/like.models.js"
import { ApiResponse } from "../utils/ApiResponse"


const toggleVideoLike = asyncHandler(async(req, res) => {
    const {videoId} = req.params

    if(!videoId) throw new ApiError(400, "VideoId is required")
    
    if(!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(404, 'Invalid video ID')

    const existingLike = await Like.findOne({video: videoId, likedBy: req.user?._id})

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, {isLiked: false}, "Video unliked successfully")
        )
    }

    //like video
    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

     return res.status(200).json(
            new ApiResponse(200, {isLiked: true}, "Video liked successfully")
        )
})

const getLikedVideo = asyncHandler(async (req, res) => {
    const likeVideos = Like.find({likedBy: req.user?._id})
        .populate({
            path: "video",
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        })

        return res.status(200).json(
            new ApiResponse(200, likeVideos, "Liked video fetched successfully")
        )
})

export {toggleVideoLike, getLikedVideo}