let rita = require('rita');
let fs = require('fs');

let weiboPost = require('./weibo-post.js');
let n = 4;

if (process.env.COOKIE == undefined) {
  require('./env.js');
}

let cookie = process.env.COOKIE;

//text fed: essays by 周樹人 & 周作人
async function generateTextFromLit() {

  let rm = new rita.RiMarkov(n);
  console.log('loading lit file ');
  let pathTofile = './lit/lit.json';
  let content = fs.readFileSync(pathTofile);
  content = JSON.parse(content);
  let litString = content.lit.replace(/[0-9]+/g, '');

  let regexp = /[a-z|A-Z|一-龥|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g;
  let processedLitArray = litString.match(regexp);
  console.log(processedLitArray.join(''));
  await rm.loadTokens(processedLitArray);
  let result = await rm.generateUntil(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/, 143, 280);
  let resultString = result.join('');
  resultString = resultString.replace(/[a-z|A-Z|一-龥|]+[\uff0c|\u3002|\uff1f|\uff01|\u2026]/, '');
  let lastCharacter = resultString[resultString.length - 1];
  console.log(lastCharacter);
  if (lastCharacter === '，') {
    resultString = resultString.substring(0, resultString.length - 1);
    resultString += '。';
  } else if (lastCharacter === '》' || lastCharacter === '“') {
    resultString += '。';
  }

  console.log(resultString);
  //weiboPost.setCookie(cookie);
  //weiboPost.post(resultString);
}

generateTextFromLit();
