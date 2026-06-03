(() => {
  const STORAGE_KEYS = {
    authUser: 'auth_user',
    users: 'auth_users',
    appointments: 'appointments'
  };

  const seedUsers = [
    {
      cpf: '12345678901',
      senha: '1234',
      nome: 'João da Silva',
      tipo: 'paciente'
    },
    {
      cpf: '22233344455',
      senha: 'med123',
      nome: 'Dra. Sara Rodrigues',
      tipo: 'medico',
      medicoId: 'sara-rodrigues',
      especialidade: 'Clínica Geral',
      crm: 'CRM 123456'
    },
    {
      cpf: '99988877766',
      senha: 'rec123',
      nome: 'Fernanda Souza',
      tipo: 'recepcao'
    }
  ];

  function normalizeCpf(cpf) {
    return String(cpf || '').replace(/\D/g, '');
  }

  function formatCpf(cpf) {
    const digits = normalizeCpf(cpf).slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function parseArrayStorage(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function getRegisteredUsers() {
    return parseArrayStorage(STORAGE_KEYS.users);
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  function getUsers() {
    const merged = [...seedUsers, ...getRegisteredUsers()];
    const uniqueByCpf = new Map();
    merged.forEach((user) => {
      const cpf = normalizeCpf(user.cpf);
      if (cpf.length === 11) {
        uniqueByCpf.set(cpf, { ...user, cpf });
      }
    });
    return [...uniqueByCpf.values()];
  }

  function isEquipeType(tipo) {
    return tipo === 'medico' || tipo === 'recepcao' || tipo === 'equipe';
  }

  function matchesSelectedRole(user, selectedRole) {
    if (selectedRole === 'paciente') {
      return user.tipo === 'paciente';
    }
    return isEquipeType(user.tipo);
  }

  function authenticate(cpf, senha, selectedRole) {
    const normalizedCpf = normalizeCpf(cpf);
    const user = getUsers().find((item) => item.cpf === normalizedCpf && item.senha === senha);

    if (!user) {
      return { ok: false, message: 'CPF ou senha inválidos.' };
    }

    if (!matchesSelectedRole(user, selectedRole)) {
      return { ok: false, message: 'Tipo de acesso não corresponde ao perfil informado.' };
    }

    return { ok: true, user };
  }

  function setSession(user) {
    localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
  }

  function getSession() {
    try {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.authUser) || 'null');
      return user && user.cpf ? user : null;
    } catch {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.authUser);
  }

  function pageForUser(user) {
    if (user.tipo === 'paciente') return 'index.html';
    if (user.tipo === 'medico') return 'medico.html';
    return 'equipe.html';
  }

  function redirectToLogin() {
    window.location.href = 'login.html';
  }

  function requireAuth(allowedTypes) {
    const user = getSession();
    if (!user) {
      redirectToLogin();
      return null;
    }

    if (Array.isArray(allowedTypes) && allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
      window.location.href = pageForUser(user);
      return null;
    }

    return user;
  }

  function redirectIfLoggedIn() {
    const user = getSession();
    if (user) {
      window.location.href = pageForUser(user);
    }
  }

  function registerPatient(payload) {
    const nome = String(payload.nome || '').trim();
    const cpf = normalizeCpf(payload.cpf);
    const senha = String(payload.senha || '');

    if (nome.length < 3) {
      return { ok: false, message: 'Informe o nome completo.' };
    }

    if (cpf.length !== 11) {
      return { ok: false, message: 'Informe um CPF válido com 11 dígitos.' };
    }

    if (senha.length < 4) {
      return { ok: false, message: 'A senha deve ter pelo menos 4 caracteres.' };
    }

    const users = getUsers();
    if (users.some((user) => user.cpf === cpf)) {
      return { ok: false, message: 'Já existe cadastro para este CPF.' };
    }

    const registeredUsers = getRegisteredUsers();
    const newUser = { nome, cpf, senha, tipo: 'paciente' };
    registeredUsers.push(newUser);
    saveRegisteredUsers(registeredUsers);

    return { ok: true, user: newUser };
  }

  function getAppointments() {
    return parseArrayStorage(STORAGE_KEYS.appointments);
  }

  function saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
  }

  function addAppointment(appointment) {
    const appointments = getAppointments();
    const item = {
      id: `apt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...appointment,
      createdAt: new Date().toISOString()
    };
    appointments.push(item);
    saveAppointments(appointments);
    return item;
  }

  function updateAppointmentReminder(id) {
    const appointments = getAppointments();
    const next = appointments.map((apt) =>
      apt.id === id ? { ...apt, reminderSent: true, reminderSentAt: new Date().toISOString() } : apt
    );
    saveAppointments(next);
  }

  function attachCpfMask(input) {
    input.addEventListener('input', () => {
      input.value = formatCpf(input.value);
    });
  }

  window.AsklepionAuth = {
    normalizeCpf,
    formatCpf,
    attachCpfMask,
    authenticate,
    setSession,
    getSession,
    clearSession,
    requireAuth,
    redirectIfLoggedIn,
    pageForUser,
    registerPatient,
    getAppointments,
    addAppointment,
    updateAppointmentReminder,
    isEquipeType
  };
})();
