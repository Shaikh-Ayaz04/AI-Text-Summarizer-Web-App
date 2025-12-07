import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/register', {
                username,
                email,
                password,
            });
            alert('Registration successful!');
            navigate('/login');
        } catch (err) {
            setError('Error during registration. Please try again.');
        }
    };

    return (
        <Container 
            component="main" 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', 
                height: '100vh', 
                position: 'relative' 
            }}
        >
            {/* Glass effect */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    zIndex: -1
                }}
            ></div>

            {/* Registration Card */}
            <Card 
                sx={{ 
                    padding: 4, 
                    boxShadow: 10, 
                    width: '100%', 
                    maxWidth: 400, 
                    backdropFilter: 'blur(15px)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                    borderRadius: 3 
                }}
            >
                <CardContent>
                    <Typography 
                        variant="h5" 
                        align="center" 
                        gutterBottom 
                        sx={{ fontWeight: 'bold', color: '#333' }}
                    >
                        Create Account
                    </Typography>

                    {error && <Typography color="error" align="center">{error}</Typography>}

                    <form onSubmit={handleSubmit}>
                        <TextField 
                            label="Username" 
                            fullWidth 
                            margin="normal" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 1 }} 
                        />

                        <TextField 
                            label="Email Address" 
                            fullWidth 
                            margin="normal" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 1 }} 
                        />

                        <TextField 
                            label="Password" 
                            type="password" 
                            fullWidth 
                            margin="normal" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 1 }} 
                        />

                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            sx={{ 
                                marginTop: 2, 
                                fontWeight: 'bold', 
                                textTransform: 'none', 
                                padding: '12px', 
                                background: 'linear-gradient(135deg, #4facfe, #00f2fe)' 
                            }}
                        >
                            Sign Up
                        </Button>
                    </form>

                    <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
                        <Grid item>
                            <Button 
                                variant="text" 
                                onClick={() => navigate('/login')} 
                                sx={{ fontWeight: 'bold', color: '#1976d2' }}
                            >
                                Already have an account? Log In
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Register;
