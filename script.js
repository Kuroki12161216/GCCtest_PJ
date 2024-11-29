const API_URL = "https://script.google.com/macros/s/AKfycbzFn15ZEzsd4OzDdg-Yll4qF6zypdxqokLt269dYjlPmVk3YAcS82teaNqifK3Hybl8/exec"; // GASで作成したAPIのURLを入力

// データをフェッチしてカード形式で表示する
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("card-container");

        // データを元にカードを作成
        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "card";

            // 各プロパティをカードに追加
            for (const key in item) {
                if (key === Object.keys(item)[0]) {
                    // 最初のキーをタイトルとする（例: 名前やIDなど）
                    const title = document.createElement("h3");
                    title.textContent = item[key];
                    card.appendChild(title);
                } else {
                    // 他のキーは説明文として追加
                    const paragraph = document.createElement("p");
                    paragraph.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
                    card.appendChild(paragraph);
                }
            }

            container.appendChild(card);
        });
    })
    .catch(error => {
        console.error("データの取得中にエラーが発生しました:", error);
        const container = document.getElementById("card-container");
        container.textContent = "データを読み込めませんでした。";
    });

