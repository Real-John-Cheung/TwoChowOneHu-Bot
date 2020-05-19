let puppeteer = require('puppeteer');
let fs = require('fs');
let qs = require('querystring');
if (process.env.NAME == undefined) {
  require('./env.js');
}

let nameList = ['huxijin','rmrb','1846816274','banyuetanwang','gmwview','breakingnews','newoutlook','huanqiushibaoguanwei','globaltimes','thepapernewsapp',
'6049590367','5521056657','xiena','hejiong','yangmiblog','3310679915','cangtoushi','822998189','phoenixnewmedia','6111313824','fhzk','suvern','tszyuen','1002224393','6616523296'];

//reference : https://gist.github.com/larry1001/5a23678482b4a868981ce5c9f6cd64a5
//            https://iter01.com/15991.html
const getDataByNickname = async function(nickname) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const pageForWeibo = await browser.newPage();
  await pageForWeibo.setViewport({
    width: 1600,
    height: 900
  });
  /*
  pageForWeibo.on('console',msg => console.log(msg.text()));
  pageForWeibo.on('request',(interceptedRequest) =>{
    let url = interceptedRequest.url();
    console.log('A request url was made: ',url);
  });
  pageForWeibo.on('response',(res) =>{
    console.log('response headers: ',res.headers());
  });
  */

  let url = 'https://www.weibo.com/' + nickname;
  await pageForWeibo.goto(url, {
    timeout: 60000
  });
  await pageForWeibo.waitForNavigation({
    waitUntil: ['load'],
    timeout: 60000
  });

  // let pageNum = getTotalPage(pageForWeibo);
  // console.log(pageNum);
  console.log('page opened');
  await pageForWeibo.addScriptTag({
    url: 'https://code.jquery.com/jquery-3.2.1.min.js'
  });
  console.log('tag added');
  await scrollToBottom(pageForWeibo);
  console.log('scrolled');
  await clickOnFulltext(pageForWeibo);
  let result = await getWeibo(pageForWeibo);
  result.comments = await getComment(pageForWeibo);


  console.log(result);

  let toWrite = JSON.stringify(result, null, 2);
  if (fs.existsSync('./gotWeibos')){

  } else {
    fs.mkdirSync('./gotWeibos');
  }
  let fileName = './gotWeibos/Weibo by ' + nickname + '.json';
  await fs.writeFileSync(fileName, toWrite);

  await browser.close();
};

const getWeiboBySearch = async function(keywords) {
  let toSearch = []
  if (typeof keywords === 'string') {
    toSearch.push(keywords);
  } else if (Array.isArray(keywords)) {
    if (typeof keywords[0] === 'string') {
      toSearch = keywords;
    } else {
      throw 'keywords need to be string/array of string';
    }
  } else {
    throw 'keywords need to be string/array of string';
  }
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox']
  });
  const pageForWeibo = await browser.newPage();
  await pageForWeibo.setViewport({
    width: 1600,
    height: 900
  });

  for (let i = 0; i < toSearch.length; i++) {
    let url = 'https://s.weibo.com/weibo?q=' + toSearch[i];
    console.log(url);
    await pageForWeibo.goto(url, {
      timeout: 120000
    });
    // await pageForWeibo.waitForNavigation({
    //   waitUntil: ['load'],
    //   timeout: 120000
    // });

    await pageForWeibo.addScriptTag({
      url: 'https://code.jquery.com/jquery-3.2.1.min.js'
    });

    await scrollToBottom(pageForWeibo);
    let result = await getWeibo(pageForWeibo);
    result.comments = await getComment(pageForWeibo);


    console.log(result);

    let toWrite = JSON.stringify(result, null, 2);
    if (fs.existsSync('./gotWeibos')){

    } else {
      fs.mkdirSync('./gotWeibos');
    }
    let fileName = './gotWeibos/Weibo related to ' + toSearch[i] + '.json';
    await fs.writeFileSync(fileName, toWrite);

  }
  await browser.close();
}

async function clickOnFulltext(pageIn) {
  let toClick = await pageIn.$$('#Pl_Official_MyProfileFeed__22 > div > div:nth-child(4) > div.WB_feed_detail.clearfix > div.WB_detail > div.WB_text.W_f14 > a');
  toClick.forEach(async element => {
    await element.click();
  });
}

async function getWeibo(pageIn) {
  const LIST_SELECTOR = 'div[action-type=feed_list_item]';
  return await pageIn.evaluate((infoDiv) => {
    $('.WB_handle span[node-type=comment_btn_text]').each(async (i, v) => {
      $(v).trigger('click')
    })
    return Array.prototype.slice.apply(document.querySelectorAll(infoDiv))
      .map($userListItem => {
        var weiboDiv = $($userListItem)
        var webUrl = 'http://weibo.com'
        var data = {
          "tbinfo": weiboDiv.attr("tbinfo"),
          "mid": weiboDiv.attr("mid"),
          "isforward": weiboDiv.attr("isforward"),
          "minfo": weiboDiv.attr("minfo"),
          "omid": weiboDiv.attr("omid"),
          "text": weiboDiv.find(".WB_detail>.WB_text").text().trim(),
          "full_text":weiboDiv.find("div[node-type=feed_list_full_content]").text().trim(),
          'link': webUrl.concat(weiboDiv.find(".WB_detail>.WB_from a").eq(0).attr("href")),
          "sendAt": weiboDiv.find(".WB_detail>.WB_from a").eq(0).attr("date")
        };

        if (data.isforward) {
          var forward = weiboDiv.find("div[node-type=feed_list_forwardContent]");

          if (forward.length > 0) {
            var forwardUser = forward.find("a[node-type=feed_list_originNick]");

            var userCard = forwardUser.attr("usercard");

            data.forward = {
              name: forwardUser.attr("nick-name"),
              id: userCard ? userCard.split("=")[1] : "error",
              text: forward.find(".WB_text").text().trim(),
              "sendAt": weiboDiv.find(".WB_detail>.WB_from a").eq(0).attr("date")
            };
          }
        }
        return data;
      });
  }, LIST_SELECTOR);
}

async function getComment(pageIn) {
  pageIn.on('response', async (res) => {
    const url = res.url();
    if (url.indexOf('small') > -1) {
      let text = await res.text();
      let mid = getQueryVariable(res.url(), 'mid');
      let delHtml = delHtmlTag(JSON.parse(text).data.html);
      let matchReg = /\：.*?(?= )/gi;
      let matchRes = delHtml.match(matchReg);
      if (matchRes && matchReg.length()) {
        let comments = [];
        matchRes.map((v) => {
          comments.push({
            mid,
            content: JSON.stringify(v.split('：')[1], null, 2)
          });
        });
        return comments;
      }
    }
  });
}

function getQueryVariable(url, variable) {
  var vars = url.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
}

function delHtmlTag(str) {
  return str.replace(/<[^>]+>/g, "");
}

async function scrollToBottom(pageIn) {
  let pageBottom = await pageIn.$("div[node-type=feed_list_page]");
  while (!pageBottom) {
    let scrollStep = 1000;
    await pageIn.evaluate((scrollStep) => {
      let scrollTop = document.scrollingElement.scrollTop;
      document.scrollingElement.scrollTop = scrollTop + scrollStep;
    }, 1000);
    //await delay(2000);
    pageBottom = await pageIn.$("div[node-type=feed_list_page]");
  }
}

async function getTotalPage(pageIn) {
  await scrollToBottom(pageIn);
  let pageInfo = await pageIn.evaluate(() => {
    let pageC = $("div[node-type=feed_list_page] div > span > a");
    let info = pageC.attr("action-data");
    return info;
  });
  let infoObject = qs.parse(pageInfo);
  return infoObject.countPage;
}

async function getWeiboWithNameList(){
  let startIndexString = fs.readFileSync('startIndex.txt','utf-8');
  let startIndex = parseInt(startIndexString,10);
  let nextStartIndex;
  let n=2
  if (startIndex+n>=nameList.length){
    nextStartIndex = 0;
  } else {
    nextStartIndex=startIndex+n;
  }
  for (let i = startIndex;i<Math.min(startIndex+n,nameList.length);i++){
    getDataByNickname(nameList[i]);
  }
  fs.writeFileSync('startIndex.txt',nextStartIndex);
}

getWeiboWithNameList();

//getWeiboBySearch('肖戰')
