// Createfilter.js

// このAPI_URLは、店舗データや月データの取得用(GAS)を想定
const API_URL1 = "https://script.google.com/macros/s/AKfycbzPeBoaX2cMssVfEyeelczNzM0l1BhTO0lVl9RatmxwJIoE-dru5S7uNU0lPYO0TTTT/exec";

document.addEventListener("DOMContentLoaded", () => {
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");

    // セッションストレージにデータがあれば、それを使用
    const storedData = sessionStorage.getItem("storeData");
    if (storedData) {
        // データがある場合、プルダウンを生成
        populateDropdowns(JSON.parse(storedData));
    } else {
        // データがない場合、APIから取得してセッションストレージに保存
        fetch(API_URL1)
            .then(response => response.json())
            .then(data => {
                sessionStorage.setItem("storeData", JSON.stringify(data));
                populateDropdowns(data);
            })
            .catch(error => console.error("データの取得中にエラーが発生しました:", error));
    }

    function populateDropdowns(data) {
        const stores = new Set();
        const months = new Set();

        data.forEach(item => {
            if (item["店舗名"]) {
                stores.add(item["店舗名"]);
            }
            if (item["月"]) {
                months.add(item["月"]);
            }
        });

        // 店舗名プルダウンを作成
        stores.forEach(store => {
            const option = document.createElement("option");
            option.value = store;
            option.textContent = store;
            storeSelect.appendChild(option);
        });

        // 月プルダウンを作成
        months.forEach(month => {
            const option = document.createElement("option");
            option.value = month;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }
});
