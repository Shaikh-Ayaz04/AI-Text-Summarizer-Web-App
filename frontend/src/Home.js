import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, Button, Box, TextField, Card, CardContent, Switch, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Home() {
    const [selectedOption, setSelectedOption] = useState('extractive');
    const [textAreaContent, setTextAreaContent] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [summary, setSummary] = useState('');
    const [bulletPoints, setBulletPoints] = useState('');
    const [summariesList, setSummariesList] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Theme setup
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    // Fetch next Meeting ID
    useEffect(() => {
        const fetchMeetingId = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get_next_meeting_id', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMeetingId(response.data.next_meeting_id);
            } catch (error) {
                console.error('Error fetching meeting ID:', error);
                alert('Failed to generate meeting ID. Please reload the page.');
            }
        };

        fetchMeetingId();
    }, [token]);

    // Handle dark mode toggle
    const handleDarkModeChange = (event) => {
        setDarkMode(event.target.checked);
    };

    // Handle summarization type change (Extractive / Abstractive)
    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
    };

    // Handle user text input change
    const handleTextAreaChange = (event) => {
        setTextAreaContent(event.target.value);
    };

    // Generate summary when user clicks the button
    const handleGenerateSummary = async () => {
        try {
            const response = await axios.post('http://localhost:5000/get_summary', {
                text: textAreaContent,
                type: selectedOption,
                meeting_id: meetingId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setSummary(response.data.summary);
                setBulletPoints(''); // Reset bullets if new summary is generated
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating summary. Please try again.');
        }
    };

    // Generate bullet points from the summary
    const handleGenerateBullets = async () => {
        try {
            const response = await axios.post('http://localhost:5000/get_bullet_points', {
                text: summary,
                meeting_id: meetingId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                // Navigate to the Download Page with the generated data
                navigate('/download-summary', { 
                    state: { 
                        summary, 
                        bullets: response.data.bullets 
                    } 
                });
            }
        } catch (error) {
            console.error('Error generating bullets:', error);
            alert('Error generating bullet points. Please try again.');
        }
    };

    // Navigate to Dashboard (Summaries Table)
    const handleDashboardClick = () => {
        navigate('/dashboard'); // Navigate to the Dashboard page
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" sx={{ padding: 0, height: '1000', maxWidth: 'none' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                        background: darkMode ? '#333' : 'linear-gradient(to right, #4facfe, #00f2fe)',
                        padding: 4,
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Logout Button */}
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                        <Button variant="text" color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>

                    {/* Dark/Light Mode Toggle */}
                    <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={handleDarkModeChange} />}
                            label="Dark Mode"
                        />
                    </Box>

                    {/* Summarizer Card */}
                    <Card sx={{ maxWidth: 600, padding: 3, width: '100%', marginBottom: 0 }}>
                        <CardContent>
                            <Typography variant="h5">Generate Summary</Typography>

                            {/* Display Auto-generated Meeting ID */}
                            <TextField
                                label="Meeting ID"
                                fullWidth
                                value={meetingId}
                                disabled
                                margin="normal"
                            />

                            {/* Summarization Type Selection */}
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Summarization Type</FormLabel>
                                <RadioGroup value={selectedOption} onChange={handleRadioChange} row>
                                    <FormControlLabel value="extractive" control={<Radio />} label="Extractive" />
                                    <FormControlLabel value="abstractive" control={<Radio />} label="Abstractive" />
                                </RadioGroup>
                            </FormControl>

                            {/* User Input Text */}
                            <TextField
                                label="Enter Text to Summarize"
                                multiline
                                rows={4}
                                fullWidth
                                value={textAreaContent}
                                onChange={handleTextAreaChange}
                            />

                            {/* Generate Summary Button */}
                            <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleGenerateSummary}>
                                Summarize
                            </Button>

                            {/* Display Generated Summary */}
                            {summary && (
                                <>
                                    <Typography variant="h6" sx={{ mt: 4 }}>Summary:</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{summary}</Typography>

                                    {/* Generate Bullet Points Button */}
                                    <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={handleGenerateBullets}>
                                        Generate Bullet Points
                                    </Button>

                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        color="secondary" 
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate('/download-summary', { state: { summary, bullets: null } })}
                                    >
                                        Skip
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dashboard Button (outside summarizer card) */}
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleDashboardClick}>
                        Go to Dashboard
                    </Button>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default Home;
