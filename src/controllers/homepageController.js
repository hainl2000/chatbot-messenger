require("dotenv").config();
import request from 'request';
import homepageService from '../services/homepageService'
import chatbotService from '../services/chatbotService'

const verifyToken = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN =  process.env.PAGE_ACCESS_TOKEN;

let test = (req, res) => {
  request('http://www.google.com', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body); // Print the google web page.
    }
  });
}

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

let postWebhook = async (req, res) => {
     // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

          if (entry.standby) {
            //if user's message is "back" or "exit", return the conversation to the bot
            let webhook_standby = entry.standby[0];
            if (webhook_standby && webhook_standby.message) {
              if (webhook_standby.message.text === "back" || webhook_standby.message.text === "exit") {
                // call function to return the conversation to the primary app
                chatbotService.takeControlConversation(webhook_standby.sender.id);
              }
            }

            return;
          }

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
              } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
              }
        
        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

// Handles messages events
let handleMessage = async (sender_psid, received_message) => {

    if (received_message && received_message.quick_reply && received_message.quick_reply.payload) {
      let payload = received_message.quick_reply.payload;
      console.log('payload' , payload);
      if (payload === "CARE_HELP") {
        await chatbotService.requestTalkToAgent(sender_psid);
      }

      return;
    }

    let response;

    // Check if the message contains text
    if (received_message.text) {

      // Create the payload for a basic text message
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an image!`
      }
    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [{
                "title": "Is this the right picture?",
                "subtitle": "Tap a button to answer.",
                "image_url": attachment_url,
                "buttons": [
                  {
                    "type": "postback",
                    "title": "Yes!",
                    "payload": "yes",
                  },
                  {
                    "type": "postback",
                    "title": "No!",
                    "payload": "no",
                  }
                ],
              }]
            }
          }
        }
      }

    // Sends the response message
    await chatbotService.sendMessage(sender_psid, response);
}

// Handles messaging_postbacks events
let handlePostback = async (sender_psid, received_postback) => {
  
    // Get the payload for the postback
    let payload = received_postback.payload;
    console.log("paayload 2" , payload);
    switch (payload) {
      case "GET_STARTED":
      case "RESTART_CONVERSATION":
        await chatbotService.sendMessageWelcomeNewUser(sender_psid);
        break;
      case "CARE_HELP":
        await chatbotService.requestTalkToAgent(sender_psid);
        break;
      default:
        console.log("run default switch");
    }
}

let handleSetupProfile = async (req, res) => {
  try {
    await homepageService.handleSetupProfileApi();
    return res.redirect("/");
  } catch (e) {
    console.log(e);
  }
}

let getSetupProfilePage = (req, res) => {
  return res.render('profile.ejs');
}


module.exports = {
  test: test,
  getHomepage : getHomepage,
  getWebhook : getWebhook,
  postWebhook : postWebhook,
  handleSetupProfile : handleSetupProfile,
  getSetupProfilePage : getSetupProfilePage
}

