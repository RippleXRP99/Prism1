const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.ADMIN_PORT || 3002;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PRISM Admin Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        /* PRISM Design System - Admin Dashboard Edition */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        :root {
          --prism-black: #121212;
          --prism-purple: #6A0DAD;
          --prism-pink: #FF1493;
          --prism-gray-25: #FDFDFD;
          --prism-gray-50: #F9FAFB;
          --prism-gray-100: #F3F4F6;
          --prism-gray-200: #E5E7EB;
          --prism-gray-300: #D1D5DB;
          --prism-gray-400: #9CA3AF;
          --prism-gray-500: #6B7280;
          --prism-gray-600: #4B5563;
          --prism-gray-700: #374151;
          --prism-gray-800: #1F2937;
          --prism-gray-900: #111827;
          --prism-success: #10B981;
          --prism-warning: #F59E0B;
          --prism-error: #EF4444;
          --prism-info: #3B82F6;
          --prism-gradient-primary: linear-gradient(135deg, var(--prism-purple) 0%, var(--prism-pink) 100%);
          --prism-gradient-admin: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --prism-gradient-subtle: linear-gradient(135deg, var(--prism-gray-50) 0%, var(--prism-gray-100) 100%);
          --prism-text-xs: 0.75rem;
          --prism-text-sm: 0.875rem;
          --prism-text-base: 1rem;
          --prism-text-lg: 1.125rem;
          --prism-text-xl: 1.25rem;
          --prism-text-2xl: 1.5rem;
          --prism-text-3xl: 1.875rem;
          --prism-text-4xl: 2.25rem;
          --prism-text-5xl: 3rem;
          --prism-space-xs: 0.25rem;
          --prism-space-sm: 0.5rem;
          --prism-space-md: 0.75rem;
          --prism-space-lg: 1rem;
          --prism-space-xl: 1.5rem;
          --prism-space-2xl: 2rem;
          --prism-space-3xl: 3rem;
          --prism-space-4xl: 4rem;
          --prism-radius-sm: 0.25rem;
          --prism-radius-md: 0.375rem;
          --prism-radius-lg: 0.5rem;
          --prism-radius-xl: 0.75rem;
          --prism-radius-2xl: 1rem;
          --prism-radius-3xl: 1.5rem;
          --prism-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --prism-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --prism-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --prism-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          --prism-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          --prism-transition-slow: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--prism-gradient-admin);
            min-height: 100vh;
            color: white;
            line-height: 1.6;
        }
        
        /* Utility Classes */
        .gradient-text {
            background: var(--prism-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .flex-prism { display: flex; align-items: center; }
        .text-center { text-align: center; }
        
        /* Button System */
        .btn-prism {
            display: inline-flex;
            align-items: center;
            gap: var(--prism-space-sm);
            padding: var(--prism-space-md) var(--prism-space-xl);
            border: none;
            border-radius: var(--prism-radius-lg);
            font-family: inherit;
            font-size: var(--prism-text-base);
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: var(--prism-transition);
            position: relative;
            overflow: hidden;
        }
        
        .btn-prism-primary {
            background: var(--prism-gradient-primary);
            color: white;
            box-shadow: var(--prism-shadow);
        }
        
        .btn-prism-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--prism-shadow-lg);
        }
        
        .btn-prism-glass {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .btn-prism-glass:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        /* Admin Layout */
        .admin-container {
            display: flex;
            min-height: 100vh;
        }
        
        .sidebar {
            width: 280px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            padding: var(--prism-space-3xl) var(--prism-space-xl);
            color: white;
            display: flex;
            flex-direction: column;
        }
        
        .logo-admin {
            font-size: var(--prism-text-2xl);
            font-weight: 800;
            margin-bottom: var(--prism-space-3xl);
            display: flex;
            align-items: center;
            gap: var(--prism-space-sm);
        }
        
        .logo-icon-admin {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: var(--prism-radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--prism-text-lg);
        }
        
        /* Navigation Items */
        .nav-item-admin {
            padding: var(--prism-space-lg);
            margin: var(--prism-space-sm) 0;
            background: rgba(255, 255, 255, 0.1);
            border-radius: var(--prism-radius-lg);
            cursor: pointer;
            transition: var(--prism-transition);
            display: flex;
            align-items: center;
            gap: var(--prism-space-md);
            position: relative;
            overflow: hidden;
        }
        
        .nav-item-admin::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: white;
            transform: scaleY(0);
            transition: transform var(--prism-transition);
        }
        
        .nav-item-admin:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(4px);
        }
        
        .nav-item-admin:hover::before {
            transform: scaleY(1);
        }
        
        .nav-item-admin.active {
            background: rgba(255, 255, 255, 0.25);
            box-shadow: var(--prism-shadow-lg);
        }
        
        .nav-item-admin.active::before {
            transform: scaleY(1);
        }
        
        /* Main Content */
        .main-content {
            flex: 1;
            padding: var(--prism-space-3xl);
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .header-admin {
            margin-bottom: var(--prism-space-3xl);
        }
        
        .header-admin h1 {
            font-size: var(--prism-text-5xl);
            font-weight: 700;
            margin-bottom: var(--prism-space-md);
        }
        
        .header-admin p {
            font-size: var(--prism-text-lg);
            opacity: 0.8;
        }
        
        /* Cards */
        .card-admin {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: var(--prism-radius-2xl);
            padding: var(--prism-space-2xl);
            margin-bottom: var(--prism-space-2xl);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: var(--prism-transition);
        }
        
        .card-admin:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: var(--prism-shadow-xl);
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--prism-space-2xl);
            margin-bottom: var(--prism-space-3xl);
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: var(--prism-radius-2xl);
            padding: var(--prism-space-2xl);
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: var(--prism-transition);
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--prism-shadow-xl);
        }
        
        .stat-value {
            font-size: var(--prism-text-4xl);
            font-weight: 700;
            margin-bottom: var(--prism-space-sm);
        }
        
        .stat-label {
            font-size: var(--prism-text-sm);
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        /* Table Styles */
        .table-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: var(--prism-radius-2xl);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: var(--prism-space-lg);
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .table th {
            background: rgba(255, 255, 255, 0.1);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: var(--prism-text-sm);
        }
        
        .table tr:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        /* Status Badges */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--prism-space-xs);
            padding: var(--prism-space-xs) var(--prism-space-sm);
            border-radius: var(--prism-radius-lg);
            font-size: var(--prism-text-xs);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .status-active {
            background: rgba(16, 185, 129, 0.2);
            color: #10B981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .status-pending {
            background: rgba(245, 158, 11, 0.2);
            color: #F59E0B;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .status-blocked {
            background: rgba(239, 68, 68, 0.2);
            color: #EF4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes prism-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .animate-in {
            animation: fadeIn 0.6s ease-out;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .admin-container { flex-direction: column; }
            .sidebar { width: 100%; }
            .main-content { padding: var(--prism-space-xl); }
            .stats-grid { grid-template-columns: 1fr; }
        }
            margin-bottom: 2rem;
            font-size: 1.5rem;
            text-align: center;
        }
        
        .nav-item {
            display: block;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            width: 100%;
            text-align: left;
        }
        
        .nav-item:hover,
        .nav-item.active {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(5px);
        }
        
        .main-content {
            flex: 1;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.95);
            overflow-y: auto;
        }
        
        .header {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            color: #666;
        }
        
        .admin-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .admin-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .admin-card:hover {
            transform: translateY(-5px);
        }
        
        .admin-card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .btn {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f39c12, #e67e22);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #27ae60, #229954);
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-suspended {
            background: #f8d7da;
            color: #721c24;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .search-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .search-bar input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;
        const API_BASE = 'http://localhost:3004/api';

        function AdminDashboard() {
            const [currentView, setCurrentView] = useState('dashboard');
            const [users, setUsers] = useState([]);
            const [content, setContent] = useState([]);
            const [reports, setReports] = useState([]);
            const [showModal, setShowModal] = useState(false);
            const [modalContent, setModalContent] = useState(null);
            const [searchTerm, setSearchTerm] = useState('');

            // Function to load users from API and localStorage
            const loadUsersFromStorage = async () => {
                try {
                    // Try to load from API first (using public admin route)
                    const response = await fetch('http://localhost:3004/api/admin/users', {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Loaded users from API:', data.users);
                        setUsers(data.users);
                        return;
                    } else {
                        console.log('API response not ok:', response.status);
                    }
                } catch (error) {
                    console.log('API not available, using localStorage fallback:', error);
                }
                
                // Fallback to localStorage
                const registeredUsers = JSON.parse(localStorage.getItem('prism_users') || '[]');
                console.log('Fallback users from localStorage:', registeredUsers);
                
                const realUsers = registeredUsers.map((user, index) => ({
                    id: user.id || (index + 1),
                    username: user.username || user.email.split('@')[0],
                    email: user.email,
                    role: user.role || 'user',
                    status: user.status || 'active',
                    joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    totalContent: user.totalContent || 0,
                    totalRevenue: user.totalRevenue || '$0'
                }));

                const mockUsers = realUsers.length === 0 ? [
                    { id: 1000, username: 'demo_creator', email: 'creator@demo.com', role: 'creator', status: 'active', joinDate: '2025-01-15', totalContent: 25, totalRevenue: '$1,234' },
                    { id: 1001, username: 'demo_user', email: 'user@demo.com', role: 'user', status: 'active', joinDate: '2025-02-20', totalContent: 0, totalRevenue: '$0' }
                ] : [];

                setUsers([...realUsers, ...mockUsers]);
            };

            // Load real users from localStorage and mock data for demonstration
            useEffect(() => {
                loadUsersFromStorage();

                setContent([
                    { id: 1, title: 'Amazing Tutorial', creator: 'creator1', views: 15420, status: 'published', created: '2025-07-20', reports: 0 },
                    { id: 2, title: 'Live Stream Highlight', creator: 'creator1', views: 8900, status: 'published', created: '2025-07-22', reports: 2 },
                    { id: 3, title: 'Controversial Video', creator: 'creator1', views: 2300, status: 'flagged', created: '2025-07-23', reports: 5 }
                ]);

                setReports([
                    { id: 1, type: 'inappropriate_content', contentId: 2, reporter: 'user123', status: 'pending', created: '2025-07-23 09:30' },
                    { id: 2, type: 'spam', contentId: 3, reporter: 'user456', status: 'resolved', created: '2025-07-23 10:15' },
                    { id: 3, type: 'harassment', userId: 3, reporter: 'user789', status: 'investigating', created: '2025-07-23 11:00' }
                ]);

                // Auto-refresh users every 10 seconds to catch new registrations
                const interval = setInterval(loadUsersFromStorage, 10000);
                return () => clearInterval(interval);
            }, []);

            const handleUserAction = async (userId, action, newValue = null) => {
                try {
                    if (action === 'suspend' || action === 'activate') {
                        const status = action === 'suspend' ? 'suspended' : 'active';
                        
                        const response = await fetch(\`http://localhost:3004/api/admin/users/\${userId}/status\`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status })
                        });
                        
                        if (response.ok) {
                            setUsers(users.map(user => 
                                user.id === userId ? { ...user, status } : user
                            ));
                            alert(\`User \${action}d successfully\`);
                            loadUsersFromStorage(); // Refresh from API
                        } else {
                            throw new Error('Failed to update user status');
                        }
                    } else if (action === 'changeRole') {
                        const response = await fetch(\`http://localhost:3004/api/admin/users/\${userId}/role\`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ role: newValue })
                        });
                        
                        if (response.ok) {
                            setUsers(users.map(user => 
                                user.id === userId ? { ...user, role: newValue } : user
                            ));
                            alert(\`User role updated to \${newValue} successfully\`);
                            loadUsersFromStorage(); // Refresh from API
                        } else {
                            throw new Error('Failed to update user role');
                        }
                    } else if (action === 'delete') {
                        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                            // For now, just remove from local state - you can implement API deletion later
                            setUsers(users.filter(user => user.id !== userId));
                            alert('User deleted successfully');
                        }
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user. Please try again.');
                }
            };

            const handleContentAction = (contentId, action) => {
                if (action === 'approve') {
                    setContent(content.map(item => 
                        item.id === contentId ? { ...item, status: 'published' } : item
                    ));
                    alert('Content approved');
                } else if (action === 'remove') {
                    setContent(content.filter(item => item.id !== contentId));
                    alert('Content removed');
                }
            };

            const openModal = (type, data) => {
                setModalContent({ type, data });
                setShowModal(true);
            };

            const renderDashboard = () => {
                const activeUsers = users.filter(user => user.status === 'active').length;
                const totalUsers = users.length;
                const pendingReports = reports.filter(report => report.status === 'pending').length;
                
                return (
                <div>
                    <div className="header">
                        <h1>🛡️ Admin Dashboard</h1>
                        <p>System administration and platform management</p>
                    </div>

                    <div className="admin-grid">
                        <div className="admin-card">
                            <h3>👥 Total Users</h3>
                            <div className="stat-number">{totalUsers}</div>
                            <div className="stat-label">{activeUsers} active platform users</div>
                            <div style={{marginTop: '1rem'}}>
                                <button className="btn" onClick={() => setCurrentView('users')}>
                                    Manage Users
                                </button>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3>📹 Content Items</h3>
                            <div className="stat-number">{content.length}</div>
                            <div className="stat-label">Published content pieces</div>
                            <div style={{marginTop: '1rem'}}>
                                <button className="btn" onClick={() => setCurrentView('content')}>
                                    Moderate Content
                                </button>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3>🚨 Reports</h3>
                            <div className="stat-number">{pendingReports}</div>
                            <div className="stat-label">Pending reports</div>
                            <div style={{marginTop: '1rem'}}>
                                <button className="btn btn-warning" onClick={() => setCurrentView('reports')}>
                                    Review Reports
                                </button>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3>💰 Revenue</h3>
                            <div className="stat-number">$45,892</div>
                            <div className="stat-label">This month's platform revenue</div>
                            <div style={{marginTop: '1rem'}}>
                                <button className="btn" onClick={() => setCurrentView('analytics')}>
                                    View Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="admin-grid">
                        <div className="admin-card">
                            <h3>⚙️ System Health</h3>
                            <ul style={{listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '0.5rem'}}>🟢 API Server: Online</li>
                                <li style={{marginBottom: '0.5rem'}}>🟢 Database: Connected</li>
                                <li style={{marginBottom: '0.5rem'}}>🟢 Media Storage: 89% available</li>
                                <li style={{marginBottom: '0.5rem'}}>🟢 Streaming Service: Active</li>
                            </ul>
                        </div>

                        <div className="admin-card">
                            <h3>📊 Quick Stats</h3>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center'}}>
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60'}}>94%</div>
                                    <div style={{fontSize: '0.8rem', color: '#666'}}>Uptime</div>
                                </div>
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db'}}>1.2s</div>
                                    <div style={{fontSize: '0.8rem', color: '#666'}}>Avg Response</div>
                                </div>
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12'}}>156</div>
                                    <div style={{fontSize: '0.8rem', color: '#666'}}>Active Streams</div>
                                </div>
                                <div>
                                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c'}}>4</div>
                                    <div style={{fontSize: '0.8rem', color: '#666'}}>Critical Issues</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
            };

            const renderUsers = () => (
                <div>
                    <div className="header">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <h1>👥 User Management</h1>
                                <p>Manage platform users and their permissions</p>
                            </div>
                            <button className="btn btn-success" onClick={() => openModal('createUser')}>
                                ➕ Add User
                            </button>
                        </div>
                    </div>

                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select style={{padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px'}}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="creator">Creator</option>
                            <option value="user">User</option>
                        </select>
                        <select style={{padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px'}}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Join Date</th>
                                    <th>Content</th>
                                    <th>Revenue</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users
                                    .filter(user => 
                                        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div>
                                                <strong>{user.username}</strong>
                                                <div style={{fontSize: '0.8rem', color: '#666'}}>{user.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <select 
                                                value={user.role}
                                                onChange={(e) => handleUserAction(user.id, 'changeRole', e.target.value)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: user.role === 'admin' ? '#ffebee' : 
                                                                   user.role === 'creator' ? '#e8f5e8' : 
                                                                   user.role === 'moderator' ? '#fff3e0' : '#f5f5f5'
                                                }}
                                            >
                                                <option value="user">User</option>
                                                <option value="creator">Creator</option>
                                                <option value="moderator">Moderator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={\`status-badge status-\${user.status}\`}>
                                                {user.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{user.joinDate}</td>
                                        <td>{user.totalContent}</td>
                                        <td>{user.totalRevenue}</td>
                                        <td>
                                            <button 
                                                className="btn" 
                                                style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                onClick={() => openModal('editUser', user)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            {user.status === 'active' ? (
                                                <button 
                                                    className="btn btn-warning" 
                                                    style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                                >
                                                    ⏸️ Suspend
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn btn-success" 
                                                    style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                    onClick={() => handleUserAction(user.id, 'activate')}
                                                >
                                                    ✅ Activate
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-danger" 
                                                style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                onClick={() => handleUserAction(user.id, 'delete')}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );

            const renderContent = () => (
                <div>
                    <div className="header">
                        <h1>📹 Content Moderation</h1>
                        <p>Review and moderate platform content</p>
                    </div>

                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search content..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select style={{padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px'}}>
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="flagged">Flagged</option>
                            <option value="pending">Pending Review</option>
                        </select>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Content</th>
                                    <th>Creator</th>
                                    <th>Views</th>
                                    <th>Status</th>
                                    <th>Reports</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content
                                    .filter(item => 
                                        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        item.creator.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{item.title}</strong>
                                        </td>
                                        <td>{item.creator}</td>
                                        <td>{item.views.toLocaleString()}</td>
                                        <td>
                                            <span className={\`status-badge status-\${item.status === 'published' ? 'active' : item.status === 'flagged' ? 'suspended' : 'pending'}\`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {item.reports > 0 && (
                                                <span style={{color: '#e74c3c', fontWeight: 'bold'}}>
                                                    {item.reports} reports
                                                </span>
                                            )}
                                        </td>
                                        <td>{item.created}</td>
                                        <td>
                                            <button 
                                                className="btn" 
                                                style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                onClick={() => openModal('viewContent', item)}
                                            >
                                                👁️ View
                                            </button>
                                            {item.status === 'flagged' && (
                                                <button 
                                                    className="btn btn-success" 
                                                    style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                    onClick={() => handleContentAction(item.id, 'approve')}
                                                >
                                                    ✅ Approve
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-danger" 
                                                style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                onClick={() => handleContentAction(item.id, 'remove')}
                                            >
                                                🗑️ Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );

            const renderReports = () => (
                <div>
                    <div className="header">
                        <h1>🚨 Reports Management</h1>
                        <p>Review and handle user reports</p>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Report Type</th>
                                    <th>Target</th>
                                    <th>Reporter</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id}>
                                        <td>
                                            <span className="status-badge status-pending">
                                                {report.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {report.contentId ? \`Content #\${report.contentId}\` : \`User #\${report.userId}\`}
                                        </td>
                                        <td>{report.reporter}</td>
                                        <td>
                                            <span className={\`status-badge status-\${report.status === 'resolved' ? 'active' : report.status === 'investigating' ? 'pending' : 'suspended'}\`}>
                                                {report.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{report.created}</td>
                                        <td>
                                            <button 
                                                className="btn" 
                                                style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                                onClick={() => openModal('viewReport', report)}
                                            >
                                                👁️ Review
                                            </button>
                                            <button 
                                                className="btn btn-success" 
                                                style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                                            >
                                                ✅ Resolve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );

            const renderSettings = () => (
                <div>
                    <div className="header">
                        <h1>⚙️ System Settings</h1>
                        <p>Configure platform settings and permissions</p>
                    </div>

                    <div className="admin-grid">
                        <div className="admin-card">
                            <h3>🔐 Role Management</h3>
                            <p>Configure user roles and permissions</p>
                            <ul style={{listStyle: 'none', padding: 0, marginTop: '1rem'}}>
                                <li style={{marginBottom: '0.5rem'}}>👑 <strong>Admin:</strong> Full system access</li>
                                <li style={{marginBottom: '0.5rem'}}>🎬 <strong>Creator:</strong> Content creation & monetization</li>
                                <li style={{marginBottom: '0.5rem'}}>👤 <strong>User:</strong> Content consumption</li>
                                <li style={{marginBottom: '0.5rem'}}>🔧 <strong>Moderator:</strong> Content moderation</li>
                            </ul>
                            <button className="btn" onClick={() => openModal('roleSettings')}>
                                Configure Roles
                            </button>
                        </div>

                        <div className="admin-card">
                            <h3>💰 Payment Settings</h3>
                            <p>Configure payment and monetization settings</p>
                            <div style={{marginTop: '1rem'}}>
                                <div style={{marginBottom: '0.5rem'}}>Platform Fee: <strong>5%</strong></div>
                                <div style={{marginBottom: '0.5rem'}}>Processing Fee: <strong>2.9%</strong></div>
                                <div style={{marginBottom: '0.5rem'}}>Minimum Payout: <strong>$10</strong></div>
                            </div>
                            <button className="btn">Update Payment Settings</button>
                        </div>

                        <div className="admin-card">
                            <h3>📊 Analytics Settings</h3>
                            <p>Configure analytics and reporting</p>
                            <button className="btn">Analytics Config</button>
                            <button className="btn">Export Data</button>
                        </div>

                        <div className="admin-card">
                            <h3>🛡️ Security Settings</h3>
                            <p>Configure security and compliance settings</p>
                            <button className="btn">Security Config</button>
                            <button className="btn">Audit Logs</button>
                        </div>
                    </div>
                </div>
            );

            const renderModal = () => {
                if (!showModal || !modalContent) return null;

                const { type, data } = modalContent;

                return (
                    <div className="modal" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            {type === 'editUser' && (
                                <div>
                                    <h3>Edit User: {data.username}</h3>
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input type="text" defaultValue={data.username} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" defaultValue={data.email} />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select defaultValue={data.role}>
                                            <option value="user">User</option>
                                            <option value="creator">Creator</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <button className="btn">Save Changes</button>
                                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {type === 'roleSettings' && (
                                <div>
                                    <h3>Role & Permission Management</h3>
                                    <p>Configure what each role can do on the platform</p>
                                    
                                    <div style={{marginTop: '2rem'}}>
                                        <h4>🎬 Creator Permissions</h4>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                                            <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                                            Upload content
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                                            <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                                            Live streaming
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                                            <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                                            Monetization
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                                            <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                                            Analytics access
                                        </label>

                                        <h4>🔧 Moderator Permissions</h4>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                                            <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                                            Review reports
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                                            <input type="checkbox" defaultChecked style={{marginRight: '0.5rem'}} />
                                            Moderate content
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                                            <input type="checkbox" style={{marginRight: '0.5rem'}} />
                                            User management
                                        </label>
                                    </div>

                                    <div style={{marginTop: '2rem'}}>
                                        <button className="btn">Save Permissions</button>
                                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {type === 'viewContent' && (
                                <div>
                                    <h3>Content Details</h3>
                                    <p><strong>Title:</strong> {data.title}</p>
                                    <p><strong>Creator:</strong> {data.creator}</p>
                                    <p><strong>Views:</strong> {data.views.toLocaleString()}</p>
                                    <p><strong>Status:</strong> {data.status}</p>
                                    <p><strong>Reports:</strong> {data.reports}</p>
                                    <div style={{marginTop: '1rem'}}>
                                        <button className="btn" onClick={() => setShowModal(false)}>Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            };

            const getCurrentView = () => {
                switch (currentView) {
                    case 'users': return renderUsers();
                    case 'content': return renderContent();
                    case 'reports': return renderReports();
                    case 'settings': return renderSettings();
                    default: return renderDashboard();
                }
            };

            return (
                <div className="admin-container">
                    <div className="sidebar">
                        <div className="logo-admin">
                            <div className="logo-icon-admin">🛡️</div>
                            PRISM Admin
                        </div>
                        
                        <nav style={{flex: 1}}>
                            <button 
                                className={'nav-item-admin ' + (currentView === 'dashboard' ? 'active' : '')}
                                onClick={() => setCurrentView('dashboard')}
                            >
                                <span>📊</span>
                                <span>Dashboard</span>
                            </button>
                            <button 
                                className={'nav-item-admin ' + (currentView === 'users' ? 'active' : '')}
                                onClick={() => setCurrentView('users')}
                            >
                                <span>👥</span>
                                <span>Users</span>
                            </button>
                            <button 
                                className={'nav-item-admin ' + (currentView === 'content' ? 'active' : '')}
                                onClick={() => setCurrentView('content')}
                            >
                                <span>📹</span>
                                <span>Content</span>
                            </button>
                            <button 
                                className={'nav-item-admin ' + (currentView === 'reports' ? 'active' : '')}
                                onClick={() => setCurrentView('reports')}
                            >
                                <span>🚨</span>
                                <span>Reports</span>
                            </button>
                            <button 
                                className={'nav-item-admin ' + (currentView === 'settings' ? 'active' : '')}
                                onClick={() => setCurrentView('settings')}
                            >
                                <span>⚙️</span>
                                <span>Settings</span>
                            </button>
                        </nav>
                        
                        <div className="user-profile-admin">
                            <div className="user-avatar-admin">👨‍💼</div>
                            <div className="user-info-admin">
                                <div className="user-name-admin">Admin User</div>
                                <div className="user-email-admin">admin@prism.com</div>
                            </div>
                            <button className="btn-prism btn-prism-danger" style={{marginTop: 'var(--prism-space-lg)', width: '100%'}}>
                                <span>🚪</span>
                                Logout
                            </button>
                        </div>
                        
                        <div style={{marginTop: 'var(--prism-space-lg)'}}>
                            <a 
                                href="http://localhost:3000" 
                                target="_blank" 
                                className="btn-prism btn-prism-glass"
                                style={{width: '100%', justifyContent: 'center'}}
                            >
                                <span>🔗</span>
                                View Site
                            </a>
                        </div>
                    </div>
                    
                    <div className="main-content animate-in">
                        {getCurrentView()}
                    </div>

                    {renderModal()}
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<AdminDashboard />);
    </script>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🛡️ PRISM Admin Dashboard running on http://localhost:${PORT}`);
  console.log(`🔗 API Server: http://localhost:${process.env.API_PORT || 3004}`);
  console.log(`🔗 Consumer Frontend: http://localhost:${process.env.CONSUMER_PORT || 3000}`);
  console.log(`🔗 Creator Studio: http://localhost:${process.env.CREATOR_PORT || 3001}`);
  console.log(`✨ Features: User Management, Content Moderation, System Analytics, Role Management`);
});
