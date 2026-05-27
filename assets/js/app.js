(() => {
  const USERS_KEY = 'usuariosAsklepion';
  const SESSION_KEY = 'asklepionSession';

  let roleSelecionada = 'paciente';

  // Elements
  const loginScreen = document.getElementById('loginScreen');
  const registerScreen = document.getElementById('registerScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');

  const cpfGroup = document.getElementById('cpfGroup');
  const crmGroup = document.getElementById('crmGroup');
  const regCpfGroup = document.getElementById('regCpfGroup');
  const regCrmGroup = document.getElementById('regCrmGroup');

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const usuarioInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');
  const toggleBtn = document.getElementById('toggleBtn');

  const cadastroLink = document.getElementById('cadastroLink');
  const voltarLogin = document.getElementById('voltarLogin');

  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');

  const welcomeUser = document.getElementById('welcomeUser');
  const logoutBtn = document.getElementById('logoutBtn');

  const goAgendarBtn = document.getElementById('goAgendarBtn');
  const horariosBtn = document.getElementById('horariosBtn');

  function show(el) { el.style.display = ''; }
  function hide(el) { el.style.display = 'none'; }

  function setScreen(screen) {
    hide(loginScreen);
    hide(registerScreen);
    hide(dashboardScreen);

    if (screen === 'login') show(loginScreen);
    if (screen === 'register') show(registerScreen);
    if (screen === 'dashboard') {
      dashboardScreen.style.display = 'flex';
    }
  }

  function loadUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function setRole(role) {
    roleSelecionada = role;

    // Login screen
    cpfGroup.style.display = roleSelecionada === 'paciente' ? 'block' : 'none';
    crmGroup.style.display = roleSelecionada === 'medico' ? 'block' : 'none';

    // Register screen
    regCpfGroup.style.display = roleSelecionada === 'paciente' ? 'block' : 'none';
    regCrmGroup.style.display = roleSelecionada === 'medico' ? 'block' : 'none';

    // Clear messages
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
  }

  function setActiveRoleBtn(role) {
    document.querySelectorAll('.role-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.role === role);
    });
  }

  function showError(text) {
    errorMsg.textContent = text;
    errorMsg.style.display = 'block';
    setTimeout(() => (errorMsg.style.display = 'none'), 3000);
  }

  function showSuccess(text) {
    successMsg.textContent = text;
    successMsg.style.display = 'block';
  }

  function maskCpf(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);

    let out = p1;
    if (p2) out += '.' + p2;
    if (p3) out += '.' + p3;
    if (p4) out += '-' + p4;
    return out;
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function loginSuccess(user) {
    welcomeUser.innerHTML = `Olá, ${user.nome}`;
    saveSession({
      role: user.perfil,
      nome: user.nome,
      email: user.email || null,
      ts: Date.now(),
    });
    setScreen('dashboard');
  }

  // Role switching
  document.querySelectorAll('.role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      setActiveRoleBtn(role);
      setRole(role);
    });
  });

  // Toggle password
  toggleBtn.addEventListener('click', function () {
    if (senhaInput.type === 'password') {
      senhaInput.type = 'text';
      this.textContent = '🙈';
    } else {
      senhaInput.type = 'password';
      this.textContent = '👁️';
    }
  });

  // Links
  cadastroLink.addEventListener('click', () => {
    setScreen('register');
    setRole(roleSelecionada);
  });

  voltarLogin.addEventListener('click', () => {
    setScreen('login');
  });

  // CPF masks
  const cpfInput = document.getElementById('cpf');
  const regCpfInput = document.getElementById('regCpf');

  cpfInput.addEventListener('input', () => {
    cpfInput.value = maskCpf(cpfInput.value);
  });

  regCpfInput.addEventListener('input', () => {
    regCpfInput.value = maskCpf(regCpfInput.value);
  });

  // Register
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const senha = document.getElementById('regSenha').value;
    const cpf = document.getElementById('regCpf').value.trim();
    const crm = document.getElementById('regCrm').value.trim();

    const users = loadUsers();
    if (!users[roleSelecionada]) users[roleSelecionada] = {};

    if (users[roleSelecionada][email]) {
      alert('❌ Este e-mail já está cadastrado!');
      return;
    }

    const user = { nome, senha, cpf, crm, perfil: roleSelecionada, email };
    users[roleSelecionada][email] = user;

    // Compatibilidade com seu código original: permitir login por nome (paciente)
    if (roleSelecionada === 'paciente') {
      users[roleSelecionada][nome.toLowerCase()] = user;
    }

    saveUsers(users);
    showSuccess('✅ Cadastro realizado com sucesso!');

    setTimeout(() => {
      registerForm.reset();
      successMsg.style.display = 'none';
      setScreen('login');
    }, 1200);
  });

  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = usuarioInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    const users = loadUsers();
    const perfil = users[roleSelecionada] || {};

    let userData = perfil[input];

    // Login por nome para paciente (igual ao original)
    if (!userData && roleSelecionada === 'paciente') {
      for (const key in perfil) {
        if (perfil[key]?.nome && perfil[key].nome.toLowerCase() === input) {
          userData = perfil[key];
          break;
        }
      }
    }

    if (!userData || userData.senha !== senha) {
      showError('Usuário ou senha incorretos!');
      return;
    }

    loginSuccess(userData);
  });

  // Tabs
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.content').forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  goAgendarBtn.addEventListener('click', () => {
    document.querySelector('[data-tab="agendar"]').click();
  });

  horariosBtn.addEventListener('click', () => {
    alert('Funcionalidade em desenvolvimento');
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    clearSession();
    // cleanup inputs
    loginForm.reset();
    setScreen('login');
  });

  // Restore session on load
  const session = loadSession();
  if (session?.nome) {
    welcomeUser.innerHTML = `Olá, ${session.nome}`;
    setScreen('dashboard');
  } else {
    setScreen('login');
  }

  // Defaults
  setRole('paciente');
  setActiveRoleBtn('paciente');
})();
