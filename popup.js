// # Event
document.addEventListener("DOMContentLoaded", initialLoad);
document.getElementById("saveqrcodebt").addEventListener("click", saveQRCode);
document.getElementById("optionsX").addEventListener("click", showSettings);
document.getElementById("sharebt").addEventListener("click", saveSettings);
document.getElementById("qrcbt").addEventListener("click", saveSettings);
document.getElementById("darkmode").addEventListener("click", saveSettings);
document.getElementById("lightmode").addEventListener("click", saveSettings);
document.getElementById("automode").addEventListener("click", saveSettings);
document.getElementById("atcopy").addEventListener("click", saveSettings);
document.getElementById("complete").addEventListener("click", copy);
document.getElementById("copped").addEventListener("click", copy);
document.getElementById("tweetbt").addEventListener("click", shareToTW);
document.getElementById("facebookbt").addEventListener("click", shareToFB);
document.getElementById("donate").addEventListener("click", openDonate);

document.getElementById("customqrcode").addEventListener("click", openEditLabel);
document.getElementById("urlLabel").addEventListener("click", saveSettings);
document.getElementById("textLabel").addEventListener("click", saveSettings);
document.getElementById("noneLabel").addEventListener("click", saveSettings);

document.addEventListener('keyup', logKey);

// # Value
let copy_now = false;
let qrcode_url = false;
let qrcode_text = false;
let share_now = false;
let urlshort = '';

let tweetbt = '';
let facebookbt = '';
const paypalurl = 'https://paypal.me/9holo';

let token = '';
let domain = '';

let customtext = '';

function handleResponse(message) {
  switch (message.script) {
    case "token": {
      const now = new Date();
      now.setTime(now.getTime() + 336 * 3600 * 1000);
      chrome.storage.local.set(
        {
          token: message.token,
          domain: message.domain,
          expiration: now.getTime()
        },
        function () {
          token = message.token;
          domain = message.domain;
          onGot();
        }
      );
    }
      break;
    case "short": {
      setURLshorten(message.shortLink, message.title, message.link);
    }
      break;
    default:
      break;
  }
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function onGot() {
  urlshort = '';
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    let TAB_URL = tabs[0].url;
    let TITLE = tabs[0].title;
    if (TAB_URL) {
      let URL_RES = TAB_URL.substring(0, 4);
      if (URL_RES === "http") {
        chrome.runtime.sendMessage({
          script: "post_url",
          token: token,
          domain: domain,
          link: TAB_URL,
          title: TITLE,
        }, function (response) {
          handleResponse(response)
        });
      } else {
        document.getElementById("loading").style.display = "none";
        document.getElementById("faq").style.display = "inline";
        document.getElementById("noURL").style.display = "block";
        document.getElementById("shareY").style.display = "none";
        document.getElementById("qrcX").style.display = "none";
      }
    }
  });
}

function checkDNT() {
  console.log("doNotTrack", window.navigator.doNotTrack);
  let dnt = window.navigator.doNotTrack;
  if (dnt == "1") {
    document.getElementById("dnt").style.display = "block";
    document.getElementById("shareY").style.display = "none";
  } else {
    document.getElementById("shareY").style.display = "block";
    document.getElementById("dnt").style.display = "none";
  }
}

function initialLoad() {
  let manifestData = chrome.runtime.getManifest();
  let version = document.getElementById("version");

  chrome.storage.local.get(
    ["sharebutton", "qrcode", "mode", "autocopy", "qrcodeurl", "qrcodetext", "qrcodenone", "customtext", "autotheme"],
    function (result) {
      onGotX(result);
    }
  );

  chrome.storage.local.get(
    ["token", "domain", "expiration"],
    function (result) {
      if (!result.token || !result.domain) {
        chrome.runtime.sendMessage({ script: "get_token" }, function (response) {
          handleResponse(response)
        });
      } else {
        if (result.expiration < new Date().getTime()) {
          chrome.runtime.sendMessage({ script: "get_token" }, function (response) {
            handleResponse(response)
          });
        } else {
          token = result.token;
          domain = result.domain;
          onGot();
        }
      }
    }
  );

  version.textContent = manifestData.version;
}

function onGotX(items) {
  let sharebt = document.getElementById("sharebt");
  let qrcbt = document.getElementById("qrcbt");
  let darkbt = document.getElementById("darkmode");
  let lightbt = document.getElementById("lightmode");
  let autobt = document.getElementById("automode");
  let atcopy = document.getElementById("atcopy");
  let urlLabel = document.getElementById("urlLabel");
  let textLabel = document.getElementById("textLabel");
  let noneLabel = document.getElementById("noneLabel");

  customtext = items.customtext ? items.customtext : 'Scan Me';
  document.getElementById('customtext').value = customtext;
  document.getElementById('counttext').innerHTML = (15 - customtext.length).toString();

  if (items.sharebutton) {
    sharebt.checked = items.sharebutton.value;
    if (items.sharebutton.value) {
      // show_button.style.display = "block";
      share_now = true;
    } else {
      // show_button.style.display = "none";
      share_now = false;
    }
  } else {
    sharebt.checked = true;
    share_now = true;
  }

  if (items.qrcode) {
    qrcbt.checked = items.qrcode.value;
    let show_qrc = document.getElementById("qrcX");
    if (items.qrcode.value) {
      show_qrc.style.display = "block";
      document.getElementById("customqrcode").style.display = "block";
    } else {
      show_qrc.style.display = "none";
      document.getElementById("customqrcode").style.display = "none";
    }
  } else {
    qrcbt.checked = true;
  }



  if (items.autotheme) {
    autobt.checked = items.autotheme.value;
    if (items.autotheme.value) {
      document.getElementById("theme").classList.remove("darkmode");
      document.getElementById("btnthemeauto").classList.add("active");

      const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
      if (darkThemeMq.matches) {
        document.getElementById("theme").classList.add("darkmode");
        document.getElementById("btnthemeauto").classList.add("btn-dark");
        document.getElementById("btnthemelight").classList.add("btn-dark");
        document.getElementById("btnthemedark").classList.add("btn-dark");
      } else {
        document.getElementById("theme").classList.remove("darkmode");
        document.getElementById("btnthemeauto").classList.add("btn-light");
        document.getElementById("btnthemelight").classList.add("btn-light");
        document.getElementById("btnthemedark").classList.add("btn-light");
      }

    } else {
      if (items.mode) {
        if (items.mode.value) {
          darkbt.checked = items.mode.value;
          document.getElementById("theme").classList.add("darkmode");
          document.getElementById("btnthemeauto").classList.add("btn-dark");
          document.getElementById("btnthemelight").classList.add("btn-dark");
          document.getElementById("btnthemedark").classList.add("btn-dark");

          document.getElementById("btnthemedark").classList.add("active");
        } else {
          lightbt.checked = true;
          document.getElementById("theme").classList.remove("darkmode");
          document.getElementById("btnthemeauto").classList.add("btn-light");
          document.getElementById("btnthemelight").classList.add("btn-light");
          document.getElementById("btnthemedark").classList.add("btn-light");

          document.getElementById("btnthemelight").classList.add("active");
        }
      }
    }
  } else {
    document.getElementById("btnthemeauto").classList.add("btn-light");
    document.getElementById("btnthemelight").classList.add("btn-light");
    document.getElementById("btnthemedark").classList.add("btn-light");

    document.getElementById("btnthemeauto").classList.add("active");

    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkThemeMq.matches) {
      document.getElementById("theme").classList.add("darkmode");
      document.getElementById("btnthemeauto").classList.add("btn-dark");
      document.getElementById("btnthemelight").classList.add("btn-dark");
      document.getElementById("btnthemedark").classList.add("btn-dark");
    } else {
      document.getElementById("theme").classList.remove("darkmode");
      document.getElementById("btnthemeauto").classList.add("btn-light");
      document.getElementById("btnthemelight").classList.add("btn-light");
      document.getElementById("btnthemedark").classList.add("btn-light");
    }

    autobt.checked = true;
  }

  if (items.autocopy) {
    atcopy.checked = items.autocopy.value;
    if (items.autocopy.value) {
      atcopy.checked = true;
      copy_now = true;
    } else {
      atcopy.checked = false;
      copy_now = false;
    }
  } else {
    atcopy.checked = true;
    copy_now = true;
  }

  if (items.qrcodeurl) {
    urlLabel.checked = items.qrcodeurl.value;
    if (items.qrcodeurl.value) {
      urlLabel.checked = true;
      qrcode_url = true;
    } else {
      urlLabel.checked = false;
      qrcode_url = false;
    }
  } else {
    urlLabel.checked = true;
    qrcode_url = true;
  }

  if (items.qrcodetext) {
    textLabel.checked = items.qrcodetext.value;
    const element = document.getElementById('customtext');

    if (items.qrcodetext.value) {
      textLabel.checked = true;
      element.removeAttribute('disabled');
      qrcode_text = true;
    } else {
      textLabel.checked = false;
      element.setAttribute('disabled', '');
      qrcode_text = false;
    }
  } else {
    urlLabel.checked = true;
    qrcode_url = true;
  }

  if (items.qrcodenone) {
    noneLabel.checked = items.qrcodenone.value;
    if (items.qrcodenone.value) {
      noneLabel.checked = true;
    } else {
      noneLabel.checked = false;
    }
  } else {
    urlLabel.checked = true;
  }

}

function setURLshorten(shtURL, title, LgURL) {
  let input = document.getElementById("url");
  if (shtURL && shtURL != undefined && shtURL.includes("https")) {
    let shtURLcut;
    urlshort = shtURL.slice(8);
    shtURLcut = shtURL;

    hide();
    input.value = shtURLcut;
    if (copy_now) {
      copy();
    }
    if (share_now) {
      document.getElementById("shareY").style.display = "block";
    }
    share(shtURLcut, title, LgURL);
    genQRC(shtURL);
    input.blur();
  } else {
    document.getElementById("loading").style.display = "none";
    document.getElementById("faq").style.display = "inline";
    document.getElementById("errorservice").style.display = "block";
    document.getElementById("shareY").style.display = "none";
    document.getElementById("qrcX").style.display = "none";
  }
}

function genQRC(url) {
  var canvas = document.getElementById("qrcode-canvas");
  var QRC = qrcodegen.QrCode;
  var qr0 = QRC.encodeText(url, QRC.Ecc.MEDIUM);
  var scale = 15;
  qr0.drawCanvas(scale, 1, canvas);
  canvas.style.removeProperty("display");
}

function copy() {
  let complete = document.getElementById("complete");
  let copped = document.getElementById("copped");

  let copyText = document.querySelector("#url");

  complete.style.display = "none";
  copped.style.display = "inline";

  copyText.select();
  document.execCommand("copy");
}

function hide() {
  let load = document.getElementById("loading");
  let complete = document.getElementById("complete");

  load.style.display = "none";
  complete.style.display = "inline";
}

function share(shtURL, title_o, lgURL) {
  let title = encodeURI(title_o);
  let url = encodeURI(shtURL);

  tweetbt =
    "https://twitter.com/intent/tweet?size=m&url=" +
    shtURL +
    "&related=9holotpk&text=" +
    title;

  facebookbt = "https://www.facebook.com/sharer/sharer.php?u=" + lgURL;
}

function shareToTW() {
  chrome.tabs.create({
    url: tweetbt
  });
}

function shareToFB() {
  chrome.tabs.create({
    url: facebookbt
  });
}

function openDonate() {
  chrome.tabs.create({
    url: paypalurl
  });
}

function showSettings() {
  document.getElementById("formEditLabel").style.display = "none";
  document.getElementById("navEditLabel").style.display = "none";
  var x = document.getElementById("formSettings");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function gotoAbout() {
  window.open(
    "about:addons",
    "_blank" // <- This is what makes it open in a new window.
  );
}

function saveSettings() {
  let sharebt = document.getElementById("sharebt").checked;
  let show_button = document.getElementById("shareY");
  let qrcbt = document.getElementById("qrcbt").checked;
  let show_qrc = document.getElementById("qrcX");
  let darkbt = document.getElementById("darkmode").checked;
  let lightbt = document.getElementById("lightmode").checked;
  let autobt = document.getElementById("automode").checked;
  let atcopy = document.getElementById("atcopy").checked;
  let urlLabel = document.getElementById("urlLabel").checked;
  let textLabel = document.getElementById("textLabel").checked;
  let noneLabel = document.getElementById("noneLabel").checked;


  if (qrcbt) {
    show_qrc.style.display = "block";
    document.getElementById("customqrcode").style.display = "block";
  } else {
    show_qrc.style.display = "none";
    document.getElementById("customqrcode").style.display = "none";
  }

  if (darkbt) {
    document.getElementById("theme").classList.add("darkmode");
    document.getElementById("btnthemeauto").classList.add("btn-dark");
    document.getElementById("btnthemeauto").classList.remove("btn-light");
    document.getElementById("btnthemelight").classList.add("btn-dark");
    document.getElementById("btnthemelight").classList.remove("btn-light");
    document.getElementById("btnthemedark").classList.add("btn-dark");
    document.getElementById("btnthemedark").classList.remove("btn-light");

    document.getElementById("btnthemedark").classList.add("active");
    document.getElementById("btnthemelight").classList.remove("active");
    document.getElementById("btnthemeauto").classList.remove("active");
  }

  if (lightbt) {
    document.getElementById("theme").classList.remove("darkmode");
    document.getElementById("btnthemeauto").classList.remove("btn-dark");
    document.getElementById("btnthemeauto").classList.add("btn-light");
    document.getElementById("btnthemelight").classList.remove("btn-dark");
    document.getElementById("btnthemelight").classList.add("btn-light");
    document.getElementById("btnthemedark").classList.remove("btn-dark");
    document.getElementById("btnthemedark").classList.add("btn-light");

    document.getElementById("btnthemedark").classList.remove("active");
    document.getElementById("btnthemelight").classList.add("active");
    document.getElementById("btnthemeauto").classList.remove("active");
  }

  if (autobt) {
    document.getElementById("btnthemedark").classList.remove("active");
    document.getElementById("btnthemelight").classList.remove("active");
    document.getElementById("btnthemeauto").classList.add("active");
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkThemeMq.matches) {
      document.getElementById("theme").classList.add("darkmode");
      document.getElementById("btnthemeauto").classList.add("btn-dark");
      document.getElementById("btnthemeauto").classList.remove("btn-light");
      document.getElementById("btnthemelight").classList.add("btn-dark");
      document.getElementById("btnthemelight").classList.remove("btn-light");
      document.getElementById("btnthemedark").classList.add("btn-dark");
      document.getElementById("btnthemedark").classList.remove("btn-light");
    } else {
      document.getElementById("theme").classList.remove("darkmode");
      document.getElementById("btnthemeauto").classList.remove("btn-dark");
      document.getElementById("btnthemeauto").classList.add("btn-light");
      document.getElementById("btnthemelight").classList.remove("btn-dark");
      document.getElementById("btnthemelight").classList.add("btn-light");
      document.getElementById("btnthemedark").classList.remove("btn-dark");
      document.getElementById("btnthemedark").classList.add("btn-light");
    }
  }

  if (textLabel) {
    const element = document.getElementById('customtext');
    element.removeAttribute('disabled');
  } else {
    const element = document.getElementById('customtext');
    element.setAttribute('disabled', '');
  }

  if (sharebt) {
    show_button.style.display = "block";
  } else {
    show_button.style.display = "none";
  }
  var sharebutton = {
    name: "Facebook, Twitter",
    value: sharebt,
  };
  var qrcode = {
    name: "QR Code",
    value: qrcbt,
  };

  var mode = {
    name: "Mode",
    value: darkbt,
  };

  var autocopy = {
    name: "autocopy",
    value: atcopy,
  };

  var qrcodeurl = {
    name: "qrcodeurl",
    value: urlLabel,
  };

  var qrcodetext = {
    name: "qrcodetext",
    value: textLabel,
  };

  var qrcodenone = {
    name: "qrcodenone",
    value: noneLabel,
  };

  var autotheme = {
    name: "autotheme",
    value: autobt
  };

  // store the objects
  chrome.storage.local.set(
    {
      sharebutton: sharebutton,
      qrcode: qrcode,
      mode: mode,
      autocopy: autocopy,
      qrcodeurl: qrcodeurl,
      qrcodetext: qrcodetext,
      qrcodenone: qrcodenone,
      autotheme: autotheme
    },
    function () {
      // console.log('Save', mode);
    }
  );
}

function saveQRCode() {
  var canvas = document.getElementById("qrcode-canvas");
  var gh = '';

  if (qrcode_url || qrcode_text) {
    let displaytext = qrcode_url ? urlshort : customtext;
    var canvas_draft = document.getElementById("qrcode-canvas-draft");
    var context = canvas_draft.getContext("2d");

    canvas_draft.width = 410;
    canvas_draft.height = 450;

    context.fillStyle = "white";
    context.fillRect(0, 0, 410, 450);
    context.drawImage(canvas, 2.5, 2.5);

    context.font = "20pt monospace";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.fillText(displaytext, 202, 430);

    gh = canvas_draft.toDataURL('png');
  } else {
    gh = canvas.toDataURL('png');
  }

  var a = document.createElement('a');
  a.href = gh;
  a.download = urlshort + '.png';

  a.click()
}

function openEditLabel() {
  document.getElementById("formEditLabel").style.display = "block";
  document.getElementById("formSettings").style.display = "none";
  document.getElementById("navEditLabel").style.display = "inline";
}

function logKey(e) {
  const textValue = document.getElementById('customtext').value;
  chrome.storage.local.set(
    {
      customtext: textValue,
    },
    function () {
      customtext = textValue ? textValue : 'Scan Me';
      document.getElementById('counttext').innerHTML = (15 - customtext.length).toString();
    }
  );
}
