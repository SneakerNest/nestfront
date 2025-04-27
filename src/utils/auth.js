export const isUserLogged = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Clear invalid data
    return null;
  }
};

export const setLoggedIn = (token, user) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");  localStorage.removeItem("token");
    localStorage.removeItem("user");    localStorage.removeItem("user");


};    
