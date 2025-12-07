import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Card, CardContent, Box, IconButton,Button,createTheme,FormControlLabel,Switch
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';


function Dashboard() {
    const [darkMode, setDarkMode] = useState(false);
    const [summariesList, setSummariesList] = useState([]);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();


    useEffect(() => {
        fetchSummaries();
    }, [token]);

    const fetchSummaries = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get_summary_by_id', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const uniqueSummaries = response.data.summaries.filter((value, index, self) =>
                index === self.findIndex((t) => t.meeting_id === value.meeting_id)
            );

            setSummariesList(uniqueSummaries);
        } catch (error) {
            console.error('Error fetching summaries:', error);
            alert('Failed to fetch summaries.');
        }
    };

     // Theme setup
        const theme = createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light',
            },
        });

        // Handle dark mode toggle
    const handleDarkModeChange = (event) => {
        setDarkMode(event.target.checked);
    };


    const handleDelete = async (meetingId) => {
        if (window.confirm(`Are you sure you want to delete Meeting ID ${meetingId}?`)) {
            try {
                await axios.delete(`http://localhost:5000/delete_summary/${meetingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSummariesList(summariesList.filter(summary => summary.meeting_id !== meetingId));
                alert('Summary deleted successfully!');
            } catch (error) {
                console.error('Error deleting summary:', error);
                alert('Failed to delete summary.');
            }
        }
    };

     // Logout handler
     const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <ThemeProvider theme={theme}>
        <Container component="main" sx={{ padding: 4, maxWidth: 'lg' }}>

            {/* Dark/Light Mode Toggle */}
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                <FormControlLabel
                    control={<Switch checked={darkMode} onChange={handleDarkModeChange} />}
                    label="Dark Mode"
                />
            </Box>

            <Card sx={{ padding: 3, width: '100%', boxShadow: 3, backgroundColor: '#fafafa', borderRadius: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', fontFamily: 'Poppins, Roboto, sans-serif' }}>
                            Your Summaries
                        </Typography>
                    </Box>

                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#4facfe', color: '#fff' }}>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins, Roboto, sans-serif' }}>Meeting ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins, Roboto, sans-serif' }}>Paragraph Text</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins, Roboto, sans-serif' }}>Summary</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins, Roboto, sans-serif' }}>Bullet Points</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins, Roboto, sans-serif' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {summariesList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Poppins, Roboto, sans-serif' }}>
                                                No summaries available
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    summariesList.map((summaryData, index) => (
                                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                            <TableCell sx={{ fontFamily: 'Poppins, Roboto, sans-serif', color: '#333' }}>{summaryData.meeting_id}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Poppins, Roboto, sans-serif', color: '#555' }}>{summaryData.ptext}</TableCell>
                                            <TableCell sx={{ fontFamily: 'Poppins, Roboto, sans-serif', color: '#555' }}>{summaryData.summary}</TableCell>
                                            <TableCell>
                                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Poppins, Roboto, sans-serif', color: '#555' }}>
                                                    {summaryData.bullet_points}
                                                </pre>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="error" onClick={() => handleDelete(summaryData.meeting_id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
            {/* Logout Button */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <Button variant="text" color="inherit" onClick={handleLogout}>Logout</Button>
            </Box>
        </Container>
    </ThemeProvider>
    );
}

export default Dashboard;
