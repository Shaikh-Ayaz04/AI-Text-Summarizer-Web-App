import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Box, Card, CardContent, Snackbar, Alert } from '@mui/material';

function DownloadSummary() {
    const location = useLocation();
    const navigate = useNavigate();
    const { summary, bullets } = location.state || {};

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Handle download with snackbar feedback
    const handleDownload = () => {
        if (!summary && !bullets) {
            setSnackbarMessage('No content available to download!');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([`Summary:\n${summary}\n\nBullet Points:\n${bullets}`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "summary.txt";
        document.body.appendChild(element);
        element.click();

        setSnackbarMessage('Summary downloaded successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    return (
        <Container 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', 
                height: '100vh', 
                position: 'relative' 
            }}
        >
            {/* Glass Blur Effect */}
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

            {/* Summary Card */}
            <Card 
                sx={{ 
                    padding: 4, 
                    boxShadow: 10, 
                    width: '100%', 
                    maxWidth: 600, 
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
                        Summary & Bullet Points Ready!
                    </Typography>

                    <Box 
                        sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            padding: 3, 
                            borderRadius: 2, 
                            mt: 3, 
                            mb: 4 
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Summary:</Typography>
                        <Typography sx={{ mt: 1 }}>{summary}</Typography>

                        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3 }}>Bullet Points:</Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{bullets}</Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/home')}
                            sx={{ 
                                fontWeight: 'bold', 
                                textTransform: 'none', 
                                padding: '12px 24px', 
                                background: 'linear-gradient(135deg, #4facfe, #00f2fe)' 
                            }}
                        >
                            Generate Another
                        </Button>

                        <Button 
                            variant="outlined" 
                            onClick={handleDownload}
                            sx={{ 
                                fontWeight: 'bold', 
                                textTransform: 'none', 
                                padding: '12px 24px', 
                                borderColor: '#4facfe', 
                                color: '#1976d2',
                                '&:hover': {
                                    background: '#e3f2fd',
                                    borderColor: '#4facfe',
                                }
                            }}
                        >
                            Download Summary
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Snackbar for download status */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={3000} 
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbarOpen(false)} 
                    severity={snackbarSeverity} 
                    sx={{ 
                        width: '100%', 
                        backdropFilter: 'blur(10px)', 
                        backgroundColor: snackbarSeverity === 'success' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)', 
                        color: '#fff', 
                        borderRadius: 2 
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default DownloadSummary;
