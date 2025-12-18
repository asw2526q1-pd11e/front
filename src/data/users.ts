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
    apiKey: '539fe465-8835-4f52-9886-59110149098c',
    avatar: '👩‍💼'
  },
  {
    id: '3',
    name: 'camila_valeria',
    email: 'cami@example.com',
    apiKey: '143f9a2a-d20d-4d7b-9d27-044a68dc121f',
    avatar: '👨‍🎨'
  },
  {
    id: '4',
    name: 'Ada',
    email: 'ada@example.com',
    apiKey: '221df709-fc8a-461d-819c-9868296fdacb',
    avatar: '👩‍🔬'
  },
  {
    id: '5',
    name: 'ToniDos',
    email: 'tonidos@example.com',
    apiKey: '76667764-3b47-43c5-8c2e-bfb2bf0ea21d',
    avatar: '👨‍🚀'
  }
];