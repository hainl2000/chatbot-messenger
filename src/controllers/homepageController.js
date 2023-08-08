require("dotenv").config();
import request from 'request';
import homepageService from '../services/homepageService'
import chatbotService from '../services/chatbotService'

const verifyToken = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN =  process.env.PAGE_ACCESS_TOKEN;

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

            let sender_psid = webhook_event.sender.id;

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
      if (payload === "CARE_HELP") {
        await chatbotService.requestTalkToAgent(sender_psid);
      }

      return;
    }

    let response;

    // Check if the message contains text
    if (received_message.text) {
      console.log(received_message.text);
      let processResponse = await processInput(received_message.text);
      console.log(processResponse);

      // Create the payload for a basic text message
      if (!processResponse) {
        response = {
          "text": `Xin lỗi hiện tôi chưa thể xử lý thông tin này. Bạn có thể gọi hỗ trợ viên để giúp đỡ.`
        }
      }
      response = {
        "text": `${received_message.text}`
      }
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      response = {
        "text": `Xin lỗi tôi chưa thể xử lý ảnh. Bạn có thể gọi hỗ trợ viên để giúp đỡ.`
      }
    }

    // Sends the response message
    await chatbotService.sendMessage(sender_psid, response);
}

let processInput = async (input) => {
  const apiUrl = 'https://api.wit.ai/message';
  const apiKey = process.env.WIT_KEY;
  const queryParams = {
    q: input,
  };

  const headers = {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json', // Replace with the appropriate content type if needed
  };

  const options = {
    headers: headers,
    qs: queryParams,
  };

  let dataHandle;

  request.get(apiUrl, options, (err, res, body) => {
    if (err) { return console.log(err); }
    dataHandle = body;
  })
  return dataHandle;
}

// Handles messaging_postbacks events
let handlePostback = async (sender_psid, received_postback) => {
  
    // Get the payload for the postback
    let payload = received_postback.payload;
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
  getHomepage : getHomepage,
  getWebhook : getWebhook,
  postWebhook : postWebhook,
  handleSetupProfile : handleSetupProfile,
  getSetupProfilePage : getSetupProfilePage
}

