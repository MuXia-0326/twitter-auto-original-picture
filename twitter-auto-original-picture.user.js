// ==UserScript==
// @name         推特获取原图
// @namespace    https://github.com/MuXia-0326/twitter-auto-original-picture
// @version      1.6
// @description  推特在新标签页打开图片自动原图
// @author       Mossia
// @icon         https://raw.githubusercontent.com/MuXia-0326/drawio/master/angri.png
// @match        https://pbs.twimg.com/*
// @match        https://twitter.com/*
// @grant        GM_setClipboard
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const copyUpdate = true;

    //载入css样式
    const css = `/* From www.lingdaima.com */
    .twitter-Btn {
        position: relative;
        display: inline-block;
        padding: 10px;
        text-align: center;
        font-size: 18px;
        letter-spacing: 1px;
        text-decoration: none;
        color: rgb(29, 155, 240);
        background: transparent;
        cursor: pointer;
        transition: ease-out 0.5s;
        border: 2px solid rgb(29, 155, 240);
        border-radius: 10px;
        box-shadow: inset 0 0 0 0 rgb(29, 155, 240);
    }
    
    .twitter-Btn:hover {
        color: white;
        box-shadow: inset 0 -100px 0 0 rgb(29, 155, 240);
    }
    
    .twitter-Btn:active {
        transform: scale(0.9);
    }
    
    .twitter-Btn:hover svg {
        fill: white;
    }
    .twitter-Btn:active svg,
    .twitter-Btn svg {
        fill: rgb(29, 155, 240);
    }    

    .Btn {
        position: absolute;
        top: 2px;
        right: 2px;
    }
    .svgClass {
        display: flex;
    }
    `;

    let styleTag = document.createElement('style');
    styleTag.innerText = css;
    document.head.append(styleTag);

    // 获取当前页面的URL
    if (window.location.hostname === 'pbs.twimg.com') {
        let newUrl = replaceImageSizeName(window.location.href);
        if (newUrl !== window.location.href) {
            window.location.href = newUrl;
        }
    } else if (window.location.hostname === 'twitter.com') {
        document.js_nsfw = setInterval(main, 100);
    }

    function main() {
        tweetAdd();
        imageDetailsAdd();
        copy();
    }

    function copy() {
        if (copyUpdate) {
            // 替换复制按钮的url
            let firstChildDiv = document.querySelector('div[data-testid="Dropdown"] > div:first-child');

            // 确保第一个子元素是一个 div
            if (firstChildDiv) {
                firstChildDiv.addEventListener('click', function (e) {
                    navigator.clipboard
                        .readText()
                        .then((text) => {
                            // console.log('剪贴板的内容：', text);
                            if (text.indexOf('fixupx') === -1) {
                                // 修改剪贴板的内容
                                GM_setClipboard(text.replace(/x/g, 'fixupx'), 'text');
                            }
                        })
                        .catch((err) => {
                            console.log('无法读取剪贴板的内容：', err);
                        });
                });
            }
        }
    }
    function imageDetailsAdd() {
        // 图片详情页的按钮
        let classDetailsName = 'div[data-testid="swipe-to-dismiss"] div[aria-label="图像"]';

        let tempDetails = [...new Set(baseSelector(document, classDetailsName))];
        for (let i = 0; i < tempDetails.length; i++) {
            setDetailsBtn([tempDetails[i]]);
        }
    }

    function tweetAdd() {
        let tweets = document.querySelectorAll('[data-testid="cellInnerDiv"]');

        for (let tweet of tweets) {
            let className = 'div[aria-label="图像"][data-testid="tweetPhoto"]';

            let imageDiv = tweet.querySelector(className);
            if (imageDiv === null) {
                continue;
            }

            let temp = [...new Set(baseSelector(tweet, className))];

            let like = null;
            if (tweet.querySelector('div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-1ny4l3l')) {
                let divs = tweet.querySelector('div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-1ny4l3l');

                let childCount = divs.children.length;
                if (childCount === 3) {
                    like = divs.children[2].children[4].querySelector('div').querySelector('div').children[2];
                } else if (childCount === 2) {
                    like = divs.children[1].children[1].children[3].querySelector('div').querySelector('div').children[2];
                }
            } else if (tweet.querySelector('div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu')) {
                like = tweet
                    .querySelector('div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu')
                    .children[3].querySelector('div')
                    .querySelector('div').children[2];
            }

            for (let i = 0; i < temp.length; i++) {
                setBtn([temp[i]], like);
            }
        }
    }

    function baseSelector(parentEle, selector) {
        let items = parentEle.querySelectorAll(selector);
        return Array.from(items).filter((item) => {
            let node = getParentByNum(item, 5).querySelectorAll('div[data-nsfw]');
            return !(node && node.length > 0);
        });
    }

    function setBtn(node, like) {
        for (let container of node) {
            let images = container.querySelectorAll('img');

            for (let image of images) {
                let imageUrl = image.getAttribute('src');
                let classText = image.getAttribute('class') + getRandomIntExclusive(10);

                let buttonHtml = getBtnHtml(classText);

                let parentElement = getParentByNum(image, 5);

                let newUrl = replaceImageSizeName(imageUrl);
                appendBtn(parentElement, newUrl, buttonHtml, classText, like);
            }
        }
    }

    function setDetailsBtn(node) {
        for (let container of node) {
            // console.log(container);
            let images = container.querySelectorAll('img');

            for (let image of images) {
                let imageUrl = image.getAttribute('src');
                let classText = image.getAttribute('class') + getRandomIntExclusive(10);

                let buttonHtml = getBtnHtml(classText);

                let like = getParentByNum(container, 4)
                    .nextElementSibling.querySelector('div')
                    .querySelector('div')
                    .querySelector('div').children[2];

                let newUrl = replaceImageSizeName(imageUrl);
                appendBtn(container, newUrl, buttonHtml, classText, like);
            }
        }
    }

    function getBtnHtml(classText) {
        const buttonHtml = `<div class="Btn">
                <button class="twitter-Btn" id="copy-${classText}">
                    <div class="svgClass">
                        <svg t="1694962361717" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5412" width="20" height="20">
                            <path d="M761.088 715.3152a38.7072 38.7072 0 0 1 0-77.4144 37.4272 37.4272 0 0 0 37.4272-37.4272V265.0112a37.4272 37.4272 0 0 0-37.4272-37.4272H425.6256a37.4272 37.4272 0 0 0-37.4272 37.4272 38.7072 38.7072 0 1 1-77.4144 0 115.0976 115.0976 0 0 1 114.8416-114.8416h335.4624a115.0976 115.0976 0 0 1 114.8416 114.8416v335.4624a115.0976 115.0976 0 0 1-114.8416 114.8416z" p-id="5413" ></path>
                            <path d="M589.4656 883.0976H268.1856a121.1392 121.1392 0 0 1-121.2928-121.2928v-322.56a121.1392 121.1392 0 0 1 121.2928-121.344h321.28a121.1392 121.1392 0 0 1 121.2928 121.2928v322.56c1.28 67.1232-54.1696 121.344-121.2928 121.344zM268.1856 395.3152a43.52 43.52 0 0 0-43.8784 43.8784v322.56a43.52 43.52 0 0 0 43.8784 43.8784h321.28a43.52 43.52 0 0 0 43.8784-43.8784v-322.56a43.52 43.52 0 0 0-43.8784-43.8784z" p-id="5414" ></path>
                        </svg>
                    </div>
                </button>
                <button class="twitter-Btn" id="download-${classText}">
                    <div class="svgClass">
                        <svg t="1694962091616" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4129" id="mx_n_1694962091617" width="20" height="20">
                            <path d="M160 579.2a28.8 28.8 0 0 1 28.8 28.8v170.672c0 30.4 25.664 56.528 59.2 56.528h528c33.536 0 59.2-26.144 59.2-56.528V608a28.8 28.8 0 0 1 57.6 0v170.672c0 63.856-53.12 114.128-116.8 114.128h-528c-63.68 0-116.8-50.272-116.8-114.128V608a28.8 28.8 0 0 1 28.8-28.8z"  p-id="4130"></path><path d="M540.8 176l0 464a28.8 28.8 0 0 1-57.6 0L483.2 176a28.8 28.8 0 0 1 57.6 0z"  p-id="4131"></path>
                            <path d="M331.632 459.632a28.8 28.8 0 0 1 40.736 0l160 160a28.8 28.8 0 0 1-40.736 40.736l-160-160a28.8 28.8 0 0 1 0-40.736z" p-id="4132"></path><path d="M692.368 459.632a28.8 28.8 0 0 0-40.736 0l-160 160a28.8 28.8 0 0 0 40.736 40.736l160-160a28.8 28.8 0 0 0 0-40.736z" p-id="4133"></path>
                        </svg>
                    </div>
                </button>
            </div>`;
        return buttonHtml;
    }

    function appendBtn(parentElement, newUrl, buttonHtml, classText, like) {
        // 创建按钮元素
        let button = document.createElement('div');
        button.setAttribute('data-nsfw', 'x');
        button.innerHTML = buttonHtml;

        // 按钮点击事件处理程序
        button.querySelector(`#copy-${classText}`).addEventListener('click', () => navigator.clipboard.writeText(newUrl));

        // 发起fetch请求获取图片内容
        button.querySelector(`#download-${classText}`).addEventListener('click', () => {
            // 点击喜欢按钮
            let likeDiv = like.querySelector('[data-testid="like"]');
            if (likeDiv) {
                likeDiv.click();
            }

            fetch(newUrl)
                .then(function (response) {
                    if (response.ok) {
                        return response.blob(); // 以Blob形式解析响应内容
                    } else {
                        throw new Error('下载失败');
                    }
                })
                .then(function (imageBlob) {
                    // 创建一个Blob URL，用于保存图片内容
                    var imageUrl = URL.createObjectURL(imageBlob);

                    let urlParams = new URL(newUrl);
                    // 创建一个下载链接
                    var downloadLink = document.createElement('a');
                    downloadLink.href = imageUrl;
                    downloadLink.download =
                        urlParams.pathname.substring(urlParams.pathname.lastIndexOf('/') + 1) +
                        '.' +
                        urlParams.searchParams.get('format');

                    // 模拟用户点击下载链接
                    downloadLink.click();

                    // 释放Blob URL以节省内存
                    URL.revokeObjectURL(imageUrl);
                })
                .catch(function (error) {
                    console.error('下载失败：', error);
                });
        });

        parentElement.appendChild(button);
    }

    function getParentByNum(element, number) {
        let ancestor = element;
        for (let i = 0; i < number; i++) {
            if (ancestor.parentElement) {
                ancestor = ancestor.parentElement;
            } else {
                break;
            }
        }
        return ancestor;
    }

    /**
     * @param {string} urlString
     */
    function replaceImageSizeName(urlString) {
        // 替换name参数的值为"orig"
        const url = new URL(urlString);
        url.searchParams.set('name', 'orig');
        return url.toString();
    }

    /**
     * @param {number} max
     */
    function getRandomIntExclusive(max) {
        return Math.floor(Math.random() * max);
    }
})();
