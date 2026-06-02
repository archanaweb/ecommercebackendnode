import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewear.js";
import { deleteVideo, getAllVideo, getVideoById, publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/allVideos").get(verifyJWT, getAllVideo)
router.route("/video/:videoId").get(verifyJWT, getVideoById)
router.route("/deleteVideo/:videoId").delete(verifyJWT, deleteVideo)
router.route("/publish").post( verifyJWT, upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    }, 
    {
        name: "thumbnail",
        maxCount: 1
    }
]) ,publishVideo)

export default router