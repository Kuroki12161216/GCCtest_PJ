const API_URL = "https://script.google.com/macros/s/AKfycbzFn15ZEzsd4OzDdg-Yll4qF6zypdxqokLt269dYjlPmVk3YAcS82teaNqifK3Hybl8/exec"; // GASで作成したAPIのURLを入力

// データをフェッチしてカード形式で表示
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("card-container");
        const modal = document.getElementById("modal");
        const modalContent = document.getElementById("modal-content");
        const closeModal = document.getElementById("close-modal");

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

        // カード作成
        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "card";

            let hasNextAction = false; // ネクストアクションがあるかを確認
            const nextActionData = {};

            // 各プロパティをカードに追加
            for (const key in item) {
                if (key === "ネクストアクション") {
                    hasNextAction = true;
                    nextActionData[key] = item[key];
                    break; // ネクストアクション以降はカードに含めない
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
    })
    .catch(error => {
        console.error("データの取得中にエラーが発生しました:", error);
        const container = document.getElementById("card-container");
        container.textContent = "データを読み込めませんでした。";
    });