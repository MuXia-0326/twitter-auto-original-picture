// ==UserScript==
// @name         pixiv获取原图
// @namespace    https://github.com/MuXia-0326/twitter-auto-original-picture
// @version      1.0
// @description  pixiv页面生成按钮用于复制原图链接和下载原图
// @author       Mossia
// @match        *://www.pixiv.net/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @license      MIT
// ==/UserScript==

const css = `
.pixiv-Btn {
    position: relative;
    display: inline-block;
    margin-right: 5px;
    margin-top: 40px;
    padding: 10px;
    text-align: center;
    font-size: 18px;
    letter-spacing: 1px;
    text-decoration: none;
    color: rgb(0, 150, 250);
    background: transparent;
    cursor: pointer;
    transition: ease-out 0.5s;
    border: 2px solid rgb(0, 150, 250);
    border-radius: 10px;
    box-shadow: inset 0 0 0 0 rgb(0, 150, 250);
}
.pixiv-Btn:hover {
    color: white;
    box-shadow: inset 0 -100px 0 0 rgb(0, 150, 250);
}
.pixiv-Btn:active {
    transform: scale(0.9);
}
.pixiv-Btn:hover svg {
    fill: white;
}
.pixiv-Btn:active svg, .pixiv-Btn svg {
    fill: rgb(0, 150, 250);
}


.Btn {
    position: absolute;
    right: 0px;
    // bottom: 0px;
    top: 0px;
}
.svgClass {
    display: flex;
}
`;

let styleTag = document.createElement('style');
styleTag.innerText = css;
document.head.append(styleTag);

function ILog() {
    this.prefix = '';

    this.v = function (value) {
        if (level <= this.LogLevel.Verbose) {
            console.log(this.prefix + value);
        }
    };

    this.i = function (info) {
        if (level <= this.LogLevel.Info) {
            console.info(this.prefix + info);
        }
    };

    this.w = function (warning) {
        if (level <= this.LogLevel.Warning) {
            console.warn(this.prefix + warning);
        }
    };

    this.e = function (error) {
        if (level <= this.LogLevel.Error) {
            console.error(this.prefix + error);
        }
    };

    this.d = function (element) {
        if (level <= this.LogLevel.Verbose) {
            console.log(element);
        }
    };

    this.setLogLevel = function (logLevel) {
        level = logLevel;
    };

    this.LogLevel = {
        Verbose: 0,
        Info: 1,
        Warning: 2,
        Error: 3
    };

    let level = this.LogLevel.Warning;
}
var iLog = new ILog();

var checkJQuery = function () {
    let jqueryCdns = [
        'http://code.jquery.com/jquery-2.1.4.min.js',
        'https://ajax.aspnetcdn.com/ajax/jquery/jquery-2.1.4.min.js',
        'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
        'https://cdn.staticfile.org/jquery/2.1.4/jquery.min.js',
        'https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js'
    ];
    function isJQueryValid() {
        try {
            let wd = unsafeWindow;
            if (wd.jQuery && !wd.$) {
                wd.$ = wd.jQuery;
            }
            $();
            return true;
        } catch (exception) {
            return false;
        }
    }
    function insertJQuery(url) {
        let script = document.createElement('script');
        script.src = url;
        document.head.appendChild(script);
        return script;
    }
    function converProtocolIfNeeded(url) {
        let isHttps = location.href.indexOf('https://') != -1;
        let urlIsHttps = url.indexOf('https://') != -1;

        if (isHttps && !urlIsHttps) {
            return url.replace('http://', 'https://');
        } else if (!isHttps && urlIsHttps) {
            return url.replace('https://', 'http://');
        }
        return url;
    }
    function waitAndCheckJQuery(cdnIndex, resolve) {
        if (cdnIndex >= jqueryCdns.length) {
            iLog.e('无法加载 JQuery，正在退出。');
            resolve(false);
            return;
        }
        let url = converProtocolIfNeeded(jqueryCdns[cdnIndex]);
        iLog.i('尝试第 ' + (cdnIndex + 1) + ' 个 JQuery CDN：' + url + '。');
        let script = insertJQuery(url);
        setTimeout(function () {
            if (isJQueryValid()) {
                iLog.i('已加载 JQuery。');
                resolve(true);
            } else {
                iLog.w('无法访问。');
                script.remove();
                waitAndCheckJQuery(cdnIndex + 1, resolve);
            }
        }, 100);
    }
    return new Promise(function (resolve) {
        if (isJQueryValid()) {
            iLog.i('已加载 jQuery。');
            resolve(true);
        } else {
            iLog.i('未发现 JQuery，尝试加载。');
            waitAndCheckJQuery(0, resolve);
        }
    });
};

let pixiv_proxy = 'https://i.pixiv.cat';

let g_getArtworkUrl = '/ajax/illust/#id#/pages';

// 当前页面类型
let g_pageType = -1;

// 页面相关的一些预定义，包括处理页面元素等
let PageType = {
    // 作品详情页
    Artwork: 0,

    // 总数
    PageTypeCount: 1
};

/* Pages 必须实现的函数
 * PageTypeString: string，字符串形式的 PageType
 * bool CheckUrl: function(string url)，用于检查一个 url 是否是当前页面的目标 url
 * ProcessPageElements: function()，处理页面（寻找图片元素、添加按钮）
 */
let Pages = {};

// 测试网址
// https://www.pixiv.net/artworks/115112051
// https://www.pixiv.net/artworks/115063738

Pages[PageType.Artwork] = {
    PageTypeString: 'ArtworkPage',
    CheckUrl: function (url) {
        return /^https:\/\/www.pixiv.net\/artworks\/.*/.test(url) || /^https:\/\/www.pixiv.net\/en\/artworks\/.*/.test(url);
    },
    ProcessPageElements: function () {
        // 动图不处理
        if ($('main').find('figure').find('canvas').length > 0) {
            return;
        }

        let allImage = $('main').find('figure').parent().find('section').next('button');
        if (allImage.length > 0) {
            allImage.click();
        }

        let matched = location.href.match(/artworks\/(\d+)/);
        if (!matched) {
            return;
        }

        let pid = matched[1];
        let url = g_getArtworkUrl.replace('#id#', pid);

        let original = [];
        $.ajax(url, {
            method: 'GET',
            success: function (json) {
                iLog.i('Got artwork urls:');
                console.log(json);

                if (json.error === true) {
                    iLog.e('Server responsed an error: ' + json.message);
                    return;
                }

                for (let i = 0; i < json.body.length; i++) {
                    original.push(json.body[i].urls.original);
                }
            },
            error: function (data) {
                iLog.e('Request image urls failed!');
                if (data) {
                    iLog.e(data);
                }
            }
        });

        //生成按钮
        let divImages = $('main').find('figure').find('div:first-child').find('div[role="presentation"]');
        divImages.each(function (i, e) {
            let _this = $(e);
            let image = _this.find('a').parent();
            if (image.find('.pixiv-Btn').length > 0) {
                return;
            }

            image.append(`
            <div class="Btn">
                <button class="pixiv-Btn" id="cp_${i}">
                    <div class="svgClass">
                        <svg t="1694962361717" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5412" width="20" height="20">
                            <path d="M761.088 715.3152a38.7072 38.7072 0 0 1 0-77.4144 37.4272 37.4272 0 0 0 37.4272-37.4272V265.0112a37.4272 37.4272 0 0 0-37.4272-37.4272H425.6256a37.4272 37.4272 0 0 0-37.4272 37.4272 38.7072 38.7072 0 1 1-77.4144 0 115.0976 115.0976 0 0 1 114.8416-114.8416h335.4624a115.0976 115.0976 0 0 1 114.8416 114.8416v335.4624a115.0976 115.0976 0 0 1-114.8416 114.8416z" p-id="5413" ></path>
                            <path d="M589.4656 883.0976H268.1856a121.1392 121.1392 0 0 1-121.2928-121.2928v-322.56a121.1392 121.1392 0 0 1 121.2928-121.344h321.28a121.1392 121.1392 0 0 1 121.2928 121.2928v322.56c1.28 67.1232-54.1696 121.344-121.2928 121.344zM268.1856 395.3152a43.52 43.52 0 0 0-43.8784 43.8784v322.56a43.52 43.52 0 0 0 43.8784 43.8784h321.28a43.52 43.52 0 0 0 43.8784-43.8784v-322.56a43.52 43.52 0 0 0-43.8784-43.8784z" p-id="5414" ></path>
                        </svg>
                    </div>
                </button>
                <button class="pixiv-Btn" id="download_${i}">
                    <div class="svgClass">
                        <svg t="1694962091616" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4129" id="mx_n_1694962091617" width="20" height="20">
                            <path d="M160 579.2a28.8 28.8 0 0 1 28.8 28.8v170.672c0 30.4 25.664 56.528 59.2 56.528h528c33.536 0 59.2-26.144 59.2-56.528V608a28.8 28.8 0 0 1 57.6 0v170.672c0 63.856-53.12 114.128-116.8 114.128h-528c-63.68 0-116.8-50.272-116.8-114.128V608a28.8 28.8 0 0 1 28.8-28.8z"  p-id="4130"></path><path d="M540.8 176l0 464a28.8 28.8 0 0 1-57.6 0L483.2 176a28.8 28.8 0 0 1 57.6 0z"  p-id="4131"></path>
                            <path d="M331.632 459.632a28.8 28.8 0 0 1 40.736 0l160 160a28.8 28.8 0 0 1-40.736 40.736l-160-160a28.8 28.8 0 0 1 0-40.736z" p-id="4132"></path><path d="M692.368 459.632a28.8 28.8 0 0 0-40.736 0l-160 160a28.8 28.8 0 0 0 40.736 40.736l160-160a28.8 28.8 0 0 0 0-40.736z" p-id="4133"></path>
                        </svg>
                    </div>
                </button>
            </div>
            `);

            $(`#cp_${i}`).click(function () {
                let newUrl = original[i].replace('https://i.pximg.net', pixiv_proxy);
                navigator.clipboard.writeText(newUrl);
            });
            $(`#download_${i}`).click(function () {
                let newUrl = original[i];

                GM_xmlhttpRequest({
                    method: 'GET',
                    url: newUrl,
                    headers: {
                        Referer: 'https://www.pixiv.net/'
                    },
                    responseType: 'blob', // 添加这一行
                    onload: function (response) {
                        if (response.status === 200) {
                            var blobUrl = URL.createObjectURL(response.response);
                            GM_download(blobUrl, newUrl.substring(newUrl.lastIndexOf('/') + 1));
                        } else {
                            console.error('Download failed:', response.statusText);
                        }
                    }
                });
            });
        });
    }
};

let mainInterval = null;

function main() {
    // 匹配当前页面
    for (let i = 0; i < PageType.PageTypeCount; i++) {
        if (Pages[i].CheckUrl(location.href)) {
            g_pageType = i;
            break;
        }
    }

    if (g_pageType >= 0) {
        iLog.i('当前页面类型：' + Pages[g_pageType].PageTypeString);
    } else {
        iLog.i('当前页面类型：未知');
        clearInterval(mainInterval);
        return;
    }

    // 执行操作
    Pages[g_pageType].ProcessPageElements();
}

function startmain() {
    mainInterval = setInterval(main, 1 * 1000);
}

let inChecking = false;
let jqItv = setInterval(function () {
    if (inChecking) {
        return;
    }
    inChecking = true;
    checkJQuery().then(function (isLoad) {
        if (isLoad) {
            clearInterval(jqItv);
            startmain();
        }
        inChecking = false;
    });
}, 1000);
