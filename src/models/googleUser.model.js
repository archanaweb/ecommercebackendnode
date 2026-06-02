import mongoose, { Schema } from "mongoose";

const googleUserSchema = new Schema({
    username: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        index: true
    },
    email: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
    },
    fullName: {
        type: String, 
        required: true,
        trim: true
    },
    avatar: {
        type: String, // cloudenary url
        required: true,
    },
}, {timestamps: true})

export const GoogleUser = mongoose.model('GoogleUser', googleUserSchema)