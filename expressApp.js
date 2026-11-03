import express from 'express';

const PORT = 4000;
const app = express();

app.use(express.json());

const tasks = [
  {
    id: 1,
    taskName: 'Develop Login Page',
    assignedTo: 'Rahul Sharma',
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 2,
    taskName: 'Design Dashboard',
    assignedTo: 'Priya Patel',
    status: 'In Progress',
    priority: 'Medium'
  },
  {
    id: 3,
    taskName: 'Test User Registration',
    assignedTo: 'Amit Kumar',
    status: 'Completed',
    priority: 'Low'
  }
];

const requiredTaskFields = ['id', 'taskName', 'assignedTo', 'status', 'priority'];

function hasRequiredTaskFields(task) {
  return task
    && requiredTaskFields.every((field) => task[field] !== undefined && task[field] !== '');
}

function findTask(taskId) {
  return tasks.find((task) => task.id === Number(taskId));
}

app.get('/tasks', (request, response) => {
  response.json(tasks);
});

app.get('/tasks/:id', (request, response) => {
  const task = findTask(request.params.id);

  if (!task) {
    response.status(404).json({ message: 'Task not found.' });
    return;
  }

  response.json(task);
});

app.post('/tasks', (request, response) => {
  const newTask = request.body;

  if (!hasRequiredTaskFields(newTask)) {
    response.status(400).json({
      message: 'id, taskName, assignedTo, status and priority are required.'
    });
    return;
  }

  if (tasks.some((task) => task.id === newTask.id)) {
    response.status(400).json({ message: 'A task with this ID already exists.' });
    return;
  }

  tasks.push(newTask);
  response.status(201).json({ message: 'Task added successfully', task: newTask });
});

app.put('/tasks/:id', (request, response) => {
  const task = findTask(request.params.id);

  if (!task) {
    response.status(404).json({ message: 'Task not found.' });
    return;
  }

  const allowedFields = ['taskName', 'assignedTo', 'status', 'priority'];
  const suppliedFields = allowedFields.filter((field) => request.body[field] !== undefined);

  if (suppliedFields.length === 0) {
    response.status(400).json({ message: 'At least one task field is required.' });
    return;
  }

  const emptyField = suppliedFields.find((field) => request.body[field] === '');

  if (emptyField) {
    response.status(400).json({ message: `${emptyField} cannot be empty.` });
    return;
  }

  suppliedFields.forEach((field) => {
    task[field] = request.body[field];
  });

  response.json({ message: 'Task updated successfully', task });
});

app.delete('/tasks/:id', (request, response) => {
  const taskIndex = tasks.findIndex((task) => task.id === Number(request.params.id));

  if (taskIndex === -1) {
    response.status(404).json({ message: 'Task not found.' });
    return;
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  response.json({ message: 'Task deleted successfully', task: deletedTask });
});

app.use((request, response) => {
  response.status(404).json({ message: 'Route not found.' });
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    response.status(400).json({ message: 'Request body must contain valid JSON.' });
    return;
  }

  response.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
