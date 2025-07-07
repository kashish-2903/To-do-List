let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const dueDate = document.getElementById("dueDate");
const category = document.getElementById("category");
const pendingList = document.getElementById("pendingTasks");
const completedList = document.getElementById("completedTasks");
const errorText = document.getElementById("error");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const darkToggle = document.getElementById("darkModeToggle");

// Apply previously saved theme on load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  darkToggle.checked = true;
}

darkToggle.addEventListener("change", () => {
  if (darkToggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});


taskForm.addEventListener("submit", addTask);
document.getElementById("clearCompleted").addEventListener("click", clearCompletedTasks);
search.addEventListener("input", displayTasks);
sort.addEventListener("change", displayTasks);

function addTask(e) {
    e.preventDefault();
    const name = taskName.value.trim();
    const date = dueDate.value;
    const cat = category.value;

    if (!name || !date || !cat) {
        const errorMsg = "Please fill both fields.";
        errorText.textContent = errorMsg;

    // Optional fallback for accessibility or mobile
        if (!("Notification" in window)) alert(errorMsg);
        return;
    }

  errorText.textContent = "";

  tasks.push({
    id: Date.now(),
    name,
    due: date,
    completed: false,
    category: cat,
    });

  saveTasks();
  taskForm.reset();
  displayTasks();
}


function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  displayTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  displayTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  displayTasks();
}

function filterAndSortTasks() {
  const keyword = search.value.toLowerCase();
  let filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(keyword) || t.due.includes(keyword)
  );

  if (sort.value === "due") {
    filtered.sort((a, b) => new Date(a.due) - new Date(b.due));
  } else if (sort.value === "status") {
    filtered.sort((a, b) => a.completed - b.completed);
  }
  return filtered;
}

function displayTasks() {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const filteredTasks = filterAndSortTasks();

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = `${task.name} (Due: ${task.due}) [${task.category}]`;

    if (task.completed) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      li.style.animation = "fadeIn 0.3s"; // Optional visual effect
      toggleTask(task.id);
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteTask(task.id);

    li.prepend(checkbox);
    li.appendChild(delBtn);

    if (task.completed) {
      completedList.appendChild(li);
    } else {
      pendingList.appendChild(li);
    }
  });

  // Update progress bar
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("progressText").textContent = `${progress}%`;
  document.getElementById("progressFill").style.width = `${progress}%`;

  // Debug: show task list in console
  console.log("All Tasks:", tasks);
}

displayTasks();
