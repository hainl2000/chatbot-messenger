import express from "express";
import homepageController from "../controllers/homepageController";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.get("/webhook", homepageController.getWebhook);
    router.post("/webhook", homepageController.postWebhook);

    router.post("/set-up-profile", homepageController.handleSetupProfile);
    router.get("/set-up-profile", homepageController.getSetupProfilePage);


    return app.use('/', router);
}
module.exports = initWebRoutes