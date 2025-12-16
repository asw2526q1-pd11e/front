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
    name: 'Toni',
    email: 'toni@example.com',
    apiKey: 'e9eea5cc-da9d-45a0-90f5-6dc23df1d7e2',
    avatar: '👨‍💻'
  },
  {
    id: '2',
    name: 'Aina',
    email: 'aina123@gmail.com',
    apiKey: 'c1d5ec80-f5ed-4db1-ae15-6678ebcde5d6',
    avatar: '👩‍💼'
  },
  {
    id: '3',
    name: 'Cami',
    email: 'cami@example.com',
    apiKey: '847ecf7d-66c6-4cbe-be7a-e99cc8054554', // Substitueix amb l'API key real
    avatar: '👨‍🎨'
  },
  {
    id: '4',
    name: 'Usuari 4',
    email: 'user4@example.com',
    apiKey: 'API_KEY_USUARI_4', // Substitueix amb l'API key real
    avatar: '👩‍🔬'
  }
];