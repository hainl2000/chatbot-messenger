require("dotenv").config();
import request from "request";
import homepageService from "./homepageService";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SECONDARY_RECEIVER_ID = process.env.SECONDARY_RECEIVER_ID;
const PRIMARY_RECEIVER_ID = process.env.FACEBOOK_APP_ID;

let sendMessageWelcomeNewUser = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("send new user");
      //send text message
      let response1 = {
        "text": `Chào mừng bạn tới hệ thống!`
      };

      //send a quick reply
      let response2 = {
        "text": "Tôi có thể giúp gì bạn?",
        "quick_replies": [
          {
            "type": "web_url",
            "title": "Danh sách ca khám",
            "url": "https://fastidious-cupcake-f83f7a.netlify.app/",
            "webview_height_ratio": "full"
          },
          {
            "content_type": "text",
            "title": "Trò chuyện với hỗ trợ viên",
            "payload": "CARE_HELP",
          },
          {
            "content_type": "text",
            "title": "Quay lại với bot",
            "payload": "RESTART_CONVERSATION",
          }
        ]
      };

      await sendMessage(sender_psid, response1);
      await sendMessage(sender_psid, response2);
      resolve("done");
    } catch (e) {
      reject(e);
    }
  });
};

let sendMessage = (sender_psid, response) => {
  return new Promise(async (resolve, reject) => {
    try {
      await homepageService.markMessageRead(sender_psid);
      await homepageService.sendTypingOn(sender_psid);

      // Construct the message body
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      };

      // Send the HTTP request to the Messenger Platform
      request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          resolve('message sent!')
        } else {
          reject("Unable to send message:" + err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

let requestTalkToAgent = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      //send a text message
      let response1 = {
        "text": "Bạn vui lòng đợi chút, sẽ có hỗ trợ viên đến giúp bạn ngay ạ!"
      };

      await sendMessage(sender_psid, response1);

      //change this conversation to page inbox
      let app = "page_inbox"
      await passThreadControl(sender_psid, app);
      resolve("done");
      console.log("chuyen qua ho tro vien")
    } catch (e) {
      console.log("htv: " + e);
      reject(e);
    }
  });
};

let passThreadControl = (sender_psid, app) => {
  return new Promise((resolve, reject) => {
    try {
      let target_app_id = "";
      let metadata = "";

      if(app === "page_inbox"){
        target_app_id = SECONDARY_RECEIVER_ID;
        metadata = "Pass thread control to inbox chat";
      }
      if(app === "primary"){
        target_app_id = PRIMARY_RECEIVER_ID;
        metadata = "Pass thread control to the bot, primary app";
      }
      // Construct the message body
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "target_app_id": target_app_id,
        "metadata": metadata
      };

      // Send the HTTP request to the Messenger Platform
      request({
        "uri": "https://graph.facebook.com/v6.0/me/pass_thread_control",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          resolve('message sent!')
        } else {
          reject("Unable to send message:" + err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

let backToMainMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = {
        "text": "Tôi có thể giúp gì bạn?",
        "quick_replies": [
          {
            "type": "web_url",
            "title": "Danh sách ca khám",
            "url": "https://fastidious-cupcake-f83f7a.netlify.app/",
            "webview_height_ratio": "full"
          },
          {
            "content_type": "text",
            "title": "Trò chuyện với hỗ trợ viên",
            "payload": "CARE_HELP",
          },
          {
            "content_type": "text",
            "title": "Quay lại với bot",
            "payload": "RESTART_CONVERSATION",
          }
        ]
      };
      await sendMessage(sender_psid, response);
      resolve("done");
    } catch (e) {
      reject(e);
    }
  });
};

let takeControlConversation = (sender_psid) =>{
  return new Promise((resolve, reject) => {
    try {
      // Construct the message body
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "metadata": "Pass this conversation from page inbox to the bot - primary app"
      };

      // Send the HTTP request to the Messenger Platform
      request({
        "uri": "https://graph.facebook.com/v6.0/me/take_thread_control",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, async (err, res, body) => {
        if (!err) {
          //send messages
          await sendMessage(sender_psid, {"text": "Siêu bot trở lại !!!"});
          await backToMainMenu(sender_psid);
          resolve('message sent!')
        } else {
          reject("Unable to send message:" + err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  sendMessage : sendMessage,
  sendMessageWelcomeNewUser : sendMessageWelcomeNewUser,
  requestTalkToAgent : requestTalkToAgent,
  takeControlConversation : takeControlConversation
}