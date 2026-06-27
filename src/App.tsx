import { FormEvent, useMemo, useState } from 'react';

type AppointmentStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';

type Appointment = {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
};

const statusLabels: Record<AppointmentStatus, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patientName: 'Анна Морозова',
    doctorName: 'М. Орлова',
    department: 'Кардиология',
    date: '2026-06-28',
    time: '09:30',
    status: 'confirmed',
    reason: 'Плановый осмотр',
  },
  {
    id: 2,
    patientName: 'Иван Петров',
    doctorName: 'Е. Смирнова',
    department: 'Терапия',
    date: '2026-06-28',
    time: '11:00',
    status: 'new',
    reason: 'Первичная консультация',
  },
  {
    id: 3,
    patientName: 'Петр Кузнецов',
    doctorName: 'Д. Никитин',
    department: 'Неврология',
    date: '2026-06-29',
    time: '14:15',
    status: 'completed',
    reason: 'Повторный прием',
  },
  {
    id: 4,
    patientName: 'Виктория Фомина',
    doctorName: 'Н. Белова',
    department: 'Дерматология',
    date: '2026-06-30',
    time: '12:10',
    status: 'cancelled',
    reason: 'Консультация специалиста',
  },
];

const departments = ['Все отделения', 'Терапия', 'Кардиология', 'Неврология', 'Дерматология'];
const statuses = ['all', 'new', 'confirmed', 'completed', 'cancelled'] as const;

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('clinic-appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [departmentFilter, setDepartmentFilter] = useState('Все отделения');

  const [form, setForm] = useState({
    patientName: '',
    doctorName: '',
    department: 'Терапия',
    date: '',
    time: '',
    status: 'new' as AppointmentStatus,
    reason: '',
  });

  const saveAppointments = (nextAppointments: Appointment[]) => {
    setAppointments(nextAppointments);
    localStorage.setItem('clinic-appointments', JSON.stringify(nextAppointments));
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const query = search.toLowerCase();

      const matchesSearch =
        appointment.patientName.toLowerCase().includes(query) ||
        appointment.doctorName.toLowerCase().includes(query) ||
        appointment.reason.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesDepartment =
        departmentFilter === 'Все отделения' || appointment.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [appointments, search, statusFilter, departmentFilter]);

  const stats = {
    total: appointments.length,
    new: appointments.filter((item) => item.status === 'new').length,
    confirmed: appointments.filter((item) => item.status === 'confirmed').length,
    completed: appointments.filter((item) => item.status === 'completed').length,
    cancelled: appointments.filter((item) => item.status === 'cancelled').length,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.patientName.trim() || !form.doctorName.trim() || !form.date || !form.time) {
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now(),
      ...form,
    };

    saveAppointments([newAppointment, ...appointments]);

    setForm({
      patientName: '',
      doctorName: '',
      department: 'Терапия',
      date: '',
      time: '',
      status: 'new',
      reason: '',
    });
  };

  const changeStatus = (id: number, status: AppointmentStatus) => {
    const nextAppointments = appointments.map((appointment) =>
      appointment.id === id ? { ...appointment, status } : appointment
    );

    saveAppointments(nextAppointments);
  };

  const deleteAppointment = (id: number) => {
    const nextAppointments = appointments.filter((appointment) => appointment.id !== id);
    saveAppointments(nextAppointments);
  };

  const resetData = () => {
    saveAppointments(initialAppointments);
    setSearch('');
    setStatusFilter('all');
    setDepartmentFilter('Все отделения');
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <span className="eyebrow">Clinic workflow</span>
          <h1>Clinic Appointments Dashboard</h1>
          <p>React TypeScript dashboard for managing clinic appointments and visit statuses.</p>
        </div>

        <div className="heroCard">
          <strong>{stats.total}</strong>
          <span>appointments</span>
        </div>
      </section>

      <section className="statsGrid">
        <StatCard title="Всего" value={stats.total} />
        <StatCard title="Новые" value={stats.new} />
        <StatCard title="Подтверждены" value={stats.confirmed} />
        <StatCard title="Завершены" value={stats.completed} />
        <StatCard title="Отменены" value={stats.cancelled} />
      </section>

      <section className="layout">
        <form className="panel formPanel" onSubmit={handleSubmit}>
          <h2>Новая запись</h2>

          <label>
            Пациент
            <input
              value={form.patientName}
              onChange={(event) => setForm({ ...form, patientName: event.target.value })}
              placeholder="Например: Елена Иванова"
            />
          </label>

          <label>
            Врач
            <input
              value={form.doctorName}
              onChange={(event) => setForm({ ...form, doctorName: event.target.value })}
              placeholder="Например: А. Волков"
            />
          </label>

          <label>
            Отделение
            <select
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
            >
              {departments.slice(1).map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </label>

          <label>
            Причина визита
            <input
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder="Первичная консультация"
            />
          </label>

          <div className="formRow">
            <label>
              Дата
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>

            <label>
              Время
              <input
                type="time"
                value={form.time}
                onChange={(event) => setForm({ ...form, time: event.target.value })}
              />
            </label>
          </div>

          <label>
            Статус
            <select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as AppointmentStatus })
              }
            >
              <option value="new">Новая</option>
              <option value="confirmed">Подтверждена</option>
              <option value="completed">Завершена</option>
              <option value="cancelled">Отменена</option>
            </select>
          </label>

          <button className="primaryButton" type="submit">
            Создать запись
          </button>
        </form>

        <section className="content">
          <div className="toolbar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по пациенту, врачу или причине"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | AppointmentStatus)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'Все статусы' : statusLabels[status]}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              {departments.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>

            <button className="ghostButton" onClick={resetData}>
              Сбросить
            </button>
          </div>

          <div className="appointmentsList">
            {filteredAppointments.length === 0 ? (
              <div className="emptyState">Записи не найдены</div>
            ) : (
              filteredAppointments.map((appointment) => (
                <article className="appointmentCard" key={appointment.id}>
                  <div className="appointmentMain">
                    <div className="dateBox">
                      <strong>{appointment.time}</strong>
                      <span>{formatDate(appointment.date)}</span>
                    </div>

                    <div>
                      <h3>{appointment.patientName}</h3>
                      <p>{appointment.reason || 'Причина визита не указана'}</p>
                      <span>
                        {appointment.department} · {appointment.doctorName}
                      </span>
                    </div>
                  </div>

                  <div className="appointmentActions">
                    <select
                      className={`statusSelect ${appointment.status}`}
                      value={appointment.status}
                      onChange={(event) =>
                        changeStatus(appointment.id, event.target.value as AppointmentStatus)
                      }
                    >
                      <option value="new">Новая</option>
                      <option value="confirmed">Подтверждена</option>
                      <option value="completed">Завершена</option>
                      <option value="cancelled">Отменена</option>
                    </select>

                    <button className="deleteButton" onClick={() => deleteAppointment(appointment.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="statCard">
      <strong>{value}</strong>
      <span>{title}</span>
    </article>
  );
}

function formatDate(date: string) {
  if (!date) {
    return 'Дата не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export default App;
