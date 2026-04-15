export interface User {
  id: string;
  name: string;
  email: string;
  role: 'GERENTE' | 'CONSERJE' | 'SOPORTE' | 'ADMINISTRADOR';
  status: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';
  lastActivity: string;
  avatarUrl: string;
}

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alex Mercer',
    email: 'a.mercer@hotelilu.com',
    role: 'GERENTE',
    status: 'ACTIVO',
    lastActivity: 'Último ingreso: hace 2h',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsNDe4zS_zZegT2Y92PGyqUkKxcNSnwHV54Bi-ci-kaXn2ZZaIwsYOHJfgFiD10RIBMSE6qFmseolJ9E1ssNTNvVprjwgkeVgZctyH9m3xzE0ooJq_e7ayERDxdO76HjPLdFBCWQP6aoF1E9HfBO16jaF7iNXU-TpizLAyRlIDBhA6oXGUPkIpf3itZ_TVNo_BKLkyV6vVPKuh9D5nxfnfZX9frFVnzyyaujZ63HvGu9rjDN6wIfWceMzs8g3cXLcECzdw8AhzXFo'
  },
  {
    id: 'u2',
    name: 'Sofia Laurent',
    email: 's.laurent@hotelilu.com',
    role: 'CONSERJE',
    status: 'ACTIVO',
    lastActivity: 'Último ingreso: hace 1d',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD159I5-x6rqRCacbgVnztjkz0H-dEzZha8Fw8ZMz_W_y3qYzYsEe4vDfeZi2jf9siWYiXAm-TcRujBOlrEcNxqAMFRVIuyrVMlnSdXXBMhGnfWVX8X2_LJxSolNmbcsS2qm3COX_Z7D501WM0kS1io1RkyBtZpjYQs1mLt2vkn8eMHKPPK_T6PO-B8ml6Ij_x_dYiFTozK8IVyLwQ5pvxu5M9ZYykTh0n59Q-3KBNgR9DXjgqesOx8pS1w_KUEbwr7ZYT0f09R1-w'
  },
  {
    id: 'u3',
    name: 'Marcus Thorne',
    email: 'm.thorne@hotelilu.com',
    role: 'SOPORTE',
    status: 'INACTIVO',
    lastActivity: 'Último ingreso: hace 5d',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMHTC0G7mNEGrWj1sl2AKYgevGSaPBUL9HFb1xoaZyy9DSJMquRA4T4sFNcHJswWMhiRapsTDSv3zmRnrKueXjK1ol900ADggbmicinbhIGuZ0Xst8nVSsm6DF55Vs16WZ4vf_cQLqy2NIHapsYA3UgUne-v4qYTwcaCWEZ6ddAX9n_6aLxegfM8Ml_d-gIzQsO3HiCxTp1FjEo0Vu4bY5u5BdJe5VlCexCuW3_rw5MjG5mPCd9Ey30nRB97zJeOxW6rwHQas3uDY'
  },
  {
    id: 'u4',
    name: 'Elena Rossi',
    email: 'e.rossi@hotelilu.com',
    role: 'ADMINISTRADOR',
    status: 'PENDIENTE',
    lastActivity: 'Invitación enviada: hace 10m',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzh8VfS2AJR15IgVunynEEo7y1eeIryP6iS1Y2wSHeAzZI_Qw9LL59Faqj3IRpdCvqNzB4HXIkL_GG59a-hkjb1_oBG-zn-1m5zsZhvFnmYOmnazX6p9XTKXG816xVaNjxKJ8JlfWYqSjOLpH9eM5zrrcL6-Xzz-dXzll5Kp6jlSaifcQNpMBjZpsJ4NQxf8bbSy-feZ2EFe4tD2WjXcWEYC7_Fo4GEcQ4vuPrWUU2xCZfXU5M3yxcUH8gi8TY7D-wGCo9atgMS9k'
  }
];
