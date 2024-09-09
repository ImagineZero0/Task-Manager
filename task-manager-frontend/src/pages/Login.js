import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, TextField, Box, Typography } from '@mui/material';
import Header from '../components/Header'

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    const googleLogin = () => {
        window.open("http://localhost:5000/auth/google", "_self");
    };

    return(
        <div>
            <Header />
            <Typography variant="h4" sx={{ color: 'blue', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>Login</Typography>
            <Box sx={{ width:500,margin: 'auto', padding: 3, textAlign: 'center', border: '2px solid blue', borderRadius: '8px' }}>
            <form onSubmit={handleLogin}>
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    InputLabelProps={{ required: false }}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputLabelProps={{ required: false }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, textTransform: 'none' }}>
                    Login
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Don't have an account?</Typography>
                    <Button onClick={() => navigate('/register')} sx={{ ml: 1, textTransform: 'none' }}>
                        Signup
                    </Button>
                </Box>
                <Button onClick={googleLogin} variant="contained" fullWidth="false" sx={{ mt: 2, textTransform: 'none' }}>
                    Login with Google
                </Button>
            </form>
            </Box>
        </div>
    );
};

export default Login;