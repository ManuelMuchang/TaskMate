const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const exportBtn = document.getElementById('exportBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

renderTasks();
updateDashboard();

// EVENTOS
addTaskBtn.addEventListener('click', addTask);
exportBtn.addEventListener('click', exportToWord);

taskInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addTask();
});

// ADICIONAR
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ text, completed: false });
  taskInput.value = '';
  save();
}

// RENDER
function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.completed) li.classList.add('completed');

    li.onclick = () => toggleTask(index);
    li.ondblclick = () => deleteTask(index);

    taskList.appendChild(li);
  });
}

// TOGGLE
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  save();
}

// DELETE
function deleteTask(index) {
  if (!confirm('Remover tarefa?')) return;
  tasks.splice(index, 1);
  save();
}

// SAVE
function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  updateDashboard();
}

// DASHBOARD
function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;

  const progress = total === 0 ? 0 : (completed / total) * 100;
  document.getElementById('progress').style.width = progress + '%';
}

// EXPORTAR
async function exportToWord() {
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'TaskMate - Lista de Tarefas', bold: true, size: 28 })],
        }),
        new Paragraph({
          children: [new TextRun(`Data: ${new Date().toLocaleDateString()}`)],
        }),
        ...tasks.map((task, i) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}. ${task.text}`,
                strike: task.completed
              })
            ]
          })
        )
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tarefas.docx';
  link.click();
}