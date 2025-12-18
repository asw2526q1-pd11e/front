export interface User {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  avatar?: string;
}

// Usuaris amb API keys reals del teu backend Django
export const USERS: User[] = [
  {
    id: '1',
    name: 'toni',
    email: 'toni@example.com',
    apiKey: 'e9eea5cc-da9d-45a0-90f5-6dc23df1d7e2',
    avatar: '👨‍💻'
  },
  {
    id: '2',
    name: 'Aina',
    email: 'aina123@gmail.com',
    apiKey: 'b36eb380-fc64-437d-a8b0-a3a8a5be02b2',
    avatar: '👩‍💼'
  },
  {
    id: '3',
    name: 'camila_valeria',
    email: 'cami@example.com',
    apiKey: '606a0bd8-b871-45a2-aa95-daea3b1d92da',
    avatar: '👨‍🎨'
  },
  {
    id: '4',
    name: 'Ada',
    email: 'ada@example.com',
    apiKey: '73f45683-fb60-4c9d-b907-bb9d116cf604',
    avatar: '👩‍🔬'
  }
];