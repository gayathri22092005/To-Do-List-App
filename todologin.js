10.26 8:52 PM
Javascript Code
// === LOGIN PAGE VARIABLES ===
const form = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const warning = document.getElementById('passwordWarning');
const togglePassword = document.getElementById('togglePassword');
const loginPage = document.getElementById('loginPage');
const todoApp = document.getElementById('todoApp');
const usernameInput = document.getElementById('username');
const logoutBtn = document.getElementById('logoutBtn');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
// Auto-expand textarea as user types
const taskDesc = document.getElementById('taskDesc');

taskDesc.addEventListener('input', () => {
  taskDesc.style.height = 'auto';          // Reset height
  taskDesc.style.height = taskDesc.scrollHeight + 'px'; // Set to scroll height
});


// === PASSWORD VISIBILITY ===
togglePassword.addEventListener('click', () => {
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  togglePassword.src = passwordInput.type === 'password'
    ? 'https://cdn-icons-png.flaticon.com/512/565/565655.png'
    : 'https://cdn-icons-png.flaticon.com/512/159/159604.png';
});

// === LOGIN VALIDATION ===
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  const numberRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  if (!numberRegex.test(password) || !specialCharRegex.test(password)) {
    warning.textContent = "Password must contain at least one number and one special character.";
    return;
  } else {
    warning.textContent = "";
  }

  let users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[username]) {
    if (users[username].password !== password) {
      warning.textContent = "Incorrect username or password.";
      return;
    }
  } else {
    users[username] = { password: password, todos: [] };
    localStorage.setItem('users', JSON.stringify(users));
  }

  localStorage.setItem('currentUser', username);
  loadTodos();
  loginPage.style.display = 'none';
  todoApp.style.display = 'block';
});

// === LOAD TODOS ===
function loadTodos() {
  todoList.innerHTML = '';
  const username = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!users[username]) return;

  users[username].todos.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'todoCard';
    li.innerHTML = `
      <div class="todoHeader">
        <strong class="todoTitle">${task.title}</strong>
        <button class="deleteBtn" title="Delete Task" style="background:none; border:none; cursor:pointer;">
          <img src="https://cdn-icons-png.flaticon.com/512/484/484611.png" 
               alt="Delete" 
               style="width:20px; height:20px; filter: grayscale(100%);">
        </button>
      </div>
      <p class="todoDesc">${task.desc || ''}</p>
      <div class="todoInfo">
        <span><strong>Category:</strong> ${task.category}</span>
        <span class="priority ${task.priority.toLowerCase()}"><strong>Priority:</strong> ${task.priority}</span>
        <span><strong>Date:</strong> ${formatDate(task.date)}</span>
      </div>
    `;

    const deleteBtn = li.querySelector('.deleteBtn');
    deleteBtn.addEventListener('click', () => {
      showDeletePopup(() => {
        users[username].todos.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        li.classList.add('fadeOut');
        setTimeout(() => {
          loadTodos();
          showToast("️ Task deleted successfully!");
        }, 300);
      });
    });

    todoList.appendChild(li);
  });
}

// === ADD TASK ===
addTodoBtn.addEventListener('click', () => {
  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDesc').value.trim();
  const date = document.getElementById('taskDate').value;
  const category = document.getElementById('taskCategory').value;
  const priority = document.getElementById('taskPriority').value;

  const warningMsg = document.getElementById('todoWarning') || createTodoWarning();
  if (!title || !date) {
    warningMsg.textContent = "Please provide at least a title and date.";
    return;
  } else {
    warningMsg.textContent = "";
  }

  const username = localStorage.getItem('currentUser');
  let users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!users[username].todos) users[username].todos = [];

  users[username].todos.push({ title, desc, date, category, priority });
  localStorage.setItem('users', JSON.stringify(users));

  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskDate').value = '';

  loadTodos();
  showToast("✅ Task added successfully!");
});

// === LOGOUT BUTTON POSITION ===
logoutBtn.style.position = 'absolute';
logoutBtn.style.top = '20px';
logoutBtn.style.right = '20px';
logoutBtn.style.backgroundColor = '#6d28d9';
logoutBtn.style.color = 'white';
logoutBtn.style.padding = '8px 16px';
logoutBtn.style.border = 'none';
logoutBtn.style.borderRadius = '6px';
logoutBtn.style.cursor = 'pointer';
logoutBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
logoutBtn.style.fontWeight = '600';

logoutBtn.addEventListener('mouseover', () => {
  logoutBtn.style.backgroundColor = '#5b21b6';
});

logoutBtn.addEventListener('mouseout', () => {
  logoutBtn.style.backgroundColor = '#6d28d9';
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  todoApp.style.display = 'none';
  loginPage.style.display = 'flex';
});

// === ENTER TO NEXT INPUT ===
const taskInputs = [
  document.getElementById('taskTitle'),
  document.getElementById('taskDesc'),
  document.getElementById('taskDate'),
  document.getElementById('taskCategory'),
  document.getElementById('taskPriority')
];

taskInputs.forEach((input, index) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = taskInputs[index + 1];
      if (nextInput) nextInput.focus();
      else addTodoBtn.click();
    }
  });
});

// === HELPER FUNCTIONS ===
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function createTodoWarning() {
  const warningEl = document.createElement('div');
  warningEl.id = 'todoWarning';
  warningEl.style.color = 'red';
  warningEl.style.marginTop = '5px';
  document.getElementById('todoForm').appendChild(warningEl);
  return warningEl;
}

// === CUSTOM DELETE POPUP ===
function showDeletePopup(onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'popupOverlay';
  overlay.innerHTML = `
    <div class="popupBox">
      <h3>Delete Task?</h3>
      <p>Are you sure you want to delete this task? This action cannot be undone.</p>
      <div class="popupButtons">
        <button id="confirmDelete">Yes, Delete</button>
        <button id="cancelDelete">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('confirmDelete').onclick = () => {
    onConfirm();
    overlay.remove();
  };

  document.getElementById('cancelDelete').onclick = () => overlay.remove();
}

// === TOAST MESSAGE ===
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toastMessage';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}
