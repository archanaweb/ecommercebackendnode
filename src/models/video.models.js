import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema({
    title: {
        type: String, 
        required: true,
    },
    videoFile: {
        type: String, // cloudenary url
        required: true, 
    },
    thumbnail: {
        type: String, // cloudenary url
        required: true, 
    },
    description: {
        type: String, 
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        
            type: Schema.Types.ObjectId,
            ref: "User"
        
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken:{
        type: String
    }
}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)