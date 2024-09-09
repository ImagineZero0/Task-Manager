import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import Login from '../components/Login';

jest.mock('axios');

describe('Login Component', () => {
  it('should render the login form', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('should submit login form', async () => {
    axios.post.mockResolvedValue({ data: { token: 'mockToken' } });

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Mock token should be stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mockToken');
  });

  it('should show an error when login fails', async () => {
    axios.post.mockRejectedValue(new Error('Login failed'));

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    const errorMessage = await screen.findByText(/Invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('should handle Google login', () => {
    window.open = jest.fn();

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.click(screen.getByRole('button', { name: /Login with Google/i }));
    expect(window.open).toHaveBeenCalledWith('http://localhost:5000/auth/google', '_self');
  });
});
