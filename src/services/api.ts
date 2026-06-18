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
  export: (user_id: number) => api.get(`/report/${user_id}/export`, { responseType: 'blob' }),
};

// Feature #12: Pulse
export const pulseApi = {
  log: (user_id: number, focus: number, energy: number, stress: number, note?: string) =>
    api.post('/pulse', { user_id, focus, energy, stress, note }),
  list: (user_id: number) => api.get(`/pulse/${user_id}`),
};

// Feature #3: Goals
export const goalsApi = {
  create: (user_id: number, title: string, description: string, category: string, target_date?: string) =>
    api.post('/goals', { user_id, title, description, category, target_date }),
  list: (user_id: number) => api.get(`/goals/${user_id}`),
  completeMilestone: (goal_id: number, milestone_id: number) =>
    api.patch(`/goals/${goal_id}`, { milestone_id }),
  updateStatus: (goal_id: number, status: string) =>
    api.patch(`/goals/${goal_id}`, { status }),
};

// Feature #1: Medications
export const medicationsApi = {
  create: (user_id: number, data: object) => api.post('/medications', { user_id, ...data }),
  list: (user_id: number) => api.get(`/medications/${user_id}`),
  log: (medication_id: number, date: string, taken: boolean, side_effects?: string, note?: string) =>
    api.post('/medications/log', { medication_id, date, taken, side_effects, note }),
  deactivate: (user_id: number, medication_id: number) =>
    api.delete(`/medications/${user_id}`, { data: { medication_id } }),
};

// Feature #6: Wellness Letter
export const wellnessLetterApi = {
  get: (user_id: number) => api.get(`/wellness-letter/${user_id}`),
};

// Feature #4: Symptoms
export const symptomsApi = {
  log: (user_id: number, data: object) => api.post('/symptoms', { user_id, ...data }),
  list: (user_id: number) => api.get(`/symptoms/${user_id}`),
  correlations: (user_id: number) => api.get(`/symptoms/correlations/${user_id}`),
};

// Feature #2: Meditation
export const meditationApi = {
  log: (user_id: number, type: string, duration: number, completed: boolean) =>
    api.post('/meditation/sessions', { user_id, type, duration, completed }),
  list: (user_id: number) => api.get(`/meditation/sessions?user_id=${user_id}`),
};

// Feature #10: Routines
export const routinesApi = {
  create: (user_id: number, name: string, type: string, emoji: string, steps: object[]) =>
    api.post('/routines', { user_id, name, type, emoji, steps }),
  list: (user_id: number) => api.get(`/routines/${user_id}`),
  delete: (user_id: number, routine_id: number) =>
    api.delete(`/routines/${user_id}`, { data: { routine_id } }),
};

// Feature #7: Courses
export const coursesApi = {
  getProgress: (user_id: number, course_id: string) =>
    api.get(`/courses/${course_id}/progress?user_id=${user_id}`),
  saveProgress: (user_id: number, course_id: string, steps_done: number[], completed: boolean, quiz_score?: number) =>
    api.post(`/courses/${course_id}/progress`, { user_id, steps_done, completed, quiz_score }),
};

// Feature #5: Crisis Contacts
export const contactsApi = {
  list: (user_id: number) => api.get(`/contacts/${user_id}`),
  add: (user_id: number, name: string, phone: string, relation?: string) =>
    api.post('/contacts', { user_id, name, phone, relation }),
  remove: (user_id: number, contact_id: number) =>
    api.delete(`/contacts/${user_id}`, { data: { contact_id } }),
  escalate: (user_id: number, note?: string) =>
    api.post('/crisis/escalate', { user_id, note }),
};

// Feature #8: Buddy Matching
export const buddyApi = {
  findMatch: (user_id: number, area: string) =>
    api.post('/community/buddy/match', { user_id, area }),
  getMatch: (user_id: number) => api.get(`/community/buddy/match?user_id=${user_id}`),
  getMessages: (match_id: number) => api.get(`/community/buddy/${match_id}/messages`),
  sendMessage: (match_id: number, sender_id: number, content: string) =>
    api.post(`/community/buddy/${match_id}/messages`, { sender_id, content }),
};

// Pressure Release
export const pressureApi = {
  log: (user_id: number, technique: string, pressure_before: number, pressure_after: number, content?: string) =>
    api.post('/pressure-release', { user_id, technique, pressure_before, pressure_after, content }),
  list: (user_id: number) => api.get(`/pressure-release?user_id=${user_id}`),
};
