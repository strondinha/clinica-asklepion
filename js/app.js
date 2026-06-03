(() => {
  const STORAGE_KEY = 'asklepion-booking-state-v1';

  const doctors = [
    {
      id: 'sara-rodrigues',
      nome: 'Dra. Sara Rodrigues',
      especialidade: 'Clínica Geral',
      descricao: 'Olá! Vou te acompanhar para encontrar o melhor plano de cuidado para sua saúde.',
      disponibilidade: {
        'Segunda-feira': ['08:00', '09:30', '14:00'],
        'Quarta-feira': ['10:00', '11:30', '16:00'],
        'Sexta-feira': ['09:00', '13:30', '15:30']
      }
    },
    {
      id: 'marcos-lima',
      nome: 'Dr. Marcos Lima',
      especialidade: 'Cardiologia',
      descricao: 'Seja bem-vindo(a)! Vamos avaliar sua saúde do coração com atenção e segurança.',
      disponibilidade: {
        'Terça-feira': ['08:30', '10:30', '15:00'],
        'Quinta-feira': ['09:00', '11:00', '17:00'],
        'Sábado': ['08:00', '09:00']
      }
    },
    {
      id: 'ana-beatriz-melo',
      nome: 'Dra. Ana Beatriz Melo',
      especialidade: 'Dermatologia',
      descricao: 'Prazer em receber você! Vamos cuidar da sua pele com uma avaliação personalizada.',
      disponibilidade: {
        'Segunda-feira': ['11:00', '13:00'],
        'Quinta-feira': ['14:00', '16:00', '18:00'],
        'Sexta-feira': ['10:00', '12:00']
      }
    }
  ];

  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  const goToBookingBtn = document.getElementById('goToBooking');
  const doctorList = document.getElementById('doctorList');
  const doctorShowcase = document.getElementById('doctorShowcase');

  const doctorDetailsCard = document.getElementById('doctorDetailsCard');
  const doctorDetails = document.getElementById('doctorDetails');
  const dayList = document.getElementById('dayList');

  const timeCard = document.getElementById('timeCard');
  const selectedDayText = document.getElementById('selectedDayText');
  const timeList = document.getElementById('timeList');

  const clientCard = document.getElementById('clientCard');
  const clientForm = document.getElementById('clientForm');
  const clientNameInput = document.getElementById('clientName');

  const confirmationCard = document.getElementById('confirmationCard');

  const defaultState = {
    doctorId: null,
    day: null,
    time: null,
    clientName: ''
  };

  let bookingState = loadState();

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaultState, ...stored };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingState));
  }

  function setState(patch) {
    bookingState = { ...bookingState, ...patch };
    saveState();
    renderFlow();
  }

  function setActivePanel(targetId) {
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.target === targetId));
    panels.forEach((panel) => panel.classList.toggle('active', panel.id === targetId));
  }

  function doctorById(id) {
    return doctors.find((doctor) => doctor.id === id) || null;
  }

  function createDoctorCard(doctor, onClick, selected) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `doctor-card${selected ? ' selected' : ''}`;
    button.innerHTML = `<strong>${doctor.nome}</strong><p>${doctor.especialidade}</p>`;
    button.addEventListener('click', onClick);
    return button;
  }

  function renderDoctorLists() {
    doctorList.innerHTML = '';
    doctorShowcase.innerHTML = '';

    doctors.forEach((doctor) => {
      const selected = doctor.id === bookingState.doctorId;
      doctorList.appendChild(
        createDoctorCard(
          doctor,
          () => setState({ doctorId: doctor.id, day: null, time: null, clientName: '' }),
          selected
        )
      );

      const showCard = document.createElement('article');
      showCard.className = 'doctor-card';
      showCard.innerHTML = `
        <strong>${doctor.nome}</strong>
        <p>${doctor.especialidade}</p>
        <p class="hint">Dias: ${Object.keys(doctor.disponibilidade).join(', ')}</p>
      `;
      doctorShowcase.appendChild(showCard);
    });
  }

  function renderDays(doctor) {
    dayList.innerHTML = '';

    Object.keys(doctor.disponibilidade).forEach((day) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip${bookingState.day === day ? ' selected' : ''}`;
      chip.textContent = day;
      chip.addEventListener('click', () => setState({ day, time: null, clientName: '' }));
      dayList.appendChild(chip);
    });
  }

  function renderTimes(doctor) {
    timeList.innerHTML = '';

    const times = doctor.disponibilidade[bookingState.day] || [];
    selectedDayText.textContent = bookingState.day
      ? `Horários disponíveis para ${bookingState.day}:`
      : 'Selecione um dia para ver os horários disponíveis.';

    times.forEach((time) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip${bookingState.time === time ? ' selected' : ''}`;
      chip.textContent = time;
      chip.addEventListener('click', () => setState({ time, clientName: '' }));
      timeList.appendChild(chip);
    });
  }

  function renderConfirmation(doctor) {
    if (!bookingState.clientName.trim() || !doctor || !bookingState.day || !bookingState.time) {
      confirmationCard.classList.add('hidden');
      confirmationCard.innerHTML = '';
      return;
    }

    confirmationCard.classList.remove('hidden');
    confirmationCard.innerHTML = `
      <h2>Agendamento confirmado!</h2>
      <p><strong>Cliente:</strong> ${bookingState.clientName}</p>
      <p><strong>Médico:</strong> ${doctor.nome}</p>
      <p><strong>Especialidade:</strong> ${doctor.especialidade}</p>
      <p><strong>Dia:</strong> ${bookingState.day}</p>
      <p><strong>Horário:</strong> ${bookingState.time}</p>
      <button id="newBookingBtn" class="btn" type="button">Novo agendamento</button>
    `;

    const newBookingBtn = document.getElementById('newBookingBtn');
    newBookingBtn.addEventListener('click', () => {
      setState({ ...defaultState });
      setActivePanel('agendamento');
    });
  }

  function renderFlow() {
    renderDoctorLists();

    const selectedDoctor = doctorById(bookingState.doctorId);

    if (!selectedDoctor) {
      doctorDetailsCard.classList.add('hidden');
      timeCard.classList.add('hidden');
      clientCard.classList.add('hidden');
      renderConfirmation(null);
      return;
    }

    doctorDetailsCard.classList.remove('hidden');
    doctorDetails.innerHTML = `
      <p><strong>${selectedDoctor.nome}</strong></p>
      <p>${selectedDoctor.especialidade}</p>
      <p class="hint">${selectedDoctor.descricao}</p>
    `;
    renderDays(selectedDoctor);

    if (!bookingState.day) {
      timeCard.classList.add('hidden');
      clientCard.classList.add('hidden');
      renderConfirmation(null);
      return;
    }

    timeCard.classList.remove('hidden');
    renderTimes(selectedDoctor);

    if (!bookingState.time) {
      clientCard.classList.add('hidden');
      renderConfirmation(null);
      return;
    }

    clientCard.classList.remove('hidden');
    clientNameInput.value = bookingState.clientName || '';
    renderConfirmation(selectedDoctor);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setActivePanel(tab.dataset.target));
  });

  goToBookingBtn.addEventListener('click', () => setActivePanel('agendamento'));

  clientForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const clientName = clientNameInput.value.trim();
    if (!clientName) return;
    setState({ clientName });
  });

  renderFlow();
})();
