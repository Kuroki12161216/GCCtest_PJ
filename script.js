document.addEventListener("DOMContentLoaded", () => {
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");
    const container = document.getElementById("card-container");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const closeModal = document.getElementById("close-modal");
    const submitButton = document.getElementById("submit-button");

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
                matches = matches && String(item["月"] )=== selectedMonth;
            }

            return matches;
        });

        // フィルタリング後のデータをカードとして表示
        if (filteredData.length > 0) {
            displayCards(filteredData, container, modal, modalContent);
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
    // データ送信
    submitButton.addEventListener("click", () => {
        const hypothesis = document.getElementById("hypothesis").value;
        const nextAction = document.getElementById("next-action").value;
        const task = document.getElementById("task").value;
        const deadline = document.getElementById("deadline").value;
        const responsible = document.getElementById("responsible").value;

        // フォームデータを送信
        const payload = {
            仮説: hypothesis,
            ネクストアクション: nextAction,
            タスク: task,
            期限: deadline,
            責任者: responsible
        };

        fetch("<GAS_API_URL>", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            alert("データが送信されました！");
            modal.style.display = "none";
        })
        .catch(error => {
            console.error("エラーが発生しました:", error);
            alert("データ送信に失敗しました。");
        });
    });
});

/**
 * フィルタリングされたデータをカードとして表示する関数
 * @param {Array} data - フィルタリングされたデータ配列
 * @param {HTMLElement} container - カードを表示するコンテナ
 * @param {HTMLElement} modal - モーダルエレメント
 * @param {HTMLElement} modalContent - モーダルコンテンツエレメント
 */
function displayCards(data, container, modal, modalContent) {
    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        let hasNextAction = false;
        const nextActionData = {};

        let hasHypothesis = false;
        const HypothesisData = {};

        // 各プロパティをカードに追加
        for (const key in item) {
            if (key === "ネクストアクション") {
                hasNextAction = true;
                nextActionData[key] = item[key];
            } else if  (key === "仮説") {
                hasHypothesis = true;
                HypothesisData[key] = item[key];
            } else {
                const element = document.createElement("p");
                element.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
                card.appendChild(element);
            }
        }

        // ネクストアクションがある場合、クリックイベントで表示
        if (hasNextAction) {
            card.addEventListener("click", () => {
                modalContent.innerHTML = ""; // モーダル内容をリセット

                for (const key in HypothesisData) {
                    const element = document.createElement("p");
                    element.innerHTML = `<strong>${key}:</strong> ${HypothesisData[key]}`;
                    modalContent.appendChild(element);
                }
                for (const key in nextActionData) {
                    const element = document.createElement("p");
                    element.innerHTML = `<strong>${key}:</strong> ${nextActionData[key]}`;
                    modalContent.appendChild(element);
                }

                modal.style.display = "flex";
            });
        }

        container.appendChild(card);
    });
}
