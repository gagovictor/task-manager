import API_BASE_URL from '../../shared/config/apiConfig';

export const fetchTasks = async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    
    return response.json();
};