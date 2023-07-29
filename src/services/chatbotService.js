require("dotenv").config();
import request from "request";
import homepageService from "./homepageService";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let sendMessageWelcomeNewUser = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      //send text message
      let response1 = {
        "text": `Chào mừng bạn tới hệ thống!`
      };

      //send an image
      let response2 = {
        "attachment": {
          "type": "image",
          "payload": {
            "url": "https://bit.ly/imageWelcome"
          }
        }
      };

      let response3 = {
        "text": "Bất kể lúc nào, bạn có thể sử dụng menu để tìm dịch vụ mong muốn"
      };

      //send a quick reply
      let response4 = {
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
        ]
      };

      await sendMessage(sender_psid, response1);
      await sendMessage(sender_psid, response2);
      await sendMessage(sender_psid, response3);
      await sendMessage(sender_psid, response4);
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

module.exports = {
  sendMessage : sendMessage,
  sendMessageWelcomeNewUser : sendMessageWelcomeNewUser
}