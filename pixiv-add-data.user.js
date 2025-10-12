// ==UserScript==
// @name         pixiv添加数据
// @namespace    https://github.com/MuXia-0326/twitter-auto-original-picture
// @version      1.1
// @description  将用户喜欢数据添加到api数据库中
// @author       Mossia
// @icon         https://raw.githubusercontent.com/MuXia-0326/drawio/master/angri.png
// @match        *://www.pixiv.net/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

const user_url = 'https://www.pixiv.net/ajax/user/';
const bookmarks_url = 'https://www.pixiv.net/ajax/user/#userId#/illusts/bookmarks?tag=&offset=#page#&limit=100&rest=show';

let userName = '';

async function api(url) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function (response) {
        let result = JSON.parse(response.responseText);
        resolve(result);
      },
      onerror: function (error) {
        console.error('Request failed:', error);
        reject(error);
      },
    });
  });
}

async function addApi(json) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://api.mossia.top/add/pPidQueue',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(json),
      onload: function (response) {
        console.log(response);

        resolve(null);
      },
      onerror: function (error) {
        console.error('Request failed:', error);
        reject(error);
      },
    });
  });
}

async function getJson(pidList) {
  let json = {
    pidList: pidList,
    createBy: userName,
  };

  return json;
}

async function main() {
  console.log('开始获取用户信息');
  // 获取当前url
  let lUrl = window.location.href;

  let userReg = /https:\/\/www\.pixiv\.net\/users\/\d+\/bookmarks\/artworks/;
  if (!lUrl.match(userReg)) {
    console.log('当前页面不对');
    return;
  }

  let userId = lUrl.match(/users\/(\d+)/)[1];
  let userinfo = await api(user_url + userId);
  userName = userinfo.body.name;
  console.log('用户信息获取成功:', userName);

  let bUrl = bookmarks_url.replace('#page#', 0).replace('#userId#', userId);

  let result = await api(bUrl);

  let total = result.body.total;
  let page = Math.ceil(total / 100);
  if (total % 100 > 0) {
    page++;
  }
  console.log('总页数:', page);

  for (let i = 0; i < page; i++) {
    let pidList = [];
    console.log(`开始获取第 ${i + 1} 页的收藏作品`);
    if (i > 0) {
      result = await api(bookmarks_url.replace('#page#', i * 100).replace('#userId#', userId));
    }

    result.body.works.forEach((item) => {
      let pid = item.id;
      pidList.push(pid);
    });

    let json = await getJson(pidList);

    console.log(json);

    await addApi(json);

    console.log(`第 ${i + 1} 页的收藏作品获取成功`);
  }
}

main();
