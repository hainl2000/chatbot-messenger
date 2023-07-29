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
     // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
        
        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

// Handles messages events
let handleMessage = (sender_psid, received_message) => {

}

// Handles messaging_postbacks events
let handlePostback = (sender_psid, received_postback) => {

}

// Sends response messages via the Send API
let callSendAPI = (sender_psid, response) => {
  
}


module.exports = {
    getHomepage : getHomepage,
    getWebhook : getWebhook,
    postWebhook : postWebhook,
}

