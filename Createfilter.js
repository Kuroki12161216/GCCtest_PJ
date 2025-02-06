// Createfilter.js

// ※API_URL1は店舗データ取得用（GAS）として利用
const API_URL1 = "https://script.google.com/macros/s/AKfycbzPeBoaX2cMssVfEyeelczNzM0l1BhTO0lVl9RatmxwJIoE-dru5S7uNU0lPYO0TTTT/exec";

document.addEventListener("DOMContentLoaded", () => {
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");

    const storedData = sessionStorage.getItem("storeData");
    if (storedData) {
        populateDropdowns(JSON.parse(storedData));
    } else {
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

        stores.forEach(store => {
            const option = document.createElement("option");
            option.value = store;
            option.textContent = store;
            storeSelect.appendChild(option);
        });

        months.forEach(month => {
            const option = document.createElement("option");
            option.value = month;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }
});
