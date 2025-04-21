const boardData = new Map([
    ["todo", []],
    ["in-progress", []],
    ["done", []]
  ]);
  
  const columns = document.querySelectorAll(".column");
  const board = document.querySelector(".board");
  
  // Load from localStorage
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
  
  // Save to localStorage
  function saveBoard() {
    const obj = Object.fromEntries(boardData);
    localStorage.setItem("kanbanBoard", JSON.stringify(obj));
  }
  
  // Create task element
  function createTaskElement(text, colKey, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.column = colKey;
    card.dataset.index = index;
    card.innerHTML = `
      <div contenteditable="true" class="task-text">${text}</div>
    `;
    card.addEventListener("dragstart", dragStart);
    return card;
  }
  
  // Render full board
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
  
  // Add task
  function addTask(columnKey) {
    const newTask = { text: "New Task" };
    const updated = [...boardData.get(columnKey), newTask];
    boardData.set(columnKey, updated);
    saveBoard();
    renderBoard();

    // Dynamically adjust the height of the "In Progress" column
    if (columnKey === "in-progress") {
      const inProgressColumn = document.querySelector('[data-column="in-progress"]');
      const taskCount = boardData.get(columnKey).length;

      // Adjust height based on the number of tasks
      inProgressColumn.style.height = `${100 + taskCount * 50}px`; // Example: base height + 50px per task
    }
  }
  
  // Drag and drop logic
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
  
  // Handle editable task saving
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
  
  // Button listeners
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const columnKey = btn.closest(".column").dataset.column;
      addTask(columnKey);
    });
  });

  function createTaskElement(text, colKey, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.column = colKey;
    card.dataset.index = index;
    card.innerHTML = `
  <div class="task-content">
    <div contenteditable="true" class="task-text">${text}</div>
    <button class="delete-btn">Delete 🗑</button>
  </div>
`;

    card.addEventListener("dragstart", dragStart);
    return card;
  }
  
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
