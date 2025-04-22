const boardData = new Map([
    ["todo", []],
    ["in-progress", []],
    ["done", []]
  ]);
  
  const columns = document.querySelectorAll(".column");
  const board = document.querySelector(".board");
  
  function loadBoard() {
    const saved = localStorage.getItem("kanbanBoard");
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const [key, tasks] of Object.entries(parsed)) {
        boardData.set(key, tasks);
      }
    }
    renderBoard();
  }
  
  function saveBoard() {
    const obj = Object.fromEntries(boardData);
    localStorage.setItem("kanbanBoard", JSON.stringify(obj));
  }
  
  function createTaskElement(text, colKey, index) {
    const card = document.createElement("div");
    card.className = "card bg-[#ecf0f1] p-3 rounded-md cursor-grab shadow-sm transition hover:scale-[1.02] hover:shadow-md active:cursor-grabbing";
    card.draggable = true;
    card.dataset.column = colKey;
    card.dataset.index = index;
  
    card.innerHTML = `
      <div class="task-content flex justify-between items-center gap-2">
        <div contenteditable="true" class="task-text flex-1 p-1">${text}</div>
        <button class="delete-btn px-3 py-1 text-sm text-white bg-[crimson] rounded-md hover:bg-[darkred] transition hover:-translate-y-0.5">Delete</button>
      </div>
    `;
  
    card.addEventListener("dragstart", dragStart);
    return card;
  }
  
  function renderBoard() {
    columns.forEach(col => col.querySelector(".cards").innerHTML = "");
    for (const [key, tasks] of boardData.entries()) {
      const column = document.querySelector(`[data-column="${key}"] .cards`);
      tasks.forEach((task, index) => {
        const { text } = task;
        const card = createTaskElement(text, key, index);
        column.appendChild(card);
      });
    }
  }
  
  function addTask(columnKey) {
    const newTask = { text: "New Task" };
    const updated = [...boardData.get(columnKey), newTask];
    boardData.set(columnKey, updated);
    saveBoard();
    renderBoard();
  
    if (columnKey === "in-progress") {
      const inProgressColumn = document.querySelector('[data-column="in-progress"]');
      const taskCount = boardData.get(columnKey).length;
      inProgressColumn.style.height = `${100 + taskCount * 50}px`; 
    }
  }
  
  let dragged;
  
  function dragStart(e) {
    dragged = e.target;
    e.dataTransfer.effectAllowed = "move";
  }
  
  board.addEventListener("dragover", e => {
    e.preventDefault();
  });
  
  board.addEventListener("drop", e => {
    const columnDiv = e.target.closest(".column");
    if (!columnDiv) return;
    const newCol = columnDiv.dataset.column;
    const oldCol = dragged.dataset.column;
    const index = +dragged.dataset.index;
  
    const [movedTask] = boardData.get(oldCol).splice(index, 1);
    boardData.set(newCol, [...boardData.get(newCol), movedTask]);
  
    saveBoard();
    renderBoard();
  });
  
  board.addEventListener("input", e => {
    if (e.target.classList.contains("task-text")) {
      const card = e.target.closest(".card");
      const { column, index } = card.dataset;
      const tasks = [...boardData.get(column)];
      tasks[index] = { ...tasks[index], text: e.target.textContent };
      boardData.set(column, tasks);
      saveBoard();
    }
  });
  
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const columnKey = btn.closest(".column").dataset.column;
      addTask(columnKey);
    });
  });
  
  board.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
      const card = e.target.closest(".card");
      const { column, index } = card.dataset;
      const tasks = [...boardData.get(column)];
      tasks.splice(index, 1);
      boardData.set(column, tasks);
      saveBoard();
      renderBoard();
    }
  });
  
  loadBoard();
  