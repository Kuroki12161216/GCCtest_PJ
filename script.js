// script.js

document.addEventListener("DOMContentLoaded", () => {
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");
    const container = document.getElementById("card-container");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const closeModal = document.getElementById("close-modal");

    // 仮説フォーム
    const submitHypothesisButton = document.getElementById("submit-hypothesis");

    // タスクフォーム
    const submitTaskButton = document.getElementById("submit-task");
    const hiddenStoreInput = document.getElementById("hidden-store");

    // クリックされたカードのアイテムを一時的に保持する変数
    let currentItem = null;

    // セッションストレージからデータを取得
    const storedData = sessionStorage.getItem("storeData");
    if (!storedData) {
        console.error("セッションストレージにデータがありません。");
        container.textContent = "データを読み込めませんでした。";
        return;
    }

    const data = JSON.parse(storedData);

    // フィルタリングと表示処理
    const updateDisplay = () => {
        const selectedStore = storeSelect.value;
        const selectedMonth = String(monthSelect.value);

        // コンテナをクリア
        container.innerHTML = "";

        // データをフィルタリング
        const filteredData = data.filter(item => {
            let matches = true;
            if (selectedStore) {
                matches = matches && item["店舗名"] === selectedStore;
            }
            if (selectedMonth) {
                matches = matches && String(item["月"]) === selectedMonth;
            }
            return matches;
        });

        // フィルタリング後のデータをカードとして表示
        if (filteredData.length > 0) {
            displayCards(filteredData, container);
        } else {
            container.textContent = "該当するデータがありません。";
        }
    };

    // プルダウン変更時のイベントリスナー
    storeSelect.addEventListener("change", updateDisplay);
    monthSelect.addEventListener("change", updateDisplay);

    // 初期表示
    updateDisplay();

    // モーダルを閉じるイベント
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // モーダル以外をクリックした場合にモーダルを閉じる
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    /**
     * モーダルの内容を更新する関数
     * @param {object} item - 現在表示するデータオブジェクト
     */
    function renderModalContent(item) {
        // 既存の内容をクリア
        modalContent.innerHTML = "";

        // 仮説とネクストアクションがあれば表示
        if (item["仮説"]) {
            const p = document.createElement("p");
            p.innerHTML = `<strong>仮説:</strong> ${item["仮説"]}`;
            modalContent.appendChild(p);
        }

        if (item["ネクストアクション"]) {
            const p = document.createElement("p");
            p.innerHTML = `<strong>ネクストアクション:</strong> ${item["ネクストアクション"]}`;
            modalContent.appendChild(p);
        }
    }

    // 仮説フォーム送信
    submitHypothesisButton.addEventListener("click", (event) => {
        event.preventDefault();

        // 入力値を取得
        const hypothesis = document.getElementById("hypothesis").value;
        const nextAction = document.getElementById("next-action").value;

        if (!currentItem) {
            alert("現在表示中のデータがありません。");
            return;
        }

        // ===== 1) ローカルのデータを即時更新 =====
        currentItem["仮説"] = hypothesis;
        currentItem["ネクストアクション"] = nextAction;

        // ===== 2) モーダルに最新の内容を反映 =====
        renderModalContent(currentItem);

        // ===== 3) GAS へ送信 =====
        const payload = {
            仮説: hypothesis,
            ネクストアクション: nextAction
        };

        // ★ 実際の GAS API に置き換えてください
        fetch("<GAS_API_URL>", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            alert("仮説データが送信されました！");
        })
        .catch(error => {
            console.error("エラーが発生しました:", error);
            alert("仮説データ送信に失敗しました。");
        });
    });

    // タスクフォーム送信
    submitTaskButton.addEventListener("click", (event) => {
        event.preventDefault();

        const storeName = hiddenStoreInput.value;
        const task = document.getElementById("task").value;
        const deadline = document.getElementById("deadline").value;
        const responsible = document.getElementById("responsible").value;

        // 送信用の JSON
        const payload = {
            店舗名: storeName,
            タスク: task,
            期限: deadline,
            責任者: responsible
        };

        // ★ 実際の GAS API へ変更してください
        fetch("<GAS_API_URL_FOR_TASK>", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            alert("タスクが追加されました！");
            modal.style.display = "none";
        })
        .catch(error => {
            console.error("エラーが発生しました:", error);
            alert("タスク送信に失敗しました。");
        });
    });

    /**
     * フィルタリングされたデータをカードとして表示する関数
     * @param {Array} items - フィルタリングされたデータ配列
     * @param {HTMLElement} container - カードを表示するコンテナ
     */
    function displayCards(items, container) {
        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "card";

            // カード要素の内容作成
            for (const key in item) {
                // 仮説やネクストアクションはカード上で表示しない場合はスキップしてOK
                if (key !== "仮説" && key !== "ネクストアクション") {
                    const element = document.createElement("p");
                    element.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
                    card.appendChild(element);
                }
            }

            // カードクリック時の処理
            card.addEventListener("click", () => {
                // 現在のアイテムを保持
                currentItem = item;

                // モーダル用の隠しフィールドに店舗名を保存
                hiddenStoreInput.value = item["店舗名"] || "";

                // 現在のアイテム内容をモーダルに反映
                renderModalContent(currentItem);

                // モーダル表示
                modal.style.display = "flex";
            });

            container.appendChild(card);
        });
    }
});
