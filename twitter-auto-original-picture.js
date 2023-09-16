// ==UserScript==
// @name         推特在新标签页打开图片自动原图
// @namespace    https://github.com/MuXia-0326/twitter-auto-original-picture
// @version      1.0
// @description  推特在新标签页打开图片自动原图
// @author       Mossia
// @match        https://pbs.twimg.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    // 获取当前页面的URL
    var currentUrl = window.location.href;

    if (currentUrl.includes("orig")) {
        return;
    }

    // 替换name参数的值为"orig"
    var newUrl = currentUrl.replace(/name=[^&]+/, "name=orig");

    // 如果您想重定向到修改后的URL，可以使用以下代码
    window.location.href = newUrl;
})();
