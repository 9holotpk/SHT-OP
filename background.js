let TAB_URL = '';
let TITLE = '';
const API_GET_KEY = "https://us-central1-url-shortener-x.cloudfunctions.net/getKey";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.hasOwnProperty("script")) {
    switch (request.script) {
      case "get_token": {
        const url = API_GET_KEY;
        fetch(url)
          .then(response => response.text())
          .then(response => {
            const message = {
              script: 'token',
              token: JSON.parse(response).key,
              domain: JSON.parse(response).domain
            };
            sendResponse(message);
          })
          .catch()
        return true;
      }
      case "post_url": {
        const url = request.token;
        fetch(url, {
          method: 'post',
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({
            "dynamicLinkInfo": {
              "dynamicLinkDomain": request.domain,
              "link": request.link
            },
            "suffix": {
              "option": "SHORT"
            }
          })
        })
          .then(response => response.text())
          .then(response => {
            const message = {
              script: 'short',
              shortLink: JSON.parse(response).shortLink,
              title: request.title,
              link: request.link
            };
            sendResponse(message);
          })
          .catch()
        return true;
      }
    }
  }
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { schemes: ['https', 'http'] }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

function onError(error) {
  console.log(`Error: ${error}`);
}



