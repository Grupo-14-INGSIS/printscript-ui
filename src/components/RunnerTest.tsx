import React from 'react';
import { runnerService } from '../services/runnerService';
import { Button, Box, Typography } from '@mui/material';

const RunnerTest: React.FC = () => {
    const snippetId = '9af91631-cdfc-4341-9b8e-3694e5cb3672';
    // This should come from your auth context or service
    const userId = 'test-user'; 

    const handleStartExecution = async () => {
        try {
            const response = await runnerService.startSnippetExecution(snippetId, {
                userId,
                version: '1.0',
                environment: {},
            });
            console.log('Start execution success:', response);
            alert('Execution started: ' + response.status);
        } catch (error) {
            console.error('Start execution error:', error);
            alert('Error starting execution: ' + (error as Error).message);
        }
    };

    const handleSendInput = async () => {
        try {
            await runnerService.sendInput(snippetId, {
                userId,
                input: 'hello from UI',
            });
            console.log('Send input success');
            alert('Input sent successfully');
        } catch (error) {
            console.error('Send input error:', error);
            alert('Error sending input: ' + (error as Error).message);
        }
    };

    const handleCancelExecution = async () => {
        try {
            await runnerService.cancelExecution(snippetId, { userId });
            console.log('Cancel execution success');
            alert('Execution canceled successfully');
        } catch (error) {
            console.error('Cancel execution error:', error);
            alert('Error canceling execution: ' + (error as Error).message);
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Runner Service Test
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={handleStartExecution}>
                    Start Execution
                </Button>
                <Button variant="contained" color="secondary" onClick={handleSendInput}>
                    Send Input
                </Button>
                <Button variant="contained" color="error" onClick={handleCancelExecution}>
                    Cancel Execution
                </Button>
            </Box>
        </Box>
    );
};

export default RunnerTest;
