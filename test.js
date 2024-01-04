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

// 创建一个观察器实例
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
            // 新的节点被添加
            mutation.addedNodes.forEach(function (node) {
                let testid = node.getAttribute('data-testid');
                // 检查新的节点是否是推文
                if (testid && testid === 'cellInnerDiv') {
                    console.log(node);
                    // 在推文中添加一个按钮
                    var btn = document.createElement('button');
                    btn.innerText = 'My Button';
                    node.appendChild(btn);
                }
            });
        }
    });
});

// 配置观察器：观察子节点和后代节点的变化
var config = { childList: true, subtree: true };

// 选择目标节点
let reactRoot = document.querySelector('#react-root');

// 将观察器应用于目标节点
observer.observe(reactRoot, config);
