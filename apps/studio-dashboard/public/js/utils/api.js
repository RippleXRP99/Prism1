// Studio API Utils
window.studioAPI = {
    baseURL: 'http://localhost:3004',
    
    // Studio Authentication
    async authenticateStudio(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/api/studio/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error('Studio auth error:', error);
            return { success: false, error: 'Authentication failed' };
        }
    },
    
    // Add Creator via Studio Key
    async addCreatorWithKey(studioKey, creatorData) {
        try {
            const response = await fetch(`${this.baseURL}/api/studio/add-creator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studioKey, creatorData })
            });
            return await response.json();
        } catch (error) {
            console.error('Add creator error:', error);
            return { success: false, error: 'Failed to add creator' };
        }
    },
    
    // Get Studio Portfolio
    async getStudioPortfolio(studioId) {
        try {
            const response = await fetch(`${this.baseURL}/api/studio/${studioId}/portfolio`);
            return await response.json();
        } catch (error) {
            console.error('Portfolio fetch error:', error);
            return { success: false, creators: [] };
        }
    },
    
    // Update Creator Relationship
    async updateCreatorRelationship(studioId, creatorId, updates) {
        try {
            const response = await fetch(`${this.baseURL}/api/studio/${studioId}/creator/${creatorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Update creator error:', error);
            return { success: false, error: 'Failed to update creator' };
        }
    },
    
    // Get Studio Analytics
    async getStudioAnalytics(studioId, period = '30d') {
        try {
            const response = await fetch(`${this.baseURL}/api/studio/${studioId}/analytics?period=${period}`);
            return await response.json();
        } catch (error) {
            console.error('Analytics fetch error:', error);
            return { success: false, data: {} };
        }
    }
};
