let rita = require('rita');
//let ritav2 = require('./rita-node.js');
let fs = require('fs');
let path = require('path');
let weiboPost = require('./weibo-post.js');
let n = 4;

if (process.env.COOKIE == undefined){
  require('./env.js');
}
let cookie= process.env.COOKIE;

let weiboDir = './gotWeibos';
let weiboFiles = fs.readdirSync(weiboDir);


let weibos = [];

async function generateTextFromWeibo() {
  if (weiboFiles.length < 1) {
    console.log('error,no weibo in the dir');
    //process.exit(1);
  }
  let rm = new rita.RiMarkov(n);
  for (let i = 0; i < weiboFiles.length; i++) {
    console.log('loading file ' + (i + 1));
    let fileName = weiboFiles[i];
    console.log(fileName);
    let pathTofile = './gotWeibos/'+fileName;
    let content = fs.readFileSync(pathTofile);
    content = JSON.parse(content);
    let text = [];
    for (let j = 0; j< content.length;j++){
      let t = content[j].text;
      t=t.replace('的微博视频', '');
      t=t.replace(' ​​​​...展开全文c', '');
      t=t.replace('展开全文c','');
      t=t.replace('【','');
      t=t.replace('】','');
      t=t.replace('公示链接：O微博抽奖平台对本次抽奖进行监督，结果公正有效','');
      t=t.replace('光明网评论员','');
      t=t.replace('网页链接','');
      t=t.replace(/L[一-龥]+/,'');
      text.push(t);
      if (content[j].forward){
        let t2=content[j].forward.text;
        t2=t2.replace('的微博视频', '');
        t2=t2.replace(' ​​​​...展开全文c', '');
        t2=t2.replace('展开全文c','');
        t2=t2.replace('【','');
        t2=t2.replace('】','');
        t2=t2.replace('公示链接：O微博抽奖平台对本次抽奖进行监督，结果公正有效','');
        t2=t2.replace('光明网评论员','');
        t2=t2.replace('网页链接','');
        t2=t2.replace(/L[一-龥]+/,'');
        text.push(t2);
      }
    }
    //console.log(text);

    weibos.push(text);
  }

  let weibosString = weibos.join('。');
  let regexp = /[0-9|a-z|A-Z|一-龥|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g;
  let processedWeibosStringArray = weibosString.match(regexp);
  console.log(processedWeibosStringArray.join(''));
  await rm.loadTokens(processedWeibosStringArray);
  let result = await rm.generateUntil(/[\uff0c|\u3002|\uff1f|\uff01|\u2026]/,143,280);
  let resultString = result.join('');
  resultString = resultString.replace(/[a-z|A-Z|一-龥|]+[\uff0c|\u3002|\uff1f|\uff01|\u2026]/,'');
  let lastCharacter = resultString[resultString.length-1];
  console.log(lastCharacter);
  if (lastCharacter === '，'){
    resultString = resultString.substring(0,resultString.length-1);
    resultString+= '。';
  } else if (lastCharacter === '》'|| lastCharacter === '“'){
    resultString+= '。';
  }
  console.log(resultString);
  weiboPost.setCookie(cookie);
  weiboPost.post(resultString);
}

generateTextFromWeibo();
//ritav2Test();
//module.exports = generateTextFromLit;
