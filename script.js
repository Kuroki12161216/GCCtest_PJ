// script.js

document.addEventListener("DOMContentLoaded", () => {
    // --- 店舗診断表（Diagnosis）関連要素 ---
    const storeSelect = document.getElementById("store-select");
    const monthSelect = document.getElementById("month-select");
    const cardContainer = document.getElementById("card-container");
  
    // --- モーダル関連要素 ---
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const closeModal = document.getElementById("close-modal");
    const submitHypothesisButton = document.getElementById("submit-hypothesis");
    const submitTaskButton = document.getElementById("submit-task");
    const hiddenStoreInput = document.getElementById("hidden-store");
  
    // --- サイドバー・ビュー切り替え関連 ---
    const navDiagnosis = document.getElementById("nav-diagnosis");
    const navTasks = document.getElementById("nav-tasks");
    const diagnosisView = document.getElementById("diagnosis-view");
    const tasksView = document.getElementById("tasks-view");
  
    // --- タスク一覧関連 ---
    const addTaskButton = document.getElementById("add-task-button");
    const deleteTasksButton = document.getElementById("delete-tasks-button");
    const tasksListContainer = document.getElementById("tasks-list");
  
    // --- グローバル変数 ---
    let currentItem = null; // 現在クリックされたカードのデータ
    let tasks = [];         // タスク一覧（実際はGASから取得）
  
    // --- 店舗データの取得 ---
    const storedData = sessionStorage.getItem("storeData");
    if (!storedData) {
      console.error("セッションストレージにデータがありません。");
      cardContainer.textContent = "データを読み込めませんでした。";
      return;
    }
    const storeData = JSON.parse(storedData);
  
    // --- 店舗診断表のカード表示 ---
    function updateDisplay() {
      const selectedStore = storeSelect.value;
      const selectedMonth = String(monthSelect.value);
      cardContainer.innerHTML = "";
  
      const filteredData = storeData.filter(item => {
        let matches = true;
        if (selectedStore) {
          matches = matches && item["店舗名"] === selectedStore;
        }
        if (selectedMonth) {
          matches = matches && String(item["月"]) === selectedMonth;
        }
        return matches;
      });
  
      if (filteredData.length > 0) {
        displayCards(filteredData);
      } else {
        cardContainer.textContent = "該当するデータがありません。";
      }
    }
  
    storeSelect.addEventListener("change", updateDisplay);
    monthSelect.addEventListener("change", updateDisplay);
    updateDisplay();
  
    // --- カードクリック時のモーダル表示 ---
    function displayCards(items) {
      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
  
        // カード上では仮説・ネクストアクション以外を表示
        for (const key in item) {
          if (key !== "仮説" && key !== "ネクストアクション") {
            const element = document.createElement("p");
            element.innerHTML = `<strong>${key}:</strong> ${item[key]}`;
            card.appendChild(element);
          }
        }
  
        card.addEventListener("click", () => {
          currentItem = item;
          hiddenStoreInput.value = item["店舗名"] || "";
          renderModalContent(currentItem);
          modal.style.display = "flex";
        });
        cardContainer.appendChild(card);
      });
    }
  
    // --- モーダル内の内容更新 ---
    function renderModalContent(item) {
      modalContent.innerHTML = "";
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
  
    // --- モーダルの閉じる処理 ---
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  
    // --- 仮説フォーム送信 ---
    submitHypothesisButton.addEventListener("click", (event) => {
      event.preventDefault();
      const hypothesis = document.getElementById("hypothesis").value;
      const nextAction = document.getElementById("next-action").value;
      if (!currentItem) {
        alert("現在表示中のデータがありません。");
        return;
      }
      // ローカル上のデータ更新
      currentItem["仮説"] = hypothesis;
      currentItem["ネクストアクション"] = nextAction;
      renderModalContent(currentItem);
  
      const payload = {
        仮説: hypothesis,
        ネクストアクション: nextAction,
        店舗名: currentItem["店舗名"] || ""
      };
  
      // GAS側のAPI URL（実際のURLに置換）
      fetch("<GAS_API_URL>", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
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
  
    // --- タスクフォーム送信（モーダル内） ---
    submitTaskButton.addEventListener("click", (event) => {
      event.preventDefault();
      const storeName = hiddenStoreInput.value;
      const task = document.getElementById("task").value;
      const deadline = document.getElementById("deadline").value;
      const responsible = document.getElementById("responsible").value;
  
      const payload = {
        店舗名: storeName,
        タスク: task,
        期限: deadline,
        責任者: responsible
      };
  
      fetch("https://script.google.com/macros/s/AKfycbxBCvjm1EFSr6zQODhRiy4C6C7YJtYnL1P4uG2CCQvpi4ZZ9WSN6xXFYPT80vO2ll2z/exec", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        alert("タスクが追加されました！");
        modal.style.display = "none";
        loadTasks(); // タスク一覧を更新
      })
      .catch(error => {
        console.error("エラーが発生しました:", error);
        alert("タスク送信に失敗しました。");
      });
    });
  
    // --- サイドバーによるビュー切り替え ---
    navDiagnosis.addEventListener("click", (e) => {
      e.preventDefault();
      diagnosisView.style.display = "block";
      tasksView.style.display = "none";
      navDiagnosis.classList.add("active");
      navTasks.classList.remove("active");
    });
    navTasks.addEventListener("click", (e) => {
      e.preventDefault();
      diagnosisView.style.display = "none";
      tasksView.style.display = "block";
      navTasks.classList.add("active");
      navDiagnosis.classList.remove("active");
      loadTasks(); // タスク一覧をロード
    });
  
    // --- 「タスク追加」ボタン（タスク一覧ビュー） ---
    addTaskButton.addEventListener("click", () => {
      // フォームの初期化（必要に応じて）
      document.getElementById("task").value = "";
      document.getElementById("deadline").value = "";
      document.getElementById("responsible").value = "";
      hiddenStoreInput.value = "";
      modal.style.display = "flex";
    });
  
    // --- タスク一覧のロード ---
    function loadTasks() {
      // ※実際はGASのタスク一覧取得APIを利用する
      fetch("https://script.google.com/macros/s/AKfycbzGi5z1dJYaN82Xi5eO-DCP1fujvbrQjivBmPymm1mf6ZC8Vrxp8aQvwUBThiK0RLq7/exec")
        .then(response => response.json())
        .then(data => {
          tasks = data; // dataはタスクの配列と仮定
          renderTasks();
        })
        .catch(error => {
          console.error("タスクの取得中にエラーが発生しました:", error);
          tasksListContainer.textContent = "タスクを読み込めませんでした。";
        });
    }
  
    // --- タスク一覧の表示 ---
    function renderTasks() {
      tasksListContainer.innerHTML = "";
      if (tasks.length === 0) {
        tasksListContainer.textContent = "タスクがありません。";
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      tasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        // 期限による強調表示
        if (task.期限) {
          if (task.期限 < today) {
            taskItem.classList.add("overdue");
          } else if (task.期限 === today) {
            taskItem.classList.add("due-today");
          }
        }
        // チェックボックス
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.dataset.taskId = task.id;  // タスクごとに一意のIDがある前提
  
        // タスク詳細
        const details = document.createElement("div");
        details.className = "task-details";
        details.innerHTML = `<strong>${task.タスク}</strong><br>
                             店舗: ${task.店舗名} | 期限: ${task.期限} | 責任者: ${task.責任者}`;
  
        taskItem.appendChild(checkbox);
        taskItem.appendChild(details);
        tasksListContainer.appendChild(taskItem);
      });
    }
  
    // --- タスク削除処理 ---
    deleteTasksButton.addEventListener("click", () => {
      const selectedCheckboxes = document.querySelectorAll(".task-checkbox:checked");
      if (selectedCheckboxes.length === 0) {
        alert("削除するタスクを選択してください。");
        return;
      }
      if (!confirm("選択されたタスクを削除してもよろしいですか？")) {
        return;
      }
      const idsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.taskId);
      const payload = { ids: idsToDelete };
  
      fetch("<GAS_API_URL_FOR_TASK_DELETE>", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        alert("タスクが削除されました！");
        loadTasks();
      })
      .catch(error => {
        console.error("タスク削除中にエラーが発生しました:", error);
        alert("タスクの削除に失敗しました。");
      });
    });
  });
  