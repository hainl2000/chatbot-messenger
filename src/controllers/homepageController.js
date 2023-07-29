require("dotenv").config();

const verifyToken = process.env.VERIFY_TOKEN;

let getHomepage = (req, res) => {
    return res.render('homepage.ejs')
}

let getWebhook = (req, res) => {
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
        
    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === verifyToken) {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
        } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
        }
    }
}

let postWebhook = (req, res) => {
    let body = req.body;

    console.log(`\u{1F7EA} Received webhook:`);
    console.dir(body, { depth: null });
    if (body.object === "page") {
        res.status(200).send("EVENT_RECEIVED");

    } else {
        res.sendStatus(404);
    }
}


module.exports = {
    getHomepage : getHomepage,
    getWebhook : getWebhook,
    postWebhook : postWebhook,
}

