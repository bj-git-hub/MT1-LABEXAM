import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexFilePath = path.join(__dirname, 'public', 'index.html');

const tasks = [
  {
    id: 1,
    taskName: 'Develop Login Page',
    assignedTo: 'Rahul Sharma',
    status: 'Pending'
  },
  {
    id: 2,
    taskName: 'Design Dashboard',
    assignedTo: 'Priya Patel',
    status: 'In Progress'
  }
];

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

function sendHtml(response, statusCode, html) {
  response.writeHead(statusCode, { 'Content-Type': 'text/html' });
  response.end(html);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Request body must contain valid JSON.'));
      }
    });

    request.on('error', reject);
  });
}

function hasRequiredTaskDetails(task) {
  return task
    && task.id !== undefined
    && task.taskName
    && task.assignedTo
    && task.status;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'GET' && requestUrl.pathname === '/') {
    sendHtml(response, 200, '<h1>Welcome to Employee Task Management</h1>');
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/tasks') {
    sendJson(response, 200, tasks);
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/about') {
    sendHtml(response, 200, '<h1>About</h1><p>This application manages employee tasks.</p>');
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/home') {
    fs.readFile(indexFilePath, 'utf8', (error, fileContent) => {
      if (error) {
        sendJson(response, 500, { message: 'Unable to read the home page.' });
        return;
      }

      sendHtml(response, 200, fileContent);
    });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/add-task') {
    try {
      const newTask = await readRequestBody(request);

      if (!hasRequiredTaskDetails(newTask)) {
        sendJson(response, 400, {
          message: 'id, taskName, assignedTo and status are required.'
        });
        return;
      }

      if (tasks.some((task) => task.id === newTask.id)) {
        sendJson(response, 400, { message: 'A task with this ID already exists.' });
        return;
      }

      tasks.push(newTask);
      sendJson(response, 201, { message: 'Task added successfully', task: newTask });
    } catch (error) {
      sendJson(response, 400, { message: error.message });
    }
    return;
  }

  sendJson(response, 404, { message: 'Route not found.' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
