import mongoose from "mongoose"
import asyncHandler from "../utils/asyncHandler"
import { Comment } from "../models/comment.models"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit=10} = req.query

    const skip = (page - 1) * limit

    const comments = await Comment.find({video: videoId})
        .populate("owner", "username avatar").skip(skip).limit(limit)

    if(!comments) throw new ApiError(400, "video Id is not found")
    const totalComments = await Comment.countDocuments({video: videoId})
    
    return res.status(200).json(
        new ApiResponse(200, comments, "Comments found successfully")
    )
})

const addComments = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {videoId} = req.param
    if(!content?.trim()) throw new ApiError(400, "comment content is required")
    const comments = await Comment.create(
        {
            content: content.trim(),
            video: videoId,
            owner: req.user?._id
        }
    )
    const createdComment = await Comment.findById(comments._id)
        .populate("owner", "username avatar")


    return req.status(200).json(new ApiResponse(200, createdComment, "comment added successfully"))
})

const updateComents = asyncHandler(async(req, res) => {
    const {commentId} = req.param
    if(!commentId) throw new ApiError(400, "CommentId is missing")
        const {content} = req.body
    if(!content?.trim()) throw new ApiError(400, "comment content is required")
        const comment = await Comment.findById(commentId)
    if(!comment) throw new ApiError(400, "comment not found")

        // check ownership
        if(comment.owner.toString() !== req.user._id.toString()) throw new ApiError(404, "Unauthorize user for update comment")

        comment.content = content.trim();
        await comment.save()

        const updatedComment = await comment.findById(comment._id)
            .populate("owner", "username avatar")

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "comment updtated successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.param

    if(!commentId) throw new ApiError(400, "commentId is missing")
        
        const comment = await Comment.findById(commentId)
    if(!comment) throw new ApiError(400, "comment not found")

    //check ownership

    if(comment.owner.toString() !== req?.user?._id.toString()) throw new ApiError(404, "Unauthorize user delete request")

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(200, {success: true}, "comment deleted successfully")
    )
})

export {getVideoComments, addComments, updateComents, deleteComment}