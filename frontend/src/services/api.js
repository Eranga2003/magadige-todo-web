const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Reusable fetch wrapper to set headers, content types, and Authorization token
 */
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('magadige_auth_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData.message || `API error (${response.status})`;
    const error = new Error(errorMsg);
    error.errors = responseData.errors; // Zod validation issues
    throw error;
  }

  return responseData;
}

/**
 * Authentication service module
 */
export const authService = {
  /**
   * Register a new user with onboarding details
   */
  async register(payload) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Log in a user with credentials
   */
  async login(email, password) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Log in or Register via Google or Facebook
   */
  async socialLogin(payload) {
    return fetchAPI('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch authenticated user details
   */
  async getMe() {
    return fetchAPI('/auth/me');
  },

  /**
   * Update user profile details
   */
  async updateProfile(payload) {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

/**
 * Tasks service module
 */
export const taskService = {
  /**
   * Fetch all tasks for the authenticated user
   */
  async getTasks() {
    return fetchAPI('/tasks');
  },

  /**
   * Create a new task
   */
  async createTask(task) {
    return fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  /**
   * Update an existing task
   */
  async updateTask(id, task) {
    return fetchAPI(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(id) {
    return fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Workspace service module
 */
export const workspaceService = {
  async createWorkspace(data) {
    return fetchAPI('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getWorkspaces() {
    return fetchAPI('/workspaces');
  },

  async getWorkspace(id) {
    return fetchAPI(`/workspaces/${id}`);
  },

  async inviteMember(workspaceId, email) {
    return fetchAPI(`/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async validateToken(token) {
    return fetchAPI(`/invitations/validate/${token}`);
  },

  async acceptInvitation(token) {
    return fetchAPI('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async createWorkspaceProject(workspaceId, name) {
    return fetchAPI(`/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getWorkspaceTasks(workspaceId) {
    return fetchAPI(`/workspaces/${workspaceId}/tasks`);
  },

  async createWorkspaceTask(workspaceId, task) {
    return fetchAPI(`/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async updateWorkspaceTask(workspaceId, taskId, task) {
    return fetchAPI(`/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },
};

/**
 * AI Service module for task breakdown
 */
export const aiService = {
  async breakdownTask(text) {
    return fetchAPI('/tasks/breakdown', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};

/**
 * Weather Service module
 */
export const weatherService = {
  async getWeatherForecast(city = 'Colombo') {
    return fetchAPI(`/tasks/weather?city=${encodeURIComponent(city)}`);
  },
};

/**
 * AI Assistant Service module for meeting reschedule emails
 */
export const aiAssistantService = {
  async sendMeetingEmail(payload) {
    return fetchAPI('/tasks/ai/send-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
