// DEV. EXTENTION BY iTON // => POPUP.JS
// NOTE:    Click to Shorten URL
// UPDATE:  13/06/2018  - Copy Add-On from SHT-FF ver. 1.3.1
//                      - Edit and Optimize for Opera Add-On.


// # Event
document.getElementById('optionsX').addEventListener('click', show_options);
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('tag').addEventListener('click', save_optionsX);
document.getElementById('sharebt').addEventListener('click', save_optionsX);

// # Value
let w_hashtags = "&hashtags=iShortener";

// # Onload
onGot();

function onGot(page) {
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    TAB_URL = tabs[0].url;
    TITLE = tabs[0].title;
    if (TAB_URL) {
      let URL_RES = TAB_URL.substring(0, 4);
      if (URL_RES === 'http') {
        const getting = chrome.extension.getBackgroundPage();
        getting.shortenLink(TAB_URL, TITLE);
        

      } else {
        let load = document.getElementById("loading");
        let faq = document.getElementById("faq");
        let noURL = document.getElementById("noURL");
        let share = document.getElementById("shareX");

        load.style.display = "none";
        faq.style.display = "inline";
        share.style.display = "none";
        noURL.style.display = "block";
      }
    }
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender) {
    let resultSht = request;
    if(resultSht.shortLink){
      setURLshorten(resultSht.shortLink, resultSht.title);
    }
  }
);

function restore_options() { 
  let manifestData = chrome.runtime.getManifest();
  let version = document.getElementById('version');
  chrome.storage.local.get(['twitterTag','sharebutton'], function(result){
    onGotX(result);
  });

  version.textContent = '「 ver. ' + manifestData.version + ' 」';
  
}

function onGotX(items) {
  let tag = document.getElementById('tag');
  let sharebt = document.getElementById('sharebt');
  if (items.twitterTag) {
    tag.checked = items.twitterTag.value;
    if (items.twitterTag.value == true) {
      w_hashtags = "&hashtags=iShortener";
    } else {
      w_hashtags = '';
    }
  } else {
    tag.checked = true;
  }
  if (items.sharebutton) {
    sharebt.checked = items.sharebutton.value;
    let show_button = document.getElementById('shareX');
    if (items.sharebutton.value) {
      show_button.style.display = "block";
    } else {
      show_button.style.display = "none";
    }
  } else {
    sharebt.checked = true;
  }    
}


function setURLshorten(shtURL, title) {
  let input = document.getElementById("url");
  if (shtURL != undefined) {
    // console.log(shtURL);
    hide();
    input.value = shtURL;
    copy();
    share(shtURL, title);
  }
}

function copy() {
  // console.log(document.getElementById("url").value);
  let copyText = document.querySelector("#url");
  copyText.select();
  document.execCommand("copy");
}

function hide() {
  let load = document.getElementById("loading");
  let complete = document.getElementById("complete");

  load.style.display = "none";
  complete.style.display = "inline";
}

function share(shtURL, title_o) {
  let title = encodeURI(title_o)
  let url = encodeURI(shtURL);
  let tweet = document.getElementById("tweet");
  let facebook = document.getElementById("facebook");
  let hashtags = w_hashtags;
  tweet.src = "https://platform.twitter.com/widgets/tweet_button.html?size=m&url=" + shtURL + "&related=9holotpk&text=" + title + hashtags;
  document.getElementsByTagName('iframe')[1].parentNode.appendChild(tweet);

  facebook.src = "https://www.facebook.com/plugins/share_button.php?href=" + shtURL + "&layout=button&size=small&mobile_iframe=true&width=60&height=20&appId";
  document.getElementsByTagName('iframe')[0].parentNode.appendChild(facebook);
}


function show_options() {
  var x = document.getElementById("myDIV");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function save_optionsX() {
  let tag = document.getElementById('tag').checked;
  let sharebt = document.getElementById('sharebt').checked;
  let show_button = document.getElementById('shareX');

  if (sharebt) {
    show_button.style.display = "block";
  } else {
    show_button.style.display = "none";
  }
  // define objects
  var twitterTag = {
    name: "#",
    value: tag,
  }
  var sharebutton = {
    name: "Facebook, Twitter",
    value: sharebt,
  }
  // store the objects
  chrome.storage.local.set({'twitterTag': twitterTag, 'sharebutton': sharebutton}, function(){
    // console.log('Save');
  });
}

function setItem() {
  // console.log("OK");
}

function onError(error) {
  console.log(`Error: ${error}`);
}



