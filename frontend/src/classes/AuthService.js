import ApiService from './ApiService';
import EventBus from './EventBus';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  saveUserToStorage(user) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser = user;
  }

  clearUserFromStorage() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUser = null;
  }

  async login(email, password) {
    try {
      const data = await ApiService.post('/auth/login', { email, password });
      ApiService.setToken(data.token);
      this.saveUserToStorage(data);
      EventBus.emit('auth:login', data);
      return data;
    } catch (error) {
      EventBus.emit('auth:error', error.message);
      throw error;
    }
  }

  async signup(username, email, password) {
    try {
      const data = await ApiService.post('/auth/signup', { username, email, password });
      ApiService.setToken(data.token);
      this.saveUserToStorage(data);
      EventBus.emit('auth:signup', data);
      return data;
    } catch (error) {
      EventBus.emit('auth:error', error.message);
      throw error;
    }
  }

  logout() {
    this.clearUserFromStorage();
    ApiService.setToken(null);
    EventBus.emit('auth:logout');
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export default new AuthService();