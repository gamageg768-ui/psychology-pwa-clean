import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 120000 });

export const userApi = {
  create: (name: string, email: string) => api.post('/users', { name, email }),
  login: (email: string) => api.post('/login', { email }),
  guestLogin: () => api.post('/guest-login'),
  get: (id: number) => api.get(`/users/${id}`),
};

export const sessionApi = {
  create: (user_id: number, session_type: string) =>
    api.post('/sessions', { user_id, session_type }),
  list: (user_id: number) => api.get(`/sessions/${user_id}`),
  getMessages: (session_id: number) => api.get(`/session/${session_id}/messages`),
  chat: (session_id: number, message: string) =>
    api.post(`/chat/${session_id}`, { message }),
};

export const moodApi = {
  log: (user_id: number, mood: number, emotions: string[], note: string) =>
    api.post('/mood', { user_id, mood, emotions, note }),
  list: (user_id: number) => api.get(`/mood/${user_id}`),
};

export const journalApi = {
  create: (user_id: number, content: string) =>
    api.post('/journal', { user_id, content }),
  list: (user_id: number) => api.get(`/journal/${user_id}`),
};

export const assessmentApi = {
  submit: (user_id: number, assessment_type: string, answers: number[]) =>
    api.post('/assessment', { user_id, assessment_type, answers }),
  list: (user_id: number) => api.get(`/assessments/${user_id}`),
};

export const toolsApi = {
  breathingGuide: (technique: string) => api.post('/breathing-guide', { technique }),
  affirmations: (mood_context: string) => api.post('/affirmations', { mood_context }),
  crisisResources: () => api.get('/crisis-resources'),
  health: () => api.get('/health'),
};

export const gratitudeApi = {
  save: (user_id: number, items: string[]) => api.post('/gratitude', { user_id, items }),
  list: (user_id: number) => api.get(`/gratitude/${user_id}`),
};

export const sleepApi = {
  log: (user_id: number, hours: number, quality: number, bedtime?: string, wake_time?: string, note?: string) =>
    api.post('/sleep', { user_id, hours, quality, bedtime, wake_time, note }),
  list: (user_id: number) => api.get(`/sleep/${user_id}`),
};

export const habitsApi = {
  create: (user_id: number, title: string, emoji: string) => api.post('/habits', { user_id, title, emoji }),
  list: (user_id: number) => api.get(`/habits/${user_id}`),
  delete: (user_id: number, habit_id: number) => api.delete(`/habits/${user_id}`, { data: { habit_id } }),
  toggle: (habit_id: number, date?: string) => api.post('/habits/log', { habit_id, date }),
};

export const cbtApi = {
  save: (user_id: number, data: object) => api.post('/cbt', { user_id, ...data }),
  list: (user_id: number) => api.get(`/cbt/${user_id}`),
};

export const safetyPlanApi = {
  get: (user_id: number) => api.get(`/safety-plan/${user_id}`),
  save: (user_id: number, data: object) => api.post(`/safety-plan/${user_id}`, data),
};

export const reportApi = {
  generate: (user_id: number) => api.get(`/report/${user_id}`),
};
