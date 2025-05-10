import { Router } from "express";
import {addActivity, getAllActivity, bookActivity } from "../controllers/activity.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()



router.route("/add-activity").post(verifyJWT, addActivity)

router.route("/book-activity/:activity_id").post(verifyJWT, bookActivity)

router.route("/get-all-activity").get(verifyJWT, getAllActivity)



export default router