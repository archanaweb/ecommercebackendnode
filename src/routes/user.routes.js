import { Router } from "express";
import { changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getUserWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updatedAccountDetails, 
    updateUserAvatar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlewear.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
        
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//Secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updatedAccountDetails)
router.route("/update-avatar").patch(verifyJWT, 
    upload.single("avatar"), 
    updateUserAvatar
)

router.route("/user-channel/:username").get(verifyJWT, getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getUserWatchHistory)





export default router