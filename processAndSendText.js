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

let litDir = './lit';
let litFiles = fs.readdirSync(litDir);

let weibos = [];
let lits = [];

let toPost = [];

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

  await rm.loadTokens(processedWeibosStringArray);
  console.log(rm);
  let result = await rm.generateUntil(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/,143,280);
  let resultString = result.join('');
  resultString = resultString.replace(/[0-9|a-z|A-Z|一-龥|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]+[uff0c|u3002|uff1f|uff01|u2026]/,'');
  let lastCharacter = resultString[resultString.length-1];
  console.log(lastCharacter);
  if (lastCharacter === '，'){
    resultString = resultString.substring(0,resultString.length-1);
    resultString+= '。';
  } else if (lastCharacter === '》'|| lastCharacter === '“'){
    resultString+= '。';
  }
  console.log(resultString);
  toPost.push(resultString);
  weiboPost.setCookie(cookie);
  weiboPost.post(resultString);
}

//text fed: essays by 周樹人 & 周作人
async function generateTextFromLit(){
  let rm = new rita.RiMarkov(n);
  for (let i = 0; i < litFiles.length; i++) {
    console.log('loading lit file ' + (i + 1));
    let fileName = litFiles[i];
    console.log(fileName);
    let pathTofile = './lit/'+fileName;
    let content = fs.readFileSync(pathTofile,'utf8');
    content = content.replace(/[0-9]+/g,'');
    console.log(content);
    lits.push(content);
    }
  let litString = lits.join('');
  let regexp = /[a-z|A-Z|一-龥|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g;
  let processedLitArray = litString.match(regexp);
  console.log(processedLitArray.join(''));
  await rm.loadTokens(processedLitArray);
  let result = await rm.generateUntil(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/,143,280);
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
  toPost.push(resultString);
  weiboPost.setCookie(cookie);
  weiboPost.post(resultString);
}

async function ritav2Test(){

  let rm = new ritav2.Markov(4);

  for (let i = 0; i < litFiles.length; i++) {
    console.log('loading lit file ' + (i + 1));
    let fileName = litFiles[i];
    console.log(fileName);
    let pathTofile = './lit/'+fileName;
    let content = fs.readFileSync(pathTofile,'utf8');
    content = content.replace(/[0-9]+/g,'');
    console.log(content);
    lits.push(content);
    }
  let litString = lits.join('');
  let regexp = /[a-z|A-Z|一-龥|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g;
  let processedLitArray = litString.match(regexp);
  let processedLitString = processedLitArray.join('');

  let sentencesArray = processedLitString.match(/[^，；。？！]+[，；。？！]/g);

  rm.addSentences(sentencesArray);

  let result = rm.generateSentences(5,{
startTokens:
'我' });

  console.log(result);

}

async function post(){
  generateTextFromWeibo();
  setTimeout(generateTextFromLit,60000);


  // toPostString = toPost.join('\n');
  // console.log(toPostString);
  // await weiboPost.setCookie(cookie);
  // await weiboPost.post(toPostString);
}

//generateTextFromWeibo();
post();
//ritav2Test();
//module.exports = generateTextFromLit;
