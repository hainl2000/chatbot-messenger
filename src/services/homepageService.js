import request from 'request';
require("dotenv").config();

const pageAccessToken =  process.env.PAGE_ACCESS_TOKEN;

let handleSetupProfileApi = () => {
  return new Promise((resolve, reject) => {
    try {
      let url = `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${pageAccessToken}`
      let requestBody = {
        "get_started" : {
          "payload" : "GET_STARTED"
        },
        "persistent_menu": [
          {
            "locale": "default",
            "composer_input_disabled": false,
            "call_to_actions": [
              {
                "type": "postback",
                "title": "Trò chuyện với hỗ trợ viên",
                "payload": "CARE_HELP"
              },
              {
                "type": "web_url",
                "title": "Danh sách ca khám",
                "url": "https://fastidious-cupcake-f83f7a.netlify.app/",
                "webview_height_ratio": "full"
              }
            ]
          }
        ],
        "whitelisted_domains":[
          "https://chatbot-messenger-221s.onrender.com/",
          "https://fastidious-cupcake-f83f7a.netlify.app/"
        ]
      };
      request({
        "uri": url,
        "method": "POST",
        "json": requestBody
      }, (err, res, body) => {
        if (!err) {
          resolve("OK");
        } else {
          reject("Error: " + err);
        }
      });
    } catch (e) {
      reject(e);
    }
  })
}

let sendTypingOn = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "sender_action": "typing_on"
      };

      let url = `https://graph.facebook.com/v6.0/me/messages?access_token=${pageAccessToken}`;
      request({
        "uri": url,
        "method": "POST",
        "json": request_body

      }, (err, res, body) => {
        if (!err) {
          resolve("done!");
        } else {
          reject("Unable to send message:" + err);
        }
      });

    } catch (e) {
      reject(e);
    }
  });
};

let markMessageRead = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "sender_action": "mark_seen"
      };

      let url = `https://graph.facebook.com/v6.0/me/messages?access_token=${pageAccessToken}`;
      request({
        "uri": url,
        "method": "POST",
        "json": request_body

      }, (err, res, body) => {
        if (!err) {
          resolve("done!");
        } else {
          reject("Unable to send message:" + err);
        }
      });
    } catch (e) {
      reject(e);
    }
  })
};

module.exports = {
  handleSetupProfileApi : handleSetupProfileApi,
  sendTypingOn : sendTypingOn,
  markMessageRead : markMessageRead
}

