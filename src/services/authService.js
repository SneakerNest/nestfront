const API_URL = 'http://localhost:5001/api/v1/user';

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || 'Login failed');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.msg);
    return data;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Attempting to connect to:', `${API_URL}/register`);
    console.log('With data:', JSON.stringify(userData, null, 2));
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error response body:', text);
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Registration failed');
      } catch (e) {
        throw new Error('Server returned an invalid response');
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error details:', error);
    throw error;
  }
};