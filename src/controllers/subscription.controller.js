import mongoose from "mongoose"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriberId = req.user._id

    //check valid channel id
    if(!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400, "Invalid chanel ID")

    // user cannot subscribe himself 
    if(subscriberId.toString() === channelId) throw new ApiError(400, "You cannot subscribe your own channel")

    // check existing subscription
    const alreadySubscribed = await Subscription.findOne({
        subscribers: subscriberId,
        channel: channelId
    })
    
    if(alreadySubscribed) {
        await Subscription.findByIdAndDelete(alreadySubscribed._id)
        return res.status(200).json(
            ApiResponse(200, {subscribed: false}, "Channel unsubscribe successfully")
        )
    }
    
    await Subscription.create({
        subscribers: subscriberId,
        channel: channelId
    });
    return res.status(200).json(
        ApiResponse(200, {subscribed: false}, "Channel subscribed successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    //check valid channel id
    if(!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400, "Invalid chanel ID")

    // aggregation pipeline
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        // get subscriber user details
        {
            $lookup: {
                from: "users",
                localField: "subscribers",
                foreignField: "_id",
                as: "subscriberDetail"
            }
        }, 
        {
            $unwind: "$subscriberDetail"
        },

        // return required fieldsonly
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberDetail._id",
                username: "$subscriberDetail.username",
                fullName: "$subscriberDetail.fullName",
                avatar: "$subscriberDetail.avatar",
            }
        }
    ])

    // const channelSubscriber = await Subscription.find({channel: channelId})
    // if(channelSubscriber.length === 0){
    //     throw new ApiError(400, "Channel subcriber not found List not found")
    // }

    // const totalChannelSubscriber = await Subscription.countDocuments({channel: channelId})
    // if(!totalChannelSubscriber) throw new ApiError(400, "Channel subscriber count not found")

        return res.status(200).json(
            ApiResponse(200, {totalSbscriber: subscribers.length, subscribers}, "Channel total subscriber fetched successfully")
        )
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    //check valid subscriber id
    if(!mongoose.Types.ObjectId.isValid(channelId)) throw new ApiError(400, "Invalid subscribe ID")

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {subscribers: new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        }, 
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: 0,
                channelId: "$channelDetails._id",
                username: "$channelDetails.username",
                fullName: "$channelDetails.fullName",
                avatar: "$channelDetails.avatar",
            }
        }
    ])
    return res.status(200).json(
        ApiResponse(200, {totalChannelSubscribed: subscribedChannels.length, subscribedChannels}, "Subcribed channel fetched successfully")
    )

})

export {getSubscribedChannels, getUserChannelSubscribers, toggleSubscription}