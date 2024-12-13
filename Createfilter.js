const API_URL1 = "https://script.google.com/macros/s/AKfycbzPeBoaX2cMssVfEyeelczNzM0l1BhTO0lVl9RatmxwJIoE-dru5S7uNU0lPYO0TTTT/exec"; // GAS APIのURLを設定

document.addEventListener("DOMContentLoaded", () => {
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");

    // セッションストレージにデータがあれば、それを使用する
    const storedData = sessionStorage.getItem("storeData");
    if (storedData) {
        // データがある場合、プルダウンを生成
        populateDropdowns(JSON.parse(storedData), storeSelect, monthSelect);
    } else {
        // データがない場合、APIから取得してセッションストレージに保存
        fetch(API_URL1)
            .then(response => response.json())
            .then(data => {
                // セッションストレージに保存
                sessionStorage.setItem("storeData", JSON.stringify(data));
                // プルダウンを生成
                populateDropdowns(data, storeSelect, monthSelect);
            })
            .catch(error => console.error("データの取得中にエラーが発生しました:", error));
    }
});

/**
 * プルダウンメニューを生成する関数
 * @param {Array} data - データ配列
 * @param {HTMLElement} storeSelect - 店舗名セレクトボックス
 * @param {HTMLElement} monthSelect - 月セレクトボックス
 */
function populateDropdowns(data, storeSelect, monthSelect) {
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
}
