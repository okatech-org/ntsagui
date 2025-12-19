interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

interface AuthToken {
  token: string;
  user: Omit<AdminUser, 'password'>;
  expiresAt: string;
}

class AuthService {
  private storageKey = 'oka_tech_auth_token';
  private adminKey = 'oka_tech_admins';
  private defaultAdmin = {
    id: 'admin_default',
    email: 'admin@okatech.fr',
    password: btoa('Asted1982*'), // Hash inline: base64 of 'Asted1982*'
    name: 'Admin OKA Tech',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  };

  constructor() {
    this.initializeDefaultAdmin();
  }

  private initializeDefaultAdmin() {
    const admins = this.getAllAdmins();
    if (admins.length === 0) {
      this.saveAdmin(this.defaultAdmin);
    }
  }

  private hashPassword(password: string): string {
    return btoa(password);
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  login(email: string, password: string): AuthToken | null {
    const admins = this.getAllAdmins();
    let admin = admins.find(a => a.email === email);

    // Fallback: si l'admin n'existe pas en stockage mais correspond au compte par défaut
    if (!admin && email === this.defaultAdmin.email) {
      if (this.verifyPassword(password, this.defaultAdmin.password)) {
        // Réinstate le compte par défaut et poursuivre
        this.saveAdmin(this.defaultAdmin as any);
        admin = this.defaultAdmin as any;
      }
    }

    if (!admin || !this.verifyPassword(password, admin.password)) {
      return null;
    }

    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const authToken: AuthToken = {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        createdAt: admin.createdAt,
      },
      expiresAt,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(authToken));
    console.log('Admin logged in:', email);

    return authToken;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    console.log('Admin logged out');
  }

  getCurrentAuth(): AuthToken | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;

      const authToken: AuthToken = JSON.parse(data);

      if (new Date(authToken.expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      return authToken;
    } catch (error) {
      console.error('Error reading auth:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentAuth() !== null;
  }

  getCurrentUser() {
    return this.getCurrentAuth()?.user || null;
  }

  getAllAdmins(): AdminUser[] {
    try {
      const data = localStorage.getItem(this.adminKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading admins:', error);
      return [];
    }
  }

  saveAdmin(admin: AdminUser): void {
    const admins = this.getAllAdmins();
    const index = admins.findIndex(a => a.id === admin.id);

    if (index >= 0) {
      admins[index] = admin;
    } else {
      admins.push(admin);
    }

    localStorage.setItem(this.adminKey, JSON.stringify(admins));
  }

  createAdmin(email: string, password: string, name: string): AdminUser {
    const admin: AdminUser = {
      id: `admin_${Date.now()}`,
      email,
      password: this.hashPassword(password),
      name,
      role: 'viewer',
      createdAt: new Date().toISOString(),
    };

    this.saveAdmin(admin);
    return admin;
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): boolean {
    const admins = this.getAllAdmins();
    const admin = admins.find(a => a.id === userId);

    if (!admin || !this.verifyPassword(oldPassword, admin.password)) {
      return false;
    }

    admin.password = this.hashPassword(newPassword);
    this.saveAdmin(admin);
    return true;
  }

  deleteAdmin(id: string): boolean {
    const admins = this.getAllAdmins();
    const filtered = admins.filter(a => a.id !== id);

    if (filtered.length === admins.length) return false;

    localStorage.setItem(this.adminKey, JSON.stringify(filtered));
    return true;
  }
}

export const authService = new AuthService();
export default authService;
