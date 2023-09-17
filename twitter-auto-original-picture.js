/*
 * @Author: MuXia
 * @Date: 2023/09/16
 */
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
    "use strict";

    // 获取当前页面的URL
    var currentUrl = window.location.href;
    if (currentUrl.includes("pbs.twimg.com")) {
        getOrig();
    } else if (currentUrl.includes("twitter.com")) {
        addBtn();
    }

    function getOrig() {
        if (currentUrl.includes("orig")) {
            return;
        }

        // 替换name参数的值为"orig"
        var newUrl = currentUrl.replace(/name=[^&]+/, "name=orig");

        // 如果您想重定向到修改后的URL，可以使用以下代码
        window.location.href = newUrl;
    }

    function addBtn() {
        var processedImages = new Set(); // 用于跟踪已处理的图片

        // 创建MutationObserver来监视DOM树的变化
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                // 检查是否有新的图片加载
                let tweetContainers = mutation.target.querySelectorAll('div[aria-label][data-testid="tweetPhoto"]');

                tweetContainers.forEach(function (container) {
                    let images = container.querySelectorAll("img");

                    images.forEach(function (image) {
                        let imageUrl = image.getAttribute("src");
                        let classText = image.getAttribute("class");
                        let buttonHtml = `<div class="aaa" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 2;"></div>
                    <button style="background: none;border: none;padding: 0;margin: 0;cursor: pointer; z-index: 1;" id="btn${classText}">
                        <svg t="1694962361717" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5412" width="16" height="16"><path d="M761.088 715.3152a38.7072 38.7072 0 0 1 0-77.4144 37.4272 37.4272 0 0 0 37.4272-37.4272V265.0112a37.4272 37.4272 0 0 0-37.4272-37.4272H425.6256a37.4272 37.4272 0 0 0-37.4272 37.4272 38.7072 38.7072 0 1 1-77.4144 0 115.0976 115.0976 0 0 1 114.8416-114.8416h335.4624a115.0976 115.0976 0 0 1 114.8416 114.8416v335.4624a115.0976 115.0976 0 0 1-114.8416 114.8416z" p-id="5413" fill="#536471"></path><path d="M589.4656 883.0976H268.1856a121.1392 121.1392 0 0 1-121.2928-121.2928v-322.56a121.1392 121.1392 0 0 1 121.2928-121.344h321.28a121.1392 121.1392 0 0 1 121.2928 121.2928v322.56c1.28 67.1232-54.1696 121.344-121.2928 121.344zM268.1856 395.3152a43.52 43.52 0 0 0-43.8784 43.8784v322.56a43.52 43.52 0 0 0 43.8784 43.8784h321.28a43.52 43.52 0 0 0 43.8784-43.8784v-322.56a43.52 43.52 0 0 0-43.8784-43.8784z" p-id="5414" fill="#536471"></path></svg>
                    </button>`;
                        // let buttonHtml = `<button id="btn${classText}"><svg t="1694962091616" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4129" id="mx_n_1694962091617" width="16" height="16"><path d="M160 579.2a28.8 28.8 0 0 1 28.8 28.8v170.672c0 30.4 25.664 56.528 59.2 56.528h528c33.536 0 59.2-26.144 59.2-56.528V608a28.8 28.8 0 0 1 57.6 0v170.672c0 63.856-53.12 114.128-116.8 114.128h-528c-63.68 0-116.8-50.272-116.8-114.128V608a28.8 28.8 0 0 1 28.8-28.8z" fill="#536471" p-id="4130"></path><path d="M540.8 176l0 464a28.8 28.8 0 0 1-57.6 0L483.2 176a28.8 28.8 0 0 1 57.6 0z" fill="#536471" p-id="4131"></path><path d="M331.632 459.632a28.8 28.8 0 0 1 40.736 0l160 160a28.8 28.8 0 0 1-40.736 40.736l-160-160a28.8 28.8 0 0 1 0-40.736z" fill="#536471" p-id="4132"></path><path d="M692.368 459.632a28.8 28.8 0 0 0-40.736 0l-160 160a28.8 28.8 0 0 0 40.736 40.736l160-160a28.8 28.8 0 0 0 0-40.736z" fill="#536471" p-id="4133"></path></svg></button>`;
                        if (!processedImages.has(imageUrl)) {
                            processedImages.add(imageUrl); // 将图片标记为已处理

                            let newUrl = imageUrl.replace(/name=[^&]+/, "name=orig");

                            let imageLink = image.parentElement;
                            var parentElement = imageLink.closest(".css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu");
                            console.log(parentElement);

                            var aaa = parentElement.querySelector(".css-1dbjc4n.r-1jkjb");
                            console.log(aaa);

                            // 创建按钮元素
                            var button = document.createElement("div");
                            button.innerHTML = buttonHtml;

                            // 添加样式属性来定位按钮
                            // button.style.position = "absolute";
                            // button.style.top = "0";
                            // button.style.right = "20px";
                            // button.style.zIndex = "999";
                            // button.style.marginRight = "16px";
                            button.style.display = "flex";
                            button.style.flexDirection = "column";
                            button.style.justifyContent = "center";
                            button.style.alignItems = "center";

                            // 按钮点击事件处理程序
                            button.querySelector(`#btn${classText}`).addEventListener("click", function () {
                                // 如果需要将URL复制到剪贴板，请使用Clipboard API或其他方法
                                // 创建一个文本输入元素
                                let input = document.createElement("input");
                                input.style.opacity = 0;
                                document.body.appendChild(input);

                                // 将要复制的文本（URL）设置为文本输入元素的值
                                input.value = newUrl;

                                // 选择文本输入元素中的文本
                                input.select();

                                // 将文本输入元素中的文本复制到剪贴板
                                document.execCommand("copy");

                                // 从文档中移除文本输入元素
                                document.body.removeChild(input);

                                // 现在URL已经复制到剪贴板中
                            });

                            // 移入事件处理程序
                            button.addEventListener("mouseenter", function () {
                                let aaa = this.querySelector(".aaa");
                                let buttonElement = this.querySelector(`#btn${classText}`);

                                // 更改按钮颜色
                                aaa.style.backgroundColor = "rgba(29,155,240,0.1)";

                                // 更改按钮文本颜色（假设是SVG图标的颜色）
                                let svgElement = buttonElement.querySelector("svg");
                                svgElement.style.fill = "#007AFF"; // 可以根据需要更改颜色
                            });

                            // 移出事件处理程序
                            button.addEventListener("mouseleave", function () {
                                let aaa = this.querySelector(".aaa");
                                let buttonElement = this.querySelector(`#btn${classText}`);

                                // 恢复样式
                                aaa.style.backgroundColor = "rgba(0,0,0,0)";

                                // 恢复按钮文本颜色
                                let svgElement = buttonElement.querySelector("svg");
                                svgElement.style.fill = "#536471"; // 恢复默认颜色
                            });

                            // 将按钮添加到图片旁边
                            aaa.appendChild(button);
                        }
                    });
                });
            });
        });

        // 配置MutationObserver以监视子节点添加
        var observerConfig = { childList: true, subtree: true };

        // 在document上启动MutationObserver
        observer.observe(document, observerConfig);
    }
})();
