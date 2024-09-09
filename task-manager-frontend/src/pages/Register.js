import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, TextField, Box, Typography } from "@mui/material";
import Header from '../components/Header'

const Register = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/auth/signup', { firstName, lastName, email, password, confirmPassword });
            navigate('/login');
        } catch (error) {
            setError(error.response.data.message || 'Could not register. Try again.');
        }
    };

    const googleSignup = () => {
        window.open("http://localhost:5000/auth/google", "_self");
    };

    return (
        <div>
            <Header />
            <Typography variant="h4" sx={{ color: 'blue', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>Sign Up</Typography>
            <Box sx={{ width: 500, margin: 'auto', padding: 3, textAlign: 'center', border: '2px solid blue', borderRadius: '8px' }}>
            <form onSubmit={handleRegister}>
                <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                InputLabelProps={{ required: false }}
                />
                <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                InputLabelProps={{ required: false }}
                />
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
                <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                InputLabelProps={{ required: false }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, textTransform: 'none' }}>
                Signup
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    <Typography sx = {{ fontWeight: 'bold' }}>Already have an account?</Typography>
                    <Button onClick={() => navigate('/login')} fullWidth="false" sx={{ mt: 1, textTransform: 'none' }}>
                        Login
                    </Button>
                </Box>
                <Button onClick={googleSignup} variant="contained" fullWidth="false" sx={{ mt: 2, textTransform: 'none' }}>
                    Signup with Google
                </Button>
            </form>
            </Box>
        </div>
    );
};

export default Register;