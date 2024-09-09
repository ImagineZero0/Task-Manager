import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskBoard from "../components/TaskBoard";
import { Button, Box, Typography, AppBar, Toolbar } from '@mui/material';


const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <Box sx={{ padding: 2 }}>
            <AppBar position="static" sx={{ backgroundColor: '#007bff' }}>
                <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                </Typography>
                    <Button variant="contained" color="error" onClick={handleLogout} sx={{ float: 'right' }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <TaskBoard />
        </Box>
    );
};

export default Dashboard;