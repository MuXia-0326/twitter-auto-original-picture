// ==UserScript==
// @name         pixiv获取原图
// @namespace    https://github.com/MuXia-0326/twitter-auto-original-picture
// @version      1.3
// @description  pixiv页面生成按钮用于复制原图链接和下载原图
// @author       Mossia
// @icon         https://raw.githubusercontent.com/MuXia-0326/drawio/master/angri.png
// @match        *://www.pixiv.net/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @license      MIT
// ==/UserScript==

const css = `
.pixiv-Btn {
    z-index: 1000;
    position: relative;
    display: inline-block;
    margin-right: 5px;
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
    bottom: 0px;
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

// let pixiv_proxy = 'https://i.pixiv.cat';
let pixiv_proxy = 'https://pixiv.mossia.xyz:10000';

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

Pages[PageType.Artwork] = {
    PageTypeString: 'ArtworkPage',
    CheckUrl: function (url) {
        return /^https:\/\/www.pixiv.net\/artworks\/.*/.test(url) || /^https:\/\/www.pixiv.net\/en\/artworks\/.*/.test(url);
    },
    ProcessPageElements: function () {
        // 动图不处理
        if (document.querySelector('main figure canvas')) {
            return;
        }

        // 未加载完不处理
        if (!document.querySelector('main figure')) {
            return;
        }

        let allImage = document.querySelector('main figure').parentNode.querySelector('section + button');
        if (allImage) {
            allImage.click();
        }

        let matched = location.href.match(/artworks\/(\d+)/);
        if (!matched) {
            return;
        }

        let pid = matched[1];
        let url = g_getArtworkUrl.replace('#id#', pid);

        let original = [];

        //生成按钮
        let divImages = document.querySelectorAll('main figure div:first-child div[role="presentation"]');
        divImages.forEach((e, i) => {
            let _this = e;
            let image = _this.querySelector('a').parentNode;
            if (image.querySelector('.Btn') && image.querySelector('.Btn').getAttribute('data-pid') === pid) {
                return;
            }

            fetch(url, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((json) => {
                    iLog.i('Got artwork urls:');

                    if (json.error === true) {
                        iLog.e('Server responsed an error: ' + json.message);
                        return;
                    }

                    for (let i = 0; i < json.body.length; i++) {
                        original.push(json.body[i].urls.original);
                    }
                })
                .catch((error) => {
                    iLog.e('Request image urls failed!');
                    if (error) {
                        iLog.e(error);
                    }
                });

            let btns = image.querySelectorAll('.Btn');
            if (btns.length > 0) {
                btns.forEach((btn) => btn.remove());
            }
            let div = document.createElement('div');

            div.innerHTML = `
            <div class="Btn" data-pid=${pid}>
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
            `;

            image.appendChild(div);

            document.getElementById(`cp_${i}`).addEventListener('click', function () {
                let newUrl = original[i].replace('https://i.pximg.net', pixiv_proxy);
                navigator.clipboard.writeText(newUrl);
            });

            document.getElementById(`download_${i}`).addEventListener('click', function () {
                // 点击喜欢按钮
                let likeDiv = document.querySelector('main section section div.sc-181ts2x-3.cXSAgn');
                console.log(likeDiv);
                if (likeDiv) {
                    let a = likeDiv.querySelector('a');
                    if (!a) {
                        likeDiv.querySelector('button').click();
                    }
                }

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

let mainInterval = setInterval(main, 200);
