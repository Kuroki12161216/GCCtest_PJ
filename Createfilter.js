const API_URL1 = "https://script.google.com/macros/s/AKfycbzPeBoaX2cMssVfEyeelczNzM0l1BhTO0lVl9RatmxwJIoE-dru5S7uNU0lPYO0TTTT/exec"; // GAS APIのURLを設定

document.addEventListener("DOMContentLoaded", () => {
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");

    // データを取得してプルダウンを作成
    fetch(API_URL1)
        .then(response => response.json())
        .then(data => {
            const stores = new Set();
            const months = new Set();

            // データから店舗名と月を取得
            data.forEach(item => {
                if (item["店舗名"]) {
                    stores.add(item["店舗名"]);
                }
                if (item["月"]) {
                    months.add(item["月"]);
                }
            });

            // 店舗名のプルダウンを作成
            stores.forEach(store => {
                const option = document.createElement("option");
                option.value = store;
                option.textContent = store;
                storeSelect.appendChild(option);
            });

            // 月のプルダウンを作成
            months.forEach(month => {
                const option = document.createElement("option");
                option.value = month;
                option.textContent = month;
                monthSelect.appendChild(option);
            });
        })
        .catch(error => console.error("データの取得中にエラーが発生しました:", error));
});
