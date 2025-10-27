import type { User } from "../../../types";

const USERS_KEY = 'pactle_users';

type AuthCredentials = {
  email: string;
  password: string;
}
type SignUpCredentials = AuthCredentials & { name: string };

const getMockUsers = (): Record<string, any> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (e) {
    return {};
  }
};

export const authService = {
  signUp: async ({ name, email, password }: SignUpCredentials) => {
    await new Promise(res => setTimeout(res, 500));
    
    const users = getMockUsers();
    
    if (users[email]) {
      throw new Error('User already exists.');
    }

    const newUser: User = { name, email, role: 'viewer' };
    
    users[email] = {
      password, 
      ...newUser
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const token = btoa(JSON.stringify({ sub: email, role: newUser.role }));
    return { user: newUser, token };
  },

  signIn: async ({ email, password }: AuthCredentials) => {
    await new Promise(res => setTimeout(res, 500));
    
    const users = getMockUsers();
    const storedUser = users[email];

    if (!storedUser || storedUser.password !== password) {
      throw new Error('Invalid email or password.');
    }

    const user: User = {
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
    };
    
    const token = btoa(JSON.stringify({ sub: user.email, role: user.role }));
    return { user, token };
  },
};