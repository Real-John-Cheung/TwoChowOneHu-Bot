//original code
/**
 * weibo-post <https://github.com/itibbers/weibo-post/>
 * Released under MIT license <https://github.com/itibbers/weibo-post/LICENSE.md>
 * Copyright Ryan Ji
 */
//modified by JohnCheung specially for the botsbots

var querystring = require('querystring');
var https = require('https');

let weiboPost = {
	cookie: '',

	/**
	 * cook: weibo login cookie.
	 * How to get your cookie,
	 * please see <https://github.com/itibbers/weibo-post/README.md>.
	 */
	setCookie(cook) {
		this.cookie = cook;
	},

	/**
	 * str: post text.
	 * Now only support *String*.
	 */
	post(str,pic_ids='') {

		if (this.cookie === '') {
			console.log('Error: Cookie not set!');
			return;
		}

		// Build the post string from an object
		var post_data = querystring.stringify({
			'location': 'v6_content_home',
			'text': str,
			'appkey': '',
			'style_type': '1',
			'pic_id': pic_ids,
			'tid': '',
			'pdetail': '',
			'mid': '',
			'isReEdit': 'false',
			'rank': '0',
			'rankid': '',
			'module': 'stissue',
			'pub_source': 'main_',
			'pub_type': 'dialog',
			'isPri': '0',
			'_t': '0'
		});

		// An object of options to indicate where to post to
		var post_options = {
			host: 'www.weibo.com',
			port: '443',
			path: '/aj/mblog/add?ajwvr=6&__rnd=' + new Date().getTime(),
			method: 'POST',
			headers: {
        'Host': 'www.weibo.com',
				'Accept': '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3',
				'Connection': 'keep-alive',
				'Content-Length': Buffer.byteLength(post_data),
				'Content-Type': 'application/x-www-form-urlencoded',
				'Cookie': this.cookie,
				'Origin': 'https://weibo.com',
				'Referer': 'https://weibo.com/BotsBots/home',
        'TE':'Trailers',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:75.0) Gecko/20100101 Firefox/75.0',
				'X-Requested-With': 'XMLHttpRequest'
			}
		};

    //console.log(post_options.path);

		// Set up the request
		var post_req = https.request(post_options, res => {
			res.setEncoding('utf8');

			console.log('Status: ' + res.statusCode);
			console.log('Return headers: ' + JSON.stringify(res.headers));

			switch (res.statusCode) {
				case 200:
					console.log('\nSent!');
					break;
				default:
					console.log('\nError!');
			}

			res.on('data', chunk => {
				// console.log(Buffer.isBuffer(chunk));
				// console.log(typeof chunk);
				// console.log(chunk);
			});

			res.on('end', () => {
				// console.log('\nSent!');
			});
		});

		post_req.on('error', e => {
			console.log(`Error: ${e.message}`);
		});

		// post the data
		post_req.write(post_data);
		post_req.end();

	}
};

module.exports = weiboPost;
