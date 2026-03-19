const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const exportBtn = document.getElementById('exportBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();

addTaskBtn.addEventListener('click', addTask);
exportBtn.addEventListener('click', exportToWord);

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  const task = { text: taskText, completed: false };
  tasks.push(task);
  taskInput.value = '';
  saveAndRender();
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.classList.toggle('completed', task.completed);
    li.addEventListener('click', () => toggleTask(index));
    li.addEventListener('dblclick', () => deleteTask(index));
    taskList.appendChild(li);
  });
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

async function exportToWord() {
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'Lista de Tarefas - TaskMate', bold: true, size: 28 })],
        }),
        ...tasks.map((task, i) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}. ${task.text} ${task.completed ? '(Concluída)' : ''}`,
                strike: task.completed,
                color: task.completed ? '888888' : '000000'
              })
            ]
          })
        )
      ],
    }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Tarefas_TaskMate.docx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
