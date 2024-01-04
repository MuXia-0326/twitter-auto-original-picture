// ==UserScript==
// @name         推特在新标签页打开图片自动原图
// @namespace    https://github.com/MuXia-0326/twitter-auto-original-picture
// @version      1.0
// @description  推特在新标签页打开图片自动原图
// @author       Mossia
// @match        https://pbs.twimg.com/*
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    //载入css样式
    const css = `/* From www.lingdaima.com */
    button {
        position: relative;
        display: inline-block;
        padding: 10px;
        text-align: center;
        font-size: 18px;
        letter-spacing: 1px;
        text-decoration: none;
        color: rgb(29,155,240);
        background: transparent;
        cursor: pointer;
        transition: ease-out 0.5s;
        border-radius: 30px;
        border: 2px solid rgb(29,155,240);
        border-radius: 10px;
        box-shadow: inset 0 0 0 0 rgb(29,155,240);
    }

    button:hover {
        color: white;
        box-shadow: inset 0 -100px 0 0 rgb(29,155,240);
    }

    button:active {
        transform: scale(0.9);
    }

    .Btn {
        position: absolute;
        top: 2px;
        right: 2px;
    }
    .svgClass {
        display: flex;
    }
    .svgMoveIn {
        fill: #fff;
    }
    .svgMoveOut {
        fill: rgb(29,155,240);
    }
    `;

    const styleTag = document.createElement('style');
    styleTag.innerText = css;
    document.head.append(styleTag);

    // 获取当前页面的URL
    if (window.location.hostname === 'pbs.twimg.com') {
        const newUrl = replaceImageSizeName(window.location.href);
        if (newUrl !== window.location.href) {
            window.location.href = newUrl;
        }
    } else if (window.location.hostname === 'twitter.com') {
        addBtn();
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

    function addBtn() {
        const processedImages = new Set(); // 用于跟踪已处理的图片

        // 创建MutationObserver来监视DOM树的变化
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                console.log(mutation);
                if (mutation.type !== 'childList') {
                    continue;
                }
                // 检查是否有新的图片加载
                const tweetContainers = mutation.target.querySelectorAll('div[aria-label][data-testid="tweetPhoto"]');

                for (const container of tweetContainers) {
                    const images = container.querySelectorAll('img');

                    for (const image of images) {
                        const imageUrl = image.getAttribute('src');
                        const classText = image.getAttribute('class') + getRandomIntExclusive(10);

                        const buttonHtml = `<div class="Btn">
                            <button id="copy-${classText}">
                                <div class="svgClass">
                                    <svg t="1694962361717" class="icon svgMoveOut" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5412" width="20" height="20">
                                        <path d="M761.088 715.3152a38.7072 38.7072 0 0 1 0-77.4144 37.4272 37.4272 0 0 0 37.4272-37.4272V265.0112a37.4272 37.4272 0 0 0-37.4272-37.4272H425.6256a37.4272 37.4272 0 0 0-37.4272 37.4272 38.7072 38.7072 0 1 1-77.4144 0 115.0976 115.0976 0 0 1 114.8416-114.8416h335.4624a115.0976 115.0976 0 0 1 114.8416 114.8416v335.4624a115.0976 115.0976 0 0 1-114.8416 114.8416z" p-id="5413" ></path>
                                        <path d="M589.4656 883.0976H268.1856a121.1392 121.1392 0 0 1-121.2928-121.2928v-322.56a121.1392 121.1392 0 0 1 121.2928-121.344h321.28a121.1392 121.1392 0 0 1 121.2928 121.2928v322.56c1.28 67.1232-54.1696 121.344-121.2928 121.344zM268.1856 395.3152a43.52 43.52 0 0 0-43.8784 43.8784v322.56a43.52 43.52 0 0 0 43.8784 43.8784h321.28a43.52 43.52 0 0 0 43.8784-43.8784v-322.56a43.52 43.52 0 0 0-43.8784-43.8784z" p-id="5414" ></path>
                                    </svg>
                                </div>
                            </button>
                            <button id="download-${classText}">
                                <div class="svgClass">
                                    <svg t="1694962091616" class="icon svgMoveOut" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4129" id="mx_n_1694962091617" width="20" height="20">
                                        <path d="M160 579.2a28.8 28.8 0 0 1 28.8 28.8v170.672c0 30.4 25.664 56.528 59.2 56.528h528c33.536 0 59.2-26.144 59.2-56.528V608a28.8 28.8 0 0 1 57.6 0v170.672c0 63.856-53.12 114.128-116.8 114.128h-528c-63.68 0-116.8-50.272-116.8-114.128V608a28.8 28.8 0 0 1 28.8-28.8z"  p-id="4130"></path><path d="M540.8 176l0 464a28.8 28.8 0 0 1-57.6 0L483.2 176a28.8 28.8 0 0 1 57.6 0z"  p-id="4131"></path>
                                        <path d="M331.632 459.632a28.8 28.8 0 0 1 40.736 0l160 160a28.8 28.8 0 0 1-40.736 40.736l-160-160a28.8 28.8 0 0 1 0-40.736z" p-id="4132"></path><path d="M692.368 459.632a28.8 28.8 0 0 0-40.736 0l-160 160a28.8 28.8 0 0 0 40.736 40.736l160-160a28.8 28.8 0 0 0 0-40.736z" p-id="4133"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>`;

                        const parentElement = image.parentElement.parentElement.parentElement.parentElement.parentElement;

                        if (!processedImages.has(imageUrl)) {
                            processedImages.add(imageUrl); // 将图片标记为已处理

                            const newUrl = replaceImageSizeName(imageUrl);
                            appendBtn(parentElement, newUrl, buttonHtml, classText);
                        } else {
                            let btn = parentElement.querySelector(`.Btn`);
                            if (btn != null) {
                                return;
                            }
                            const newUrl = replaceImageSizeName(imageUrl);
                            appendBtn(parentElement, newUrl, buttonHtml, classText);
                        }
                    }
                }
            }
        });

        // 配置MutationObserver以监视子节点添加
        const observerConfig = { childList: true, subtree: true };

        let reactRoot = document.querySelector('#react-root');
        // 在document上启动MutationObserver
        observer.observe(reactRoot, observerConfig);
    }

    function appendBtn(parentElement, newUrl, buttonHtml, classText) {
        // 创建按钮元素
        const button = document.createElement('div');
        button.innerHTML = buttonHtml;

        // 按钮点击事件处理程序
        button.querySelector(`#copy-${classText}`).addEventListener('click', () => navigator.clipboard.writeText(newUrl));

        // 发起fetch请求获取图片内容
        button.querySelector(`#download-${classText}`).addEventListener('click', () => {
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

                    const urlParams = new URL(newUrl);
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

        // 移入事件处理程序
        button.querySelector(`#copy-${classText}`).addEventListener('mouseenter', () => {
            const icon = button.querySelector(`#copy-${classText}`).querySelector('.icon');

            // 更改按钮颜色
            icon.classList.remove('svgMoveOut');
            icon.classList.add('svgMoveIn');
        });
        // 移出事件处理程序
        button.querySelector(`#copy-${classText}`).addEventListener('mouseleave', () => {
            const icon = button.querySelector(`#copy-${classText}`).querySelector('.icon');

            // 更改按钮颜色
            icon.classList.remove('svgMoveIn');
            icon.classList.add('svgMoveOut');
        });

        // 移入事件处理程序
        button.querySelector(`#download-${classText}`).addEventListener('mouseenter', () => {
            const icon = button.querySelector(`#download-${classText}`).querySelector('.icon');

            // 更改按钮颜色
            icon.classList.remove('svgMoveOut');
            icon.classList.add('svgMoveIn');
        });
        // 移出事件处理程序
        button.querySelector(`#download-${classText}`).addEventListener('mouseleave', () => {
            const icon = button.querySelector(`#download-${classText}`).querySelector('.icon');

            // 更改按钮颜色
            icon.classList.remove('svgMoveIn');
            icon.classList.add('svgMoveOut');
        });

        parentElement.appendChild(button);
    }

    /**
     * @param {number} max
     */
    function getRandomIntExclusive(max) {
        return Math.floor(Math.random() * max);
    }
})();
