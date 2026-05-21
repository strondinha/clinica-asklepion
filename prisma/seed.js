const bcrypt = require("bcryptjs");
const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();

  const specialtiesData = [
    "Cardiologia",
    "Dermatologia",
    "Pediatria",
    "Ortopedia",
    "Neurologia",
  ];

  const specialties = {};

  for (const name of specialtiesData) {
    specialties[name] = await prisma.specialty.create({ data: { name } });
  }

  const doctors = await prisma.$transaction([
    prisma.doctor.create({
      data: {
        name: "Dra. Helena Costa",
        specialtyId: specialties.Cardiologia.id,
        room: "101",
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dr. Lucas Moreira",
        specialtyId: specialties.Dermatologia.id,
        room: "102",
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dra. Carolina Lima",
        specialtyId: specialties.Pediatria.id,
        room: "201",
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dr. Rafael Nunes",
        specialtyId: specialties.Ortopedia.id,
        room: "202",
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dra. Marina Duarte",
        specialtyId: specialties.Neurologia.id,
        room: "301",
      },
    }),
  ]);

  const slots = [
    { weekday: 1, time: "09:00" },
    { weekday: 1, time: "10:00" },
    { weekday: 2, time: "14:00" },
    { weekday: 3, time: "09:30" },
    { weekday: 4, time: "15:00" },
    { weekday: 5, time: "11:00" },
  ];

  for (const doctor of doctors) {
    for (const slot of slots) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          weekday: slot.weekday,
          time: slot.time,
        },
      });
    }
  }

  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador Asklepion",
      cpf: "11111111111",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const patient = await prisma.user.create({
    data: {
      name: "Paciente Teste",
      cpf: "22222222222",
      role: Role.PATIENT,
      passwordHash,
    },
  });

  const now = new Date();
  const upcomingDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0, 0);

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctors[0].id,
      startsAt: upcomingDate,
    },
  });

  console.log("Seed finalizado.");
  console.log("Admin -> CPF: 11111111111 | senha: 123456");
  console.log("Paciente -> CPF: 22222222222 | senha: 123456");
  console.log("Usuário admin criado:", admin.name);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
