const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.CREATOR_PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Creator Studio React Application
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PRISM Creator Studio</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            /* PRISM Design System - Creator Studio Edition */
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
              --prism-gradient-radial: radial-gradient(circle at center, var(--prism-purple) 0%, var(--prism-black) 100%);
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
                line-height: 1.6;
                color: var(--prism-gray-800);
                background: var(--prism-gray-900);
                min-height: 100vh;
                overflow-x: hidden;
            }
            
            /* Dark Theme for Creator Studio */
            .dark-theme {
                background: var(--prism-gray-900);
                color: var(--prism-gray-100);
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
            
            .btn-prism-dark {
                background: var(--prism-gray-700);
                color: var(--prism-gray-100);
                border: 1px solid var(--prism-gray-600);
            }
            
            .btn-prism-dark:hover {
                background: var(--prism-gray-600);
                transform: translateY(-2px);
            }
            
            /* Card System */
            .card-prism {
                background: var(--prism-gray-800);
                border-radius: var(--prism-radius-2xl);
                padding: var(--prism-space-2xl);
                box-shadow: var(--prism-shadow);
                border: 1px solid var(--prism-gray-700);
                transition: var(--prism-transition);
            }
            
            .card-prism:hover {
                box-shadow: var(--prism-shadow-lg);
                border-color: var(--prism-gray-600);
            }
            
            /* Layout */
            .layout { 
                display: flex; 
                height: 100vh; 
                background: var(--prism-gray-900);
            }
            
            .sidebar { 
                width: 280px; 
                background: var(--prism-gray-800);
                padding: var(--prism-space-2xl); 
                box-sizing: border-box;
                border-right: 1px solid var(--prism-gray-700); 
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .main-content { 
                flex: 1; 
                padding: var(--prism-space-3xl); 
                overflow-y: auto; 
                background: var(--prism-gray-900);
            }
            
            /* Navigation */
            .logo-creator {
                font-size: var(--prism-text-2xl);
                font-weight: 800;
                background: var(--prism-gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: var(--prism-space-2xl);
                display: flex;
                align-items: center;
                gap: var(--prism-space-sm);
            }
            
            .logo-icon-creator {
                width: 32px;
                height: 32px;
                background: var(--prism-gradient-primary);
                border-radius: var(--prism-radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: var(--prism-text-lg);
            }
            
            .nav-item { 
                padding: var(--prism-space-lg);
                margin: var(--prism-space-sm) 0;
                background: var(--prism-gray-700);
                border-radius: var(--prism-radius-lg);
                cursor: pointer;
                transition: var(--prism-transition);
                display: flex;
                align-items: center;
                gap: var(--prism-space-md);
                color: var(--prism-gray-300);
                position: relative;
                overflow: hidden;
            }
            
            .nav-item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: var(--prism-gradient-primary);
                transform: scaleY(0);
                transition: transform var(--prism-transition);
            }
            
            .nav-item:hover {
                background: var(--prism-gray-600);
                color: var(--prism-gray-100);
                transform: translateX(4px);
            }
            
            .nav-item:hover::before {
                transform: scaleY(1);
            }
            
            .nav-item.active {
                background: rgba(106, 13, 173, 0.2);
                color: var(--prism-purple);
                border: 1px solid rgba(106, 13, 173, 0.3);
            }
            
            .nav-item.active::before {
                transform: scaleY(1);
            }
            
            /* Header */
            .header { 
                margin-bottom: var(--prism-space-3xl);
                padding-bottom: var(--prism-space-2xl);
                border-bottom: 1px solid var(--prism-gray-700);
            }
            
            .header h1 {
                font-size: var(--prism-text-4xl);
                font-weight: 700;
                color: var(--prism-gray-100);
                margin-bottom: var(--prism-space-md);
            }
            
            .header p {
                color: var(--prism-gray-400);
                font-size: var(--prism-text-lg);
            }
            
            /* Status Indicators */
            .status { 
                color: var(--prism-success); 
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: var(--prism-space-xs);
            }
            
            .status::before {
                content: '';
                width: 8px;
                height: 8px;
                background: var(--prism-success);
                border-radius: 50%;
            }
            
            /* Feature Grid */
            .feature-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
                gap: var(--prism-space-2xl);
                margin-bottom: var(--prism-space-3xl);
            }
            
            /* Animations */
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes prism-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes prism-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            
            .prism-spin { animation: prism-spin 1s linear infinite; }
            .prism-pulse { animation: prism-pulse 2s ease-in-out infinite; }
            
            /* Content appears with animation */
            .animate-in {
                animation: fadeIn 0.6s ease-out;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .layout { flex-direction: column; }
                .sidebar { width: 100%; height: auto; }
                .main-content { padding: var(--prism-space-xl); }
                .feature-grid { grid-template-columns: 1fr; }
            }
            .btn { 
                padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; 
                background: #007bff; color: white; text-decoration: none; display: inline-block;
                transition: background 0.2s;
            }
            .btn:hover { background: #0056b3; }
            .btn-secondary { background: #6c757d; }
            .btn-secondary:hover { background: #545b62; }
            .btn-success { background: #28a745; }
            .btn-success:hover { background: #1e7e34; }
            .content-table { width: 100%; background: #2d2d2d; border-radius: 8px; overflow: hidden; }
            .content-table th, .content-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #3d3d3d; }
            .content-table th { background: #3d3d3d; }
            .modal { 
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                z-index: 1000;
            }
            .modal-content { 
                background: #2d2d2d; padding: 2rem; border-radius: 8px;
                width: 500px; max-width: 90vw; max-height: 90vh; overflow-y: auto;
            }
            .form-group { margin-bottom: 1rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; }
            .form-group input, .form-group textarea, .form-group select { 
                width: 100%; padding: 0.5rem; border: 1px solid #3d3d3d; 
                border-radius: 4px; background: #1a1a1a; color: #fff;
            }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
            .stat-card { background: #2d2d2d; padding: 1rem; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 2rem; font-weight: bold; color: #007bff; }
            .dashboard-actions { display: flex; gap: 1rem; margin-bottom: 2rem; }
            @media (max-width: 768px) {
                .layout { flex-direction: column; }
                .sidebar { width: 100%; height: auto; }
                .main-content { padding: 1rem; }
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        
        <script type="text/babel">
            const { useState, useEffect } = React;
            
            // API Base URL
            const API_BASE = 'http://localhost:3004/api';
            
            // Navigation Items
            const navItems = [
                { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                { id: 'content', icon: '📹', label: 'Content' },
                { id: 'analytics', icon: '📈', label: 'Analytics' },
                { id: 'monetization', icon: '💰', label: 'Monetization' },
                { id: 'streaming', icon: '🎙️', label: 'Live Stream' },
                { id: 'multiplatform', icon: '🌐', label: 'Multi-Platform' },
                { id: 'streaming-tools', icon: '🎬', label: 'Stream Tools' },
                { id: 'planning', icon: '📅', label: 'Content Planning' },
                { id: 'collaboration', icon: '👥', label: 'Collaboration' },
                { id: 'community', icon: '�', label: 'Community' },
                { id: 'settings', icon: '⚙️', label: 'Settings' }
            ];
            
            // Components
            function Sidebar({ activeTab, onTabChange, user }) {
                return (
                    <div className="sidebar">
                        <div className="logo-creator">
                            <div className="logo-icon-creator">🎨</div>
                            Creator Studio
                        </div>
                        
                        {user && (
                            <div className="card-prism" style={{
                                marginBottom: 'var(--prism-space-2xl)',
                                padding: 'var(--prism-space-lg)',
                                background: var('--prism-gray-700')
                            }}>
                                <div className="flex-prism" style={{marginBottom: 'var(--prism-space-sm)'}}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'var(--prism-gradient-primary)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 'var(--prism-space-md)',
                                        color: 'white',
                                        fontWeight: '600'
                                    }}>
                                        {(user.profile?.displayName || user.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{fontWeight: '600', color: 'var(--prism-gray-100)'}}>
                                            {user.profile?.displayName || user.username}
                                        </div>
                                        <div style={{fontSize: 'var(--prism-text-sm)', color: 'var(--prism-gray-400)'}}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="status">
                                    Creator Account
                                </div>
                            </div>
                        )}
                        
                        <nav style={{flex: 1}}>
                            {navItems.map(item => (
                                <div 
                                    key={item.id}
                                    className={'nav-item ' + (activeTab === item.id ? 'active' : '')}
                                    onClick={() => onTabChange(item.id)}
                                >
                                    <span style={{fontSize: 'var(--prism-text-lg)'}}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </nav>
                        
                        <div style={{
                            marginTop: 'var(--prism-space-2xl)',
                            paddingTop: 'var(--prism-space-xl)',
                            borderTop: '1px solid var(--prism-gray-700)'
                        }}>
                            <a 
                                href="http://localhost:3000" 
                                target="_blank" 
                                className="btn-prism btn-prism-dark"
                                style={{width: '100%', justifyContent: 'center'}}
                            >
                                <span>🔗</span>
                                View Consumer Site
                            </a>
                        </div>
                    </div>
                );
            }
            
            function Dashboard({ user, content }) {
                const stats = {
                    totalContent: content.length,
                    publishedContent: content.filter(c => c.status === 'published').length,
                    totalViews: content.reduce((sum, c) => sum + c.views, 0),
                    totalLikes: content.reduce((sum, c) => sum + c.likes, 0)
                };
                
                return (
                    <div className="animate-in">
                        <div className="header">
                            <h1 className="gradient-text">Dashboard</h1>
                            <p>Welcome back, {user?.profile?.displayName || user?.username}! Ready to create amazing content?</p>
                        </div>
                        
                        <div className="feature-grid" style={{marginBottom: 'var(--prism-space-3xl)'}}>
                            <div className="card-prism">
                                <div style={{
                                    fontSize: 'var(--prism-text-4xl)',
                                    fontWeight: '700',
                                    color: 'var(--prism-purple)',
                                    marginBottom: 'var(--prism-space-sm)'
                                }}>
                                    {stats.totalContent}
                                </div>
                                <div style={{
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Total Content
                                </div>
                            </div>
                            <div className="card-prism">
                                <div style={{
                                    fontSize: 'var(--prism-text-4xl)',
                                    fontWeight: '700',
                                    color: 'var(--prism-success)',
                                    marginBottom: 'var(--prism-space-sm)'
                                }}>
                                    {stats.publishedContent}
                                </div>
                                <div style={{
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Published
                                </div>
                            </div>
                            <div className="card-prism">
                                <div style={{
                                    fontSize: 'var(--prism-text-4xl)',
                                    fontWeight: '700',
                                    color: 'var(--prism-pink)',
                                    marginBottom: 'var(--prism-space-sm)'
                                }}>
                                    {stats.totalViews.toLocaleString()}
                                </div>
                                <div style={{
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Total Views
                                </div>
                            </div>
                            <div className="card-prism">
                                <div style={{
                                    fontSize: 'var(--prism-text-4xl)',
                                    fontWeight: '700',
                                    color: 'var(--prism-info)',
                                    marginBottom: 'var(--prism-space-sm)'
                                }}>
                                    {stats.totalLikes.toLocaleString()}
                                </div>
                                <div style={{
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Total Likes
                                </div>
                            </div>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            gap: 'var(--prism-space-lg)',
                            marginBottom: 'var(--prism-space-3xl)',
                            flexWrap: 'wrap'
                        }}>
                            <button className="btn-prism btn-prism-primary">
                                <span>📹</span>
                                New Video
                            </button>
                            <button className="btn-prism btn-prism-dark">
                                <span>🎙️</span>
                                Go Live
                            </button>
                            <button className="btn-prism btn-prism-dark">
                                <span>📊</span>
                                View Analytics
                            </button>
                        </div>
                        
                        <div className="card-prism">
                            <h3 style={{
                                fontSize: 'var(--prism-text-2xl)',
                                fontWeight: '600',
                                color: 'var(--prism-gray-100)',
                                marginBottom: 'var(--prism-space-lg)'
                            }}>
                                Quick Actions
                            </h3>
                            <p style={{
                                color: 'var(--prism-gray-400)',
                                marginBottom: 'var(--prism-space-xl)'
                            }}>
                                Get started with creating and managing your content
                            </p>
                            <div style={{
                                display: 'grid',
                                gap: 'var(--prism-space-md)',
                                color: 'var(--prism-gray-300)'
                            }}>
                                <div className="flex-prism" style={{gap: 'var(--prism-space-md)'}}>
                                    <span>📤</span>
                                    <span>Upload your first video</span>
                                </div>
                                <div className="flex-prism" style={{gap: 'var(--prism-space-md)'}}>
                                    <span>👤</span>
                                    <span>Set up your creator profile</span>
                                </div>
                                <div className="flex-prism" style={{gap: 'var(--prism-space-md)'}}>
                                    <span>💰</span>
                                    <span>Configure monetization</span>
                                </div>
                                <div className="flex-prism" style={{gap: 'var(--prism-space-md)'}}>
                                    <span>🔴</span>
                                    <span>Go live with your audience</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function ContentManager({ content, onContentUpdate }) {
                const [showModal, setShowModal] = useState(false);
                const [editingContent, setEditingContent] = useState(null);
                const [selectedFiles, setSelectedFiles] = useState([]);
                const [uploadProgress, setUploadProgress] = useState(0);
                const [formData, setFormData] = useState({
                    title: '', description: '', category: 'general', tags: '', status: 'draft'
                });
                
                const handleFileSelect = (e) => {
                    const files = Array.from(e.target.files);
                    setSelectedFiles(prev => [...prev, ...files]);
                };
                
                const removeFile = (index) => {
                    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                };
                
                const uploadFiles = async () => {
                    if (selectedFiles.length === 0) return [];
                    
                    const formData = new FormData();
                    selectedFiles.forEach(file => {
                        formData.append('files', file);
                    });
                    
                    try {
                        setUploadProgress(25);
                        const response = await fetch('/api/media/upload', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: formData
                        });
                        
                        setUploadProgress(75);
                        
                        if (!response.ok) {
                            throw new Error('Upload failed');
                        }
                        
                        const result = await response.json();
                        setUploadProgress(100);
                        
                        setTimeout(() => setUploadProgress(0), 1000);
                        return result.data.files;
                    } catch (error) {
                        console.error('Upload error:', error);
                        alert('Failed to upload files');
                        setUploadProgress(0);
                        return [];
                    }
                };
                
                const handleCreateContent = () => {
                    setEditingContent(null);
                    setSelectedFiles([]);
                    setFormData({ title: '', description: '', category: 'general', tags: '', status: 'draft' });
                    setShowModal(true);
                };
                
                const handleEditContent = (item) => {
                    setEditingContent(item);
                    setFormData({
                        title: item.title,
                        description: item.description,
                        category: item.category,
                        tags: item.tags.join(', '),
                        status: item.status
                    });
                    setShowModal(true);
                };
                
                const handleSubmit = async (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem('token');
                    
                    try {
                        // Upload files first if any are selected
                        let uploadedFiles = [];
                        if (selectedFiles.length > 0) {
                            uploadedFiles = await uploadFiles();
                        }
                        
                        const payload = {
                            ...formData,
                            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                            mediaFiles: uploadedFiles
                        };
                        
                        const url = editingContent 
                            ? API_BASE + '/content/' + editingContent._id
                            : API_BASE + '/content';
                        
                        const response = await fetch(url, {
                            method: editingContent ? 'PUT' : 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify(payload)
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            onContentUpdate();
                            setShowModal(false);
                            setSelectedFiles([]);
                            alert('Content ' + (editingContent ? 'updated' : 'created') + ' successfully!');
                        } else {
                            alert('Error: ' + result.error);
                        }
                    } catch (error) {
                        console.error('Submit error:', error);
                        alert('Network error');
                    }
                };
                
                return (
                    <div className="animate-in">
                        <div className="page-header">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <h1 className="gradient-text">Content Management</h1>
                                    <p className="page-subtitle">Create and manage your content</p>
                                </div>
                                <button className="btn-prism btn-prism-primary" onClick={handleCreateContent}>
                                    <span>➕</span>
                                    Create Content
                                </button>
                            </div>
                        </div>
                        
                        {content.length === 0 ? (
                            <div className="card-creator" style={{textAlign: 'center', padding: 'var(--prism-space-3xl)'}}>
                                <div style={{fontSize: '4rem', marginBottom: 'var(--prism-space-lg)'}}>🎬</div>
                                <h3 className="gradient-text">No content yet</h3>
                                <p style={{color: 'var(--prism-text-light)', marginBottom: 'var(--prism-space-xl)'}}>
                                    Start creating your first piece of content!
                                </p>
                                <button className="btn-prism btn-prism-primary" onClick={handleCreateContent}>
                                    <span>✨</span>
                                    Create Your First Content
                                </button>
                            </div>
                        ) : (
                            <div className="card-creator">
                                <table className="table-prism">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Status</th>
                                            <th>Category</th>
                                            <th>Views</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {content.map(item => (
                                            <tr key={item._id}>
                                                <td>
                                                    <div style={{fontWeight: '600', color: 'var(--prism-text)'}}>{item.title}</div>
                                                </td>
                                                <td>
                                                    <span className={'status-badge status-' + item.status}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        color: 'var(--prism-text-light)',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{color: 'var(--prism-text-light)'}}>
                                                        {item.views?.toLocaleString() || '0'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn-prism btn-prism-ghost" 
                                                        onClick={() => handleEditContent(item)}
                                                    >
                                                        <span>✏️</span>
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {showModal && (
                            <div className="modal-overlay" onClick={() => !uploadProgress && setShowModal(false)}>
                                <div className="modal-content-prism" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3 className="gradient-text">
                                            {editingContent ? 'Edit Content' : 'Create New Content'}
                                        </h3>
                                        <button 
                                            className="modal-close"
                                            onClick={() => setShowModal(false)}
                                            disabled={uploadProgress > 0 && uploadProgress < 100}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit} className="modal-body">
                                        <div className="form-group-prism">
                                            <label className="form-label">Title</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                required 
                                                placeholder="Enter content title..."
                                            />
                                        </div>
                                        
                                        <div className="form-group-prism">
                                            <label className="form-label">Description</label>
                                            <textarea 
                                                className="form-textarea"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                rows="3"
                                                placeholder="Describe your content..."
                                            />
                                        </div>
                                        
                                        <div className="form-group-prism">
                                            <label className="form-label">Media Files</label>
                                            <div className="upload-zone">
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    accept="video/*,image/*,audio/*"
                                                    onChange={handleFileSelect}
                                                    style={{display: 'none'}}
                                                    id="mediaUpload"
                                                />
                                                <label htmlFor="mediaUpload" className="upload-label">
                                                    <div style={{fontSize: '2rem', marginBottom: 'var(--prism-space-md)'}}>📁</div>
                                                    <div style={{fontWeight: '600', marginBottom: 'var(--prism-space-sm)'}}>
                                                        Drop files here or click to browse
                                                    </div>
                                                    <div style={{fontSize: '0.9rem', color: 'var(--prism-text-light)'}}>
                                                        Supports: MP4, AVI, MOV, JPG, PNG, MP3, WAV (Max 500MB)
                                                    </div>
                                                </label>
                                            </div>
                                            
                                            {selectedFiles.length > 0 && (
                                                <div style={{marginTop: 'var(--prism-space-lg)'}}>
                                                    <h4 style={{marginBottom: 'var(--prism-space-md)', color: 'var(--prism-text)'}}>
                                                        Selected Files:
                                                    </h4>
                                                    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)'}}>
                                                        {selectedFiles.map((file, index) => (
                                                            <div key={index} className="file-item">
                                                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)'}}>
                                                                    <span>📎</span>
                                                                    <span style={{fontWeight: '500'}}>{file.name}</span>
                                                                    <span style={{color: 'var(--prism-text-light)', fontSize: '0.9rem'}}>
                                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    className="btn-prism btn-prism-danger-ghost"
                                                                    onClick={() => removeFile(index)}
                                                                    style={{padding: 'var(--prism-space-xs)'}}
                                                                >
                                                                    ❌
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--prism-space-lg)'}}>
                                            <div className="form-group-prism">
                                                <label className="form-label">Category</label>
                                                <select 
                                                    className="form-select"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                >
                                                    <option value="general">General</option>
                                                    <option value="entertainment">Entertainment</option>
                                                    <option value="gaming">Gaming</option>
                                                    <option value="music">Music</option>
                                                    <option value="education">Education</option>
                                                    <option value="technology">Technology</option>
                                                </select>
                                            </div>
                                            
                                            <div className="form-group-prism">
                                                <label className="form-label">Status</label>
                                                <select 
                                                    className="form-select"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="published">Published</option>
                                                    <option value="private">Private</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div className="form-group-prism">
                                            <label className="form-label">Tags</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={formData.tags}
                                                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                                placeholder="tag1, tag2, tag3"
                                            />
                                        </div>
                                        
                                        {uploadProgress > 0 && (
                                            <div className="upload-progress">
                                                <div style={{
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    marginBottom: 'var(--prism-space-sm)'
                                                }}>
                                                    <span style={{fontSize: '0.9rem', color: 'var(--prism-text)'}}>
                                                        Uploading files...
                                                    </span>
                                                    <span style={{fontSize: '0.9rem', fontWeight: '600'}}>
                                                        {uploadProgress}%
                                                    </span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{width: uploadProgress + '%'}}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="modal-actions">
                                            <button 
                                                type="button" 
                                                className="btn-prism btn-prism-ghost" 
                                                onClick={() => setShowModal(false)}
                                                disabled={uploadProgress > 0 && uploadProgress < 100}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn-prism btn-prism-primary"
                                                disabled={uploadProgress > 0 && uploadProgress < 100}
                                            >
                                                {uploadProgress > 0 && uploadProgress < 100 
                                                    ? 'Uploading...' 
                                                    : editingContent ? 'Update Content' : 'Create Content'
                                                }
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            
            function Analytics({ content }) {
                return (
                    <div className="animate-in">
                        <div className="page-header">
                            <div>
                                <h1 className="gradient-text">Analytics</h1>
                                <p className="page-subtitle">Track your content performance and audience engagement</p>
                            </div>
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--prism-space-xl)', marginBottom: 'var(--prism-space-2xl)'}}>
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <div style={{fontSize: '2rem'}}>📊</div>
                                    <h3 className="gradient-text">Performance Metrics</h3>
                                </div>
                                <p style={{color: 'var(--prism-text-light)', marginBottom: 'var(--prism-space-lg)'}}>
                                    View detailed analytics for your content
                                </p>
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>👁️</span>
                                        <span>View counts and watch time</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>💫</span>
                                        <span>Engagement rates</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>⏱️</span>
                                        <span>Audience retention</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>🔗</span>
                                        <span>Traffic sources</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <div style={{fontSize: '2rem'}}>👥</div>
                                    <h3 className="gradient-text">Audience Insights</h3>
                                </div>
                                <p style={{color: 'var(--prism-text-light)', marginBottom: 'var(--prism-space-lg)'}}>
                                    Understand your audience better
                                </p>
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📊</span>
                                        <span>Demographics</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>🌍</span>
                                        <span>Geographic distribution</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📱</span>
                                        <span>Device and platform usage</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-sm)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>⏰</span>
                                        <span>Viewing patterns</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card-creator">
                            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-xl)'}}>
                                <div style={{fontSize: '2rem'}}>📈</div>
                                <div>
                                    <h3 className="gradient-text">Content Performance Summary</h3>
                                    <p style={{color: 'var(--prism-text-light)', margin: 0}}>Track how your content is performing</p>
                                </div>
                            </div>
                            
                            {content.length > 0 ? (
                                <div className="table-container">
                                    <table className="table-prism">
                                        <thead>
                                            <tr>
                                                <th>Content</th>
                                                <th>Views</th>
                                                <th>Likes</th>
                                                <th>Comments</th>
                                                <th>Engagement Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {content.map(item => (
                                                <tr key={item._id}>
                                                    <td>
                                                        <div style={{fontWeight: '600', color: 'var(--prism-text)'}}>{item.title}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)'}}>
                                                            <span>👁️</span>
                                                            <span style={{color: 'var(--prism-text-light)'}}>{item.views?.toLocaleString() || '0'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)'}}>
                                                            <span>❤️</span>
                                                            <span style={{color: 'var(--prism-text-light)'}}>{item.likes?.toLocaleString() || '0'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)'}}>
                                                            <span>💬</span>
                                                            <span style={{color: 'var(--prism-text-light)'}}>{item.comments?.toLocaleString() || '0'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: 'var(--prism-space-xs) var(--prism-space-sm)',
                                                            background: 'var(--prism-gradient-primary)',
                                                            borderRadius: 'var(--prism-radius)',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {item.views > 0 ? Math.round((item.likes / item.views) * 100) : 0}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{textAlign: 'center', padding: 'var(--prism-space-2xl)', color: 'var(--prism-text-light)'}}>
                                    <div style={{fontSize: '3rem', marginBottom: 'var(--prism-space-lg)'}}>📊</div>
                                    <p>No content available for analytics.</p>
                                    <p style={{fontSize: '0.9rem'}}>Create some content to see your performance metrics here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            
            function Monetization() {
                const [subscriptionTiers, setSubscriptionTiers] = useState([
                    { id: 1, name: 'Basic', price: 9.99, benefits: ['HD Content', 'Chat Access'], subscribers: 156 },
                    { id: 2, name: 'Premium', price: 19.99, benefits: ['4K Content', 'Exclusive Streams', 'Discord Access'], subscribers: 89 },
                    { id: 3, name: 'VIP', price: 49.99, benefits: ['All Premium', '1-on-1 Sessions', 'Custom Content'], subscribers: 23 }
                ]);
                const [bundles, setBundles] = useState([
                    { id: 1, name: 'Summer Special', items: ['3-month Premium', 'Exclusive Merch'], price: 49.99, discount: 20 },
                    { id: 2, name: 'Creator Pack', items: ['6-month VIP', 'Behind-the-scenes Access'], price: 199.99, discount: 30 }
                ]);
                const [revenueSettings, setRevenueSettings] = useState({
                    tipMinimum: 1.00,
                    tipSuggestions: [5, 10, 25, 50],
                    ppvPricing: { video: 4.99, photo: 1.99, livestream: 9.99 },
                    commissionsEnabled: true,
                    affiliateRate: 10
                });
                const [earnings, setEarnings] = useState({
                    thisMonth: 2847.50,
                    lastMonth: 2156.30,
                    subscriptions: 1890.45,
                    tips: 657.20,
                    ppv: 299.85
                });
                
                const addSubscriptionTier = () => {
                    const newTier = {
                        id: Date.now(),
                        name: 'New Tier',
                        price: 9.99,
                        benefits: ['New Benefit'],
                        subscribers: 0
                    };
                    setSubscriptionTiers(prev => [...prev, newTier]);
                };
                
                const updateTier = (tierId, field, value) => {
                    setSubscriptionTiers(prev => prev.map(tier => 
                        tier.id === tierId ? {...tier, [field]: value} : tier
                    ));
                };
                
                const deleteTier = (tierId) => {
                    if (confirm('Are you sure you want to delete this tier?')) {
                        setSubscriptionTiers(prev => prev.filter(tier => tier.id !== tierId));
                    }
                };
                
                return (
                    <div className="monetization-management">
                        <div className="page-header">
                            <div>
                                <h1 className="gradient-text">💰 Advanced Monetization</h1>
                                <p className="page-subtitle">Manage pricing, bundles, and revenue optimization</p>
                            </div>
                        </div>
                        
                        <div className="monetization-overview">
                            <div className="earnings-summary">
                                <h3>📊 Earnings Summary</h3>
                                <div className="earnings-grid">
                                    <div className="earning-card">
                                        <h4>This Month</h4>
                                        <p className="earning-amount">${earnings.thisMonth.toFixed(2)}</p>
                                        <span className="earning-change positive">
                                            +{(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="earning-card">
                                        <h4>Subscriptions</h4>
                                        <p className="earning-amount">${earnings.subscriptions.toFixed(2)}</p>
                                        <span className="earning-label">66% of total</span>
                                    </div>
                                    <div className="earning-card">
                                        <h4>Tips & Donations</h4>
                                        <p className="earning-amount">${earnings.tips.toFixed(2)}</p>
                                        <span className="earning-label">23% of total</span>
                                    </div>
                                    <div className="earning-card">
                                        <h4>Pay-per-view</h4>
                                        <p className="earning-amount">${earnings.ppv.toFixed(2)}</p>
                                        <span className="earning-label">11% of total</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="monetization-sections">
                            <div className="subscription-management">
                                <div className="section-header">
                                    <h3>🔄 Subscription Tiers</h3>
                                    <button onClick={addSubscriptionTier} className="btn-primary btn-sm">
                                        + Add Tier
                                    </button>
                                </div>
                                <div className="tiers-list">
                                    {subscriptionTiers.map(tier => (
                                        <div key={tier.id} className="tier-card">
                                            <div className="tier-header">
                                                <input
                                                    type="text"
                                                    value={tier.name}
                                                    onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                                                    className="tier-name-input"
                                                />
                                                <button 
                                                    onClick={() => deleteTier(tier.id)}
                                                    className="btn-danger btn-sm"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className="tier-pricing">
                                                <label>Price:</label>
                                                <div className="price-input">
                                                    <span>$</span>
                                                    <input
                                                        type="number"
                                                        value={tier.price}
                                                        onChange={(e) => updateTier(tier.id, 'price', parseFloat(e.target.value))}
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                    <span>/month</span>
                                                </div>
                                            </div>
                                            <div className="tier-benefits">
                                                <label>Benefits:</label>
                                                <div className="benefits-list">
                                                    {tier.benefits.map((benefit, index) => (
                                                        <div key={index} className="benefit-item">
                                                            <input
                                                                type="text"
                                                                value={benefit}
                                                                onChange={(e) => {
                                                                    const newBenefits = [...tier.benefits];
                                                                    newBenefits[index] = e.target.value;
                                                                    updateTier(tier.id, 'benefits', newBenefits);
                                                                }}
                                                                className="benefit-input"
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    const newBenefits = tier.benefits.filter((_, i) => i !== index);
                                                                    updateTier(tier.id, 'benefits', newBenefits);
                                                                }}
                                                                className="btn-danger btn-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button 
                                                        onClick={() => {
                                                            const newBenefits = [...tier.benefits, 'New Benefit'];
                                                            updateTier(tier.id, 'benefits', newBenefits);
                                                        }}
                                                        className="btn-secondary btn-xs"
                                                    >
                                                        + Add Benefit
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="tier-stats">
                                                <span className="subscriber-count">
                                                    {tier.subscribers} subscribers
                                                </span>
                                                <span className="monthly-revenue">
                                                    ${(tier.subscribers * tier.price).toFixed(2)}/month
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bundles-management">
                                <div className="section-header">
                                    <h3>📦 Bundle & Offers</h3>
                                    <button className="btn-primary btn-sm">+ Create Bundle</button>
                                </div>
                                <div className="bundles-list">
                                    {bundles.map(bundle => (
                                        <div key={bundle.id} className="bundle-card">
                                            <div className="bundle-info">
                                                <h4>{bundle.name}</h4>
                                                <p>Includes: {bundle.items.join(', ')}</p>
                                                <div className="bundle-pricing">
                                                    <span className="bundle-price">${bundle.price}</span>
                                                    <span className="bundle-discount">{bundle.discount}% OFF</span>
                                                </div>
                                            </div>
                                            <div className="bundle-actions">
                                                <button className="btn-secondary btn-sm">Edit</button>
                                                <button className="btn-danger btn-sm">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pricing-settings">
                                <h3>💎 Pay-per-view Pricing</h3>
                                <div className="ppv-settings">
                                    <div className="ppv-item">
                                        <label>Video Content:</label>
                                        <div className="price-input">
                                            <span>$</span>
                                            <input
                                                type="number"
                                                value={revenueSettings.ppvPricing.video}
                                                onChange={(e) => setRevenueSettings(prev => ({
                                                    ...prev,
                                                    ppvPricing: {...prev.ppvPricing, video: parseFloat(e.target.value)}
                                                }))}
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="ppv-item">
                                        <label>Photo Sets:</label>
                                        <div className="price-input">
                                            <span>$</span>
                                            <input
                                                type="number"
                                                value={revenueSettings.ppvPricing.photo}
                                                onChange={(e) => setRevenueSettings(prev => ({
                                                    ...prev,
                                                    ppvPricing: {...prev.ppvPricing, photo: parseFloat(e.target.value)}
                                                }))}
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="ppv-item">
                                        <label>Exclusive Livestream:</label>
                                        <div className="price-input">
                                            <span>$</span>
                                            <input
                                                type="number"
                                                value={revenueSettings.ppvPricing.livestream}
                                                onChange={(e) => setRevenueSettings(prev => ({
                                                    ...prev,
                                                    ppvPricing: {...prev.ppvPricing, livestream: parseFloat(e.target.value)}
                                                }))}
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="tip-settings">
                                <h3>💝 Tip Configuration</h3>
                                <div className="tip-config">
                                    <div className="form-group">
                                        <label>Minimum Tip Amount:</label>
                                        <div className="price-input">
                                            <span>$</span>
                                            <input
                                                type="number"
                                                value={revenueSettings.tipMinimum}
                                                onChange={(e) => setRevenueSettings(prev => ({
                                                    ...prev,
                                                    tipMinimum: parseFloat(e.target.value)
                                                }))}
                                                step="0.01"
                                                min="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Suggested Amounts:</label>
                                        <div className="tip-suggestions">
                                            {revenueSettings.tipSuggestions.map((amount, index) => (
                                                <div key={index} className="tip-suggestion">
                                                    <span>$</span>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => {
                                                            const newSuggestions = [...revenueSettings.tipSuggestions];
                                                            newSuggestions[index] = parseInt(e.target.value);
                                                            setRevenueSettings(prev => ({
                                                                ...prev,
                                                                tipSuggestions: newSuggestions
                                                            }));
                                                        }}
                                                        min="1"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="advanced-settings">
                                <h3>⚙️ Advanced Settings</h3>
                                <div className="settings-options">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={revenueSettings.commissionsEnabled}
                                            onChange={(e) => setRevenueSettings(prev => ({
                                                ...prev,
                                                commissionsEnabled: e.target.checked
                                            }))}
                                        />
                                        <span>Enable Affiliate Commissions</span>
                                    </label>
                                    {revenueSettings.commissionsEnabled && (
                                        <div className="affiliate-rate">
                                            <label>Affiliate Commission Rate:</label>
                                            <div className="rate-input">
                                                <input
                                                    type="number"
                                                    value={revenueSettings.affiliateRate}
                                                    onChange={(e) => setRevenueSettings(prev => ({
                                                        ...prev,
                                                        affiliateRate: parseInt(e.target.value)
                                                    }))}
                                                    min="1"
                                                    max="50"
                                                />
                                                <span>%</span>
                                            </div>
                                        </div>
                                    )}
                                    <label className="checkbox-label">
                                        <input type="checkbox" />
                                        <span>Auto-apply promotional pricing</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" />
                                        <span>Send pricing update notifications</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                                    <span>⚙️</span>
                                    Configure Revenue Streams
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <div style={{fontSize: '2.5rem'}}>📊</div>
                                    <div>
                                        <h3 className="gradient-text">Earnings Overview</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Track your revenue and payouts</p>
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-lg)', marginBottom: 'var(--prism-space-xl)'}}>
                                    <div style={{padding: 'var(--prism-space-lg)', background: 'var(--prism-gradient-primary)', borderRadius: 'var(--prism-radius)', color: 'white', textAlign: 'center'}}>
                                        <div style={{fontSize: '0.9rem', marginBottom: 'var(--prism-space-sm)', opacity: 0.8}}>This Month</div>
                                        <div style={{fontSize: '2rem', fontWeight: '700'}}>$0.00</div>
                                    </div>
                                    
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--prism-space-md)'}}>
                                        <div style={{padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)', textAlign: 'center'}}>
                                            <div style={{fontSize: '0.8rem', color: 'var(--prism-text-light)', marginBottom: 'var(--prism-space-xs)'}}>Pending</div>
                                            <div style={{fontSize: '1.2rem', fontWeight: '600', color: 'var(--prism-text)'}}>$0.00</div>
                                        </div>
                                        
                                        <div style={{padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)', textAlign: 'center'}}>
                                            <div style={{fontSize: '0.8rem', color: 'var(--prism-text-light)', marginBottom: 'var(--prism-space-xs)'}}>Lifetime</div>
                                            <div style={{fontSize: '1.2rem', fontWeight: '600', color: 'var(--prism-text)'}}>$0.00</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <div style={{fontSize: '0.9rem', color: 'var(--prism-text-light)', marginBottom: 'var(--prism-space-sm)'}}>Growth</div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)'}}>
                                            <span style={{color: '#10b981'}}>📈</span>
                                            <span style={{fontWeight: '600', color: '#10b981'}}>+0% from last month</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="btn-prism btn-prism-glass" style={{width: '100%'}}>
                                    <span>📋</span>
                                    View Detailed Reports
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function Streaming() {
                const [isStreaming, setIsStreaming] = useState(false);
                const [streamData, setStreamData] = useState({
                    title: '',
                    description: '',
                    category: 'general'
                });
                const [viewerCount, setViewerCount] = useState(0);
                const [chatMessages, setChatMessages] = useState([]);
                const [streamQuality, setStreamQuality] = useState('720p');
                
                const handleStartStream = async () => {
                    if (!streamData.title) {
                        alert('Please enter a stream title');
                        return;
                    }
                    
                    try {
                        const response = await fetch(API_BASE + '/streams', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify(streamData)
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            setIsStreaming(true);
                            // TODO: Initialize WebRTC connection
                            console.log('Stream started:', result.data);
                        }
                    } catch (error) {
                        console.error('Stream start error:', error);
                        alert('Failed to start stream');
                    }
                };
                
                const handleEndStream = () => {
                    setIsStreaming(false);
                    setViewerCount(0);
                    setChatMessages([]);
                    // TODO: End WebRTC connection
                    console.log('Stream ended');
                };
                
                return (
                    <div className="animate-in">
                        <div className="page-header">
                            <div>
                                <h1 className="gradient-text">Live Streaming</h1>
                                <p className="page-subtitle">Set up and manage your live streams with WebRTC technology</p>
                            </div>
                        </div>
                        
                        {!isStreaming ? (
                            <div className="card">
                                <h3>🎙️ Start New Stream</h3>
                                
                                <div className="form-group">
                                    <label>Stream Title</label>
                                    <input 
                                        type="text" 
                                        value={streamData.title}
                                        onChange={(e) => setStreamData({...streamData, title: e.target.value})}
                                        placeholder="Enter your stream title"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        value={streamData.description}
                                        onChange={(e) => setStreamData({...streamData, description: e.target.value})}
                                        placeholder="Describe what you'll be streaming"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Category</label>
                                    <select 
                                        value={streamData.category}
                                        onChange={(e) => setStreamData({...streamData, category: e.target.value})}
                                    >
                                        <option value="general">General</option>
                                        <option value="gaming">Gaming</option>
                                        <option value="music">Music</option>
                                        <option value="education">Education</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="technology">Technology</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Stream Quality</label>
                                    <select 
                                        value={streamQuality}
                                        onChange={(e) => setStreamQuality(e.target.value)}
                                    >
                                        <option value="480p">480p (Low bandwidth)</option>
                                        <option value="720p">720p (Recommended)</option>
                                        <option value="1080p">1080p (High quality)</option>
                                    </select>
                                </div>
                                
                                <div style={{marginTop: '1rem'}}>
                                    <button className="btn btn-success" onClick={handleStartStream}>
                                        🔴 Go Live
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="card" style={{background: 'linear-gradient(135deg, #ff4757, #ff3742)', color: 'white'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div>
                                            <h3>🔴 LIVE: {streamData.title}</h3>
                                            <p>👀 {viewerCount} viewers watching</p>
                                        </div>
                                        <button 
                                            className="btn" 
                                            onClick={handleEndStream}
                                            style={{background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)'}}
                                        >
                                            ⏹️ End Stream
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '1rem'}}>
                                    <div className="card">
                                        <h3>📺 Stream Preview</h3>
                                        <div style={{
                                            background: '#000',
                                            aspectRatio: '16/9',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <div style={{textAlign: 'center'}}>
                                                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📹</div>
                                                <div>Camera feed will appear here</div>
                                                <div style={{fontSize: '0.9rem', opacity: 0.7}}>WebRTC Stream @ {streamQuality}</div>
                                            </div>
                                        </div>
                                        
                                        <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                            <button className="btn" style={{fontSize: '0.9rem'}}>🎥 Toggle Camera</button>
                                            <button className="btn" style={{fontSize: '0.9rem'}}>🎙️ Toggle Mic</button>
                                            <button className="btn" style={{fontSize: '0.9rem'}}>🖥️ Share Screen</button>
                                            <button className="btn" style={{fontSize: '0.9rem'}}>⚙️ Settings</button>
                                        </div>
                                    </div>
                                    
                                    <div className="card">
                                        <h3>� Live Chat</h3>
                                        <div style={{
                                            height: '300px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            padding: '0.5rem',
                                            overflow: 'auto',
                                            background: '#f9f9f9'
                                        }}>
                                            {chatMessages.length === 0 ? (
                                                <div style={{textAlign: 'center', color: '#666', padding: '2rem'}}>
                                                    No messages yet. Chat will appear here when viewers join.
                                                </div>
                                            ) : (
                                                chatMessages.map((msg, index) => (
                                                    <div key={index} style={{marginBottom: '0.5rem'}}>
                                                        <strong>{msg.username}:</strong> {msg.message}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        
                                        <div style={{marginTop: '1rem'}}>
                                            <input 
                                                type="text" 
                                                placeholder="Send a message..." 
                                                style={{width: '100%', padding: '0.5rem'}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="feature-grid" style={{marginTop: '2rem'}}>
                            <div className="card">
                                <h3>📡 WebRTC Features</h3>
                                <ul>
                                    <li>✅ Real-time video streaming</li>
                                    <li>✅ Low-latency communication</li>
                                    <li>✅ Adaptive quality settings</li>
                                    <li>✅ Interactive chat</li>
                                    <li>🔄 Recording capabilities</li>
                                </ul>
                            </div>
                            
                            <div className="card">
                                <h3>📊 Stream Analytics</h3>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center'}}>
                                    <div>
                                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#007bff'}}>{viewerCount}</div>
                                        <div style={{fontSize: '0.9rem', color: '#666'}}>Live Viewers</div>
                                    </div>
                                    <div>
                                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>{streamQuality}</div>
                                        <div style={{fontSize: '0.9rem', color: '#666'}}>Quality</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function MobileCompanion() {
                const [mobileFeatures, setMobileFeatures] = useState({
                    pushNotifications: true,
                    streamAlerts: true,
                    chatModeration: false,
                    quickPost: true,
                    analytics: false
                });
                const [qrCode, setQrCode] = useState('https://mobile.prism.app/connect/abc123');
                const [connectedDevices, setConnectedDevices] = useState([
                    { id: 1, name: 'iPhone 14 Pro', type: 'iOS', lastSeen: '2 minutes ago', status: 'online' },
                    { id: 2, name: 'Galaxy S23', type: 'Android', lastSeen: '1 hour ago', status: 'offline' }
                ]);
                
                const toggleFeature = (feature) => {
                    setMobileFeatures(prev => ({
                        ...prev,
                        [feature]: !prev[feature]
                    }));
                };
                
                return (
                    <div className="mobile-companion">
                        <div className="page-header">
                            <div>
                                <h1 className="gradient-text">📱 Mobile Companion</h1>
                                <p className="page-subtitle">Manage your content on-the-go with mobile app integration</p>
                            </div>
                        </div>
                        
                        <div className="mobile-sections">
                            <div className="app-connection">
                                <div className="section-header">
                                    <h3>📲 Connect Mobile App</h3>
                                    <span className="status-badge connected">2 devices connected</span>
                                </div>
                                
                                <div className="connection-methods">
                                    <div className="qr-connection">
                                        <h4>Scan QR Code</h4>
                                        <div className="qr-code-display">
                                            <div className="qr-placeholder">
                                                <div className="qr-pattern"></div>
                                                <p>📱 Scan with PRISM Mobile App</p>
                                            </div>
                                        </div>
                                        <p className="qr-instruction">
                                            Download the PRISM Creator Mobile app and scan this code to connect
                                        </p>
                                    </div>
                                    
                                    <div className="manual-connection">
                                        <h4>Manual Connection</h4>
                                        <div className="connection-code">
                                            <label>Connection Code:</label>
                                            <div className="code-input">
                                                <input type="text" value="CR-ABC123" readonly />
                                                <button className="btn-secondary btn-sm">Copy</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="connected-devices">
                                <h3>📱 Connected Devices</h3>
                                <div className="devices-list">
                                    {connectedDevices.map(device => (
                                        <div key={device.id} className="device-card">
                                            <div className="device-info">
                                                <div className="device-icon">
                                                    {device.type === 'iOS' ? '📱' : '📲'}
                                                </div>
                                                <div className="device-details">
                                                    <h4>{device.name}</h4>
                                                    <p>{device.type} • Last seen: {device.lastSeen}</p>
                                                </div>
                                            </div>
                                            <div className="device-status">
                                                <span className={'status-indicator ' + device.status}></span>
                                                <span className="status-text">{device.status}</span>
                                                <button className="btn-danger btn-sm">Disconnect</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mobile-features">
                                <h3>⚡ Mobile Features</h3>
                                <div className="features-grid">
                                    <div className="feature-card">
                                        <div className="feature-header">
                                            <div className="feature-icon">🔔</div>
                                            <div className="feature-info">
                                                <h4>Push Notifications</h4>
                                                <p>Receive alerts for new followers, messages, and earnings</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={mobileFeatures.pushNotifications}
                                                    onChange={() => toggleFeature('pushNotifications')}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-card">
                                        <div className="feature-header">
                                            <div className="feature-icon">🚨</div>
                                            <div className="feature-info">
                                                <h4>Stream Alerts</h4>
                                                <p>Get notified when your streams start, end, or encounter issues</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={mobileFeatures.streamAlerts}
                                                    onChange={() => toggleFeature('streamAlerts')}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-card">
                                        <div className="feature-header">
                                            <div className="feature-icon">🛡️</div>
                                            <div className="feature-info">
                                                <h4>Chat Moderation</h4>
                                                <p>Moderate chat messages and manage community from mobile</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={mobileFeatures.chatModeration}
                                                    onChange={() => toggleFeature('chatModeration')}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-card">
                                        <div className="feature-header">
                                            <div className="feature-icon">⚡</div>
                                            <div className="feature-info">
                                                <h4>Quick Post</h4>
                                                <p>Share updates, photos, and videos instantly from mobile</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={mobileFeatures.quickPost}
                                                    onChange={() => toggleFeature('quickPost')}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="feature-card">
                                        <div className="feature-header">
                                            <div className="feature-icon">📊</div>
                                            <div className="feature-info">
                                                <h4>Mobile Analytics</h4>
                                                <p>View performance metrics and earnings on your phone</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={mobileFeatures.analytics}
                                                    onChange={() => toggleFeature('analytics')}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mobile-streaming">
                                <h3>📹 Mobile Streaming</h3>
                                <div className="streaming-options">
                                    <div className="streaming-card">
                                        <div className="streaming-icon">📱</div>
                                        <div className="streaming-info">
                                            <h4>Phone Camera Streaming</h4>
                                            <p>Stream directly from your phone's camera with high quality</p>
                                            <div className="streaming-features">
                                                <span className="feature-tag">1080p HD</span>
                                                <span className="feature-tag">Auto-focus</span>
                                                <span className="feature-tag">Stabilization</span>
                                            </div>
                                        </div>
                                        <button className="btn-primary btn-sm">Configure</button>
                                    </div>
                                    
                                    <div className="streaming-card">
                                        <div className="streaming-icon">🎤</div>
                                        <div className="streaming-info">
                                            <h4>Audio Streaming</h4>
                                            <p>Host audio-only streams and podcasts from mobile</p>
                                            <div className="streaming-features">
                                                <span className="feature-tag">Noise Reduction</span>
                                                <span className="feature-tag">Echo Cancellation</span>
                                                <span className="feature-tag">Auto-levels</span>
                                            </div>
                                        </div>
                                        <button className="btn-primary btn-sm">Configure</button>
                                    </div>
                                    
                                    <div className="streaming-card">
                                        <div className="streaming-icon">📺</div>
                                        <div className="streaming-info">
                                            <h4>Screen Recording</h4>
                                            <p>Record and stream your mobile screen for tutorials</p>
                                            <div className="streaming-features">
                                                <span className="feature-tag">HD Recording</span>
                                                <span className="feature-tag">Touch Indicators</span>
                                                <span className="feature-tag">Voice-over</span>
                                            </div>
                                        </div>
                                        <button className="btn-primary btn-sm">Configure</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="remote-control">
                                <h3>🎛️ Remote Control</h3>
                                <p>Control your desktop streaming setup from your mobile device</p>
                                <div className="remote-features">
                                    <div className="remote-section">
                                        <h4>Stream Controls</h4>
                                        <div className="control-buttons">
                                            <button className="control-btn start">▶️ Start Stream</button>
                                            <button className="control-btn pause">⏸️ Pause</button>
                                            <button className="control-btn stop">⏹️ Stop</button>
                                        </div>
                                    </div>
                                    
                                    <div className="remote-section">
                                        <h4>Scene Switching</h4>
                                        <div className="scene-buttons">
                                            <button className="scene-btn active">🎬 Main Scene</button>
                                            <button className="scene-btn">💬 Chat Scene</button>
                                            <button className="scene-btn">🎮 Gaming Scene</button>
                                            <button className="scene-btn">📱 Mobile Scene</button>
                                        </div>
                                    </div>
                                    
                                    <div className="remote-section">
                                        <h4>Audio Controls</h4>
                                        <div className="audio-controls">
                                            <div className="volume-control">
                                                <label>Microphone:</label>
                                                <input type="range" min="0" max="100" defaultValue="75" />
                                                <span>75%</span>
                                            </div>
                                            <div className="volume-control">
                                                <label>Desktop Audio:</label>
                                                <input type="range" min="0" max="100" defaultValue="60" />
                                                <span>60%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            function Community() {
                return (
                    <div className="animate-in">
                        <div className="page-header">
                            <div>
                                <h1 className="gradient-text">Community</h1>
                                <p className="page-subtitle">Engage with your audience and manage your community</p>
                            </div>
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--prism-space-xl)'}}>
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>💬</span>
                                    <div>
                                        <h3 className="gradient-text">Messages</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Direct messages from fans</p>
                                    </div>
                                </div>
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>📬</span>
                                    View Messages
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>�</span>
                                    <div>
                                        <h3 className="gradient-text">Comments</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Moderate and respond to comments</p>
                                    </div>
                                </div>
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>🛡️</span>
                                    Manage Comments
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>👥</span>
                                    <div>
                                        <h3 className="gradient-text">Subscribers</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>View and manage your subscriber base</p>
                                    </div>
                                </div>
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>📊</span>
                                    View Subscribers
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>📢</span>
                                    <div>
                                        <h3 className="gradient-text">Announcements</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Post updates to your community</p>
                                    </div>
                                </div>
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>✨</span>
                                    Create Post
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function Settings({ user }) {
                return (
                    <div className="animate-in">
                        <div className="page-header">
                            <div>
                                <h1 className="gradient-text">Settings</h1>
                                <p className="page-subtitle">Manage your creator profile and preferences</p>
                            </div>
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--prism-space-xl)'}}>
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>👤</span>
                                    <div>
                                        <h3 className="gradient-text">Profile Settings</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Update your creator profile</p>
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-xl)'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span style={{color: 'var(--prism-text-light)'}}>Display name:</span>
                                        <span style={{fontWeight: '600', color: 'var(--prism-text)'}}>{user?.profile?.displayName || 'Not set'}</span>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span style={{color: 'var(--prism-text-light)'}}>Bio:</span>
                                        <span style={{fontWeight: '600', color: 'var(--prism-text)'}}>{user?.profile?.bio || 'Not set'}</span>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span style={{color: 'var(--prism-text-light)'}}>Avatar:</span>
                                        <span style={{fontWeight: '600', color: 'var(--prism-text)'}}>{user?.profile?.avatar ? 'Set' : 'Not set'}</span>
                                    </div>
                                </div>
                                
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>✏️</span>
                                    Edit Profile
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>🔐</span>
                                    <div>
                                        <h3 className="gradient-text">Privacy & Security</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Manage your account security</p>
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)', marginBottom: 'var(--prism-space-xl)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>🔑</span>
                                        <span>Change password</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>🛡️</span>
                                        <span>Two-factor authentication</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📱</span>
                                        <span>Login sessions</span>
                                    </div>
                                </div>
                                
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>⚙️</span>
                                    Security Settings
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>🔔</span>
                                    <div>
                                        <h3 className="gradient-text">Notifications</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Configure notification preferences</p>
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)', marginBottom: 'var(--prism-space-xl)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📧</span>
                                        <span>Email notifications</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📲</span>
                                        <span>Push notifications</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📱</span>
                                        <span>SMS alerts</span>
                                    </div>
                                </div>
                                
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>🔔</span>
                                    Notification Settings
                                </button>
                            </div>
                            
                            <div className="card-creator">
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)', marginBottom: 'var(--prism-space-lg)'}}>
                                    <span style={{fontSize: '2rem'}}>🔌</span>
                                    <div>
                                        <h3 className="gradient-text">Integrations</h3>
                                        <p style={{color: 'var(--prism-text-light)', margin: 0}}>Connect external services</p>
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)', marginBottom: 'var(--prism-space-xl)'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>🌐</span>
                                        <span>Social media accounts</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>💳</span>
                                        <span>Payment processors</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--prism-space-sm)', padding: 'var(--prism-space-md)', background: 'var(--prism-bg-glass)', borderRadius: 'var(--prism-radius)', border: '1px solid var(--prism-border)'}}>
                                        <span>📊</span>
                                        <span>Analytics tools</span>
                                    </div>
                                </div>
                                
                                <button className="btn-prism btn-prism-primary" style={{width: '100%'}}>
                                    <span>🔗</span>
                                    Manage Integrations
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Multi-Platform Streaming Component
            function MultiPlatformStreaming() {
                const [platforms, setPlatforms] = useState([
                    { id: 'prism', name: 'PRISM', enabled: true, status: 'connected', viewers: 0, streamKey: '' },
                    { id: 'twitch', name: 'Twitch', enabled: false, status: 'disconnected', viewers: 0, streamKey: '' },
                    { id: 'youtube', name: 'YouTube Live', enabled: false, status: 'disconnected', viewers: 0, streamKey: '' },
                    { id: 'facebook', name: 'Facebook Live', enabled: false, status: 'disconnected', viewers: 0, streamKey: '' },
                    { id: 'tiktok', name: 'TikTok Live', enabled: false, status: 'disconnected', viewers: 0, streamKey: '' }
                ]);
                const [isStreaming, setIsStreaming] = useState(false);
                const [streamTitle, setStreamTitle] = useState('');
                const [streamDescription, setStreamDescription] = useState('');
                const [scheduledStream, setScheduledStream] = useState('');
                const [multiStreamSettings, setMultiStreamSettings] = useState({
                    autoStart: false,
                    syncTitles: true,
                    adaptiveQuality: true,
                    recordLocally: true
                });
                
                const handlePlatformToggle = (platformId) => {
                    setPlatforms(prev => prev.map(p => 
                        p.id === platformId ? {...p, enabled: !p.enabled} : p
                    ));
                };
                
                const handleStreamKeyUpdate = (platformId, streamKey) => {
                    setPlatforms(prev => prev.map(p => 
                        p.id === platformId ? {...p, streamKey} : p
                    ));
                };
                
                const connectPlatform = async (platformId) => {
                    try {
                        setPlatforms(prev => prev.map(p => 
                            p.id === platformId ? {...p, status: 'connected'} : p
                        ));
                        alert('Platform connected successfully!');
                    } catch (error) {
                        alert('Failed to connect platform');
                    }
                };
                
                const startMultiStream = async () => {
                    const enabledPlatforms = platforms.filter(p => p.enabled && p.status === 'connected');
                    if (enabledPlatforms.length === 0) {
                        alert('Please connect at least one platform to start streaming');
                        return;
                    }
                    
                    setIsStreaming(true);
                    const interval = setInterval(() => {
                        setPlatforms(prev => prev.map(p => 
                            p.enabled ? {...p, viewers: p.viewers + Math.floor(Math.random() * 5)} : p
                        ));
                    }, 3000);
                    
                    return () => clearInterval(interval);
                };
                
                const stopMultiStream = () => {
                    setIsStreaming(false);
                    setPlatforms(prev => prev.map(p => ({...p, viewers: 0})));
                };
                
                return (
                    <div className="multi-platform-streaming">
                        <div className="section-header">
                            <h2>🌐 Multi-Platform Streaming</h2>
                            <p>Stream to multiple platforms simultaneously</p>
                        </div>
                        
                        <div className="stream-controls">
                            <div className="stream-config">
                                <h3>Stream Configuration</h3>
                                <div className="form-group">
                                    <label>Stream Title:</label>
                                    <input
                                        type="text"
                                        value={streamTitle}
                                        onChange={(e) => setStreamTitle(e.target.value)}
                                        placeholder="Enter your stream title..."
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea
                                        value={streamDescription}
                                        onChange={(e) => setStreamDescription(e.target.value)}
                                        placeholder="Describe your stream..."
                                        className="input-field"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Schedule Stream:</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledStream}
                                        onChange={(e) => setScheduledStream(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            
                            <div className="stream-settings">
                                <h3>Multi-Stream Settings</h3>
                                <div className="settings-grid">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={multiStreamSettings.autoStart}
                                            onChange={(e) => setMultiStreamSettings(prev => ({
                                                ...prev, autoStart: e.target.checked
                                            }))}
                                        />
                                        <span>Auto-start all platforms</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={multiStreamSettings.syncTitles}
                                            onChange={(e) => setMultiStreamSettings(prev => ({
                                                ...prev, syncTitles: e.target.checked
                                            }))}
                                        />
                                        <span>Sync titles across platforms</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={multiStreamSettings.adaptiveQuality}
                                            onChange={(e) => setMultiStreamSettings(prev => ({
                                                ...prev, adaptiveQuality: e.target.checked
                                            }))}
                                        />
                                        <span>Adaptive quality per platform</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={multiStreamSettings.recordLocally}
                                            onChange={(e) => setMultiStreamSettings(prev => ({
                                                ...prev, recordLocally: e.target.checked
                                            }))}
                                        />
                                        <span>Record locally</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="platforms-grid">
                            {platforms.map(platform => (
                                <div key={platform.id} className={'platform-card ' + (platform.enabled ? 'enabled' : 'disabled')}>
                                    <div className="platform-header">
                                        <div className="platform-info">
                                            <h4>{platform.name}</h4>
                                            <span className={'status-badge ' + platform.status}>
                                                {platform.status}
                                            </span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={platform.enabled}
                                                onChange={() => handlePlatformToggle(platform.id)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    
                                    {platform.enabled && (
                                        <div className="platform-config">
                                            <div className="form-group">
                                                <label>Stream Key:</label>
                                                <div className="stream-key-input">
                                                    <input
                                                        type="password"
                                                        value={platform.streamKey}
                                                        onChange={(e) => handleStreamKeyUpdate(platform.id, e.target.value)}
                                                        placeholder="Enter stream key..."
                                                        className="input-field"
                                                    />
                                                    <button 
                                                        onClick={() => connectPlatform(platform.id)}
                                                        disabled={platform.status === 'connected'}
                                                        className="btn-secondary btn-sm"
                                                    >
                                                        {platform.status === 'connected' ? 'Connected' : 'Connect'}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {isStreaming && platform.status === 'connected' && (
                                                <div className="live-stats">
                                                    <div className="stat">
                                                        <span className="stat-label">Viewers:</span>
                                                        <span className="stat-value">{platform.viewers}</span>
                                                    </div>
                                                    <div className="live-indicator">🔴 LIVE</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="stream-actions">
                            {!isStreaming ? (
                                <button 
                                    onClick={startMultiStream}
                                    disabled={!streamTitle.trim()}
                                    className="btn-primary btn-large"
                                >
                                    🚀 Start Multi-Platform Stream
                                </button>
                            ) : (
                                <button 
                                    onClick={stopMultiStream}
                                    className="btn-danger btn-large"
                                >
                                    ⏹️ Stop Stream
                                </button>
                            )}
                        </div>
                    </div>
                );
            }
            
            // Advanced Streaming Tools Component
            function AdvancedStreamingTools() {
                const [scenes, setScenes] = useState([
                    { id: 1, name: 'Main Camera', active: true, sources: ['Camera 1', 'Desktop Audio'] },
                    { id: 2, name: 'Screen Share', active: false, sources: ['Screen Capture', 'Microphone'] },
                    { id: 3, name: 'Be Right Back', active: false, sources: ['BRB Image', 'Background Music'] }
                ]);
                const [overlays, setOverlays] = useState([
                    { id: 1, name: 'Chat Overlay', visible: true, position: 'bottom-right' },
                    { id: 2, name: 'Donation Alert', visible: true, position: 'top-center' },
                    { id: 3, name: 'Follower Count', visible: false, position: 'top-left' }
                ]);
                const [cameras, setCameras] = useState([
                    { id: 'cam1', name: 'Main Camera', active: true, settings: { brightness: 50, contrast: 50, saturation: 50 } },
                    { id: 'cam2', name: 'Secondary Camera', active: false, settings: { brightness: 45, contrast: 55, saturation: 48 } }
                ]);
                const [audioSources, setAudioSources] = useState([
                    { id: 'mic1', name: 'Main Microphone', active: true, volume: 75, muted: false },
                    { id: 'desktop', name: 'Desktop Audio', active: true, volume: 30, muted: false },
                    { id: 'music', name: 'Background Music', active: false, volume: 20, muted: false }
                ]);
                
                const switchScene = (sceneId) => {
                    setScenes(prev => prev.map(s => ({...s, active: s.id === sceneId})));
                };
                
                const toggleOverlay = (overlayId) => {
                    setOverlays(prev => prev.map(o => 
                        o.id === overlayId ? {...o, visible: !o.visible} : o
                    ));
                };
                
                const updateCameraSetting = (cameraId, setting, value) => {
                    setCameras(prev => prev.map(c => 
                        c.id === cameraId ? {
                            ...c, 
                            settings: {...c.settings, [setting]: value}
                        } : c
                    ));
                };
                
                const toggleAudioSource = (sourceId) => {
                    setAudioSources(prev => prev.map(s => 
                        s.id === sourceId ? {...s, muted: !s.muted} : s
                    ));
                };
                
                return (
                    <div className="advanced-streaming-tools">
                        <div className="section-header">
                            <h2>🎬 Advanced Streaming Tools</h2>
                            <p>Professional streaming control and configuration</p>
                        </div>
                        
                        <div className="streaming-controls-grid">
                            <div className="scenes-panel">
                                <h3>🎭 Scene Management</h3>
                                <div className="scenes-list">
                                    {scenes.map(scene => (
                                        <div key={scene.id} className={'scene-item ' + (scene.active ? 'active' : '')}>
                                            <div className="scene-info">
                                                <h4>{scene.name}</h4>
                                                <p>{scene.sources.join(', ')}</p>
                                            </div>
                                            <button 
                                                onClick={() => switchScene(scene.id)}
                                                className={scene.active ? 'btn-success btn-sm' : 'btn-secondary btn-sm'}
                                            >
                                                {scene.active ? 'LIVE' : 'Switch'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-primary btn-sm">+ Add Scene</button>
                            </div>
                            
                            <div className="overlays-panel">
                                <h3>🎨 Overlay Management</h3>
                                <div className="overlays-list">
                                    {overlays.map(overlay => (
                                        <div key={overlay.id} className="overlay-item">
                                            <div className="overlay-info">
                                                <h4>{overlay.name}</h4>
                                                <p>Position: {overlay.position}</p>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={overlay.visible}
                                                    onChange={() => toggleOverlay(overlay.id)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-primary btn-sm">+ Add Overlay</button>
                            </div>
                            
                            <div className="camera-controls">
                                <h3>📹 Camera Control</h3>
                                {cameras.map(camera => (
                                    <div key={camera.id} className="camera-panel">
                                        <div className="camera-header">
                                            <h4>{camera.name}</h4>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={camera.active}
                                                    onChange={() => setCameras(prev => prev.map(c => 
                                                        c.id === camera.id ? {...c, active: !c.active} : c
                                                    ))}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        {camera.active && (
                                            <div className="camera-settings">
                                                <div className="setting-row">
                                                    <label>Brightness:</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={camera.settings.brightness}
                                                        onChange={(e) => updateCameraSetting(camera.id, 'brightness', e.target.value)}
                                                    />
                                                    <span>{camera.settings.brightness}%</span>
                                                </div>
                                                <div className="setting-row">
                                                    <label>Contrast:</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={camera.settings.contrast}
                                                        onChange={(e) => updateCameraSetting(camera.id, 'contrast', e.target.value)}
                                                    />
                                                    <span>{camera.settings.contrast}%</span>
                                                </div>
                                                <div className="setting-row">
                                                    <label>Saturation:</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={camera.settings.saturation}
                                                        onChange={(e) => updateCameraSetting(camera.id, 'saturation', e.target.value)}
                                                    />
                                                    <span>{camera.settings.saturation}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="audio-mixer">
                                <h3>🎵 Audio Mixer</h3>
                                <div className="audio-sources">
                                    {audioSources.map(source => (
                                        <div key={source.id} className="audio-source">
                                            <div className="source-header">
                                                <h4>{source.name}</h4>
                                                <button 
                                                    onClick={() => toggleAudioSource(source.id)}
                                                    className={source.muted ? 'btn-danger btn-sm' : 'btn-success btn-sm'}
                                                >
                                                    {source.muted ? '🔇' : '🔊'}
                                                </button>
                                            </div>
                                            <div className="volume-control">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={source.volume}
                                                    onChange={(e) => setAudioSources(prev => prev.map(s => 
                                                        s.id === source.id ? {...s, volume: e.target.value} : s
                                                    ))}
                                                    disabled={source.muted}
                                                />
                                                <span>{source.volume}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Content Planning & Scheduling Component
            function ContentPlanning() {
                const [scheduledContent, setScheduledContent] = useState([
                    { id: 1, title: 'Morning Stream', type: 'stream', date: '2025-07-24T10:00', status: 'scheduled' },
                    { id: 2, title: 'Tutorial Video', type: 'video', date: '2025-07-25T14:00', status: 'draft' },
                    { id: 3, title: 'Q&A Session', type: 'stream', date: '2025-07-26T19:00', status: 'scheduled' }
                ]);
                const [calendar, setCalendar] = useState('month');
                const [newContent, setNewContent] = useState({
                    title: '',
                    type: 'stream',
                    date: '',
                    description: '',
                    tags: '',
                    duration: 60
                });
                
                const addScheduledContent = () => {
                    if (!newContent.title || !newContent.date) {
                        alert('Please fill in title and date');
                        return;
                    }
                    
                    const content = {
                        id: Date.now(),
                        ...newContent,
                        status: 'scheduled',
                        tags: newContent.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                    };
                    
                    setScheduledContent(prev => [...prev, content]);
                    setNewContent({
                        title: '',
                        type: 'stream',
                        date: '',
                        description: '',
                        tags: '',
                        duration: 60
                    });
                };
                
                const removeScheduledContent = (id) => {
                    setScheduledContent(prev => prev.filter(c => c.id !== id));
                };
                
                return (
                    <div className="content-planning">
                        <div className="section-header">
                            <h2>📅 Content Planning & Scheduling</h2>
                            <p>Plan and schedule your content releases</p>
                        </div>
                        
                        <div className="planning-layout">
                            <div className="schedule-form">
                                <h3>Schedule New Content</h3>
                                <div className="form-group">
                                    <label>Content Title:</label>
                                    <input
                                        type="text"
                                        value={newContent.title}
                                        onChange={(e) => setNewContent(prev => ({...prev, title: e.target.value}))}
                                        placeholder="Enter content title..."
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Content Type:</label>
                                    <select
                                        value={newContent.type}
                                        onChange={(e) => setNewContent(prev => ({...prev, type: e.target.value}))}
                                        className="input-field"
                                    >
                                        <option value="stream">Live Stream</option>
                                        <option value="video">Video Upload</option>
                                        <option value="post">Text Post</option>
                                        <option value="image">Image Post</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Date & Time:</label>
                                    <input
                                        type="datetime-local"
                                        value={newContent.date}
                                        onChange={(e) => setNewContent(prev => ({...prev, date: e.target.value}))}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea
                                        value={newContent.description}
                                        onChange={(e) => setNewContent(prev => ({...prev, description: e.target.value}))}
                                        placeholder="Describe your content..."
                                        className="input-field"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tags (comma separated):</label>
                                    <input
                                        type="text"
                                        value={newContent.tags}
                                        onChange={(e) => setNewContent(prev => ({...prev, tags: e.target.value}))}
                                        placeholder="tag1, tag2, tag3..."
                                        className="input-field"
                                    />
                                </div>
                                {newContent.type === 'stream' && (
                                    <div className="form-group">
                                        <label>Expected Duration (minutes):</label>
                                        <input
                                            type="number"
                                            value={newContent.duration}
                                            onChange={(e) => setNewContent(prev => ({...prev, duration: parseInt(e.target.value)}))}
                                            min="15"
                                            max="480"
                                            className="input-field"
                                        />
                                    </div>
                                )}
                                <button onClick={addScheduledContent} className="btn-primary">
                                    📅 Schedule Content
                                </button>
                            </div>
                            
                            <div className="scheduled-content-list">
                                <h3>Scheduled Content</h3>
                                <div className="content-items">
                                    {scheduledContent.map(content => (
                                        <div key={content.id} className="scheduled-item">
                                            <div className="content-info">
                                                <h4>{content.title}</h4>
                                                <p className="content-meta">
                                                    {content.type} • {new Date(content.date).toLocaleString()}
                                                </p>
                                                <p className="content-description">{content.description}</p>
                                                {content.tags && (
                                                    <div className="content-tags">
                                                        {content.tags.map(tag => (
                                                            <span key={tag} className="tag">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="content-actions">
                                                <span className={'status-badge ' + content.status}>
                                                    {content.status}
                                                </span>
                                                <button 
                                                    onClick={() => removeScheduledContent(content.id)}
                                                    className="btn-danger btn-sm"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Collaboration Tools Component
            function CollaborationTools() {
                const [teamMembers, setTeamMembers] = useState([
                    { id: 1, name: 'Alex Editor', role: 'Video Editor', status: 'online', permissions: ['edit_content', 'upload_content'] },
                    { id: 2, name: 'Sarah Manager', role: 'Content Manager', status: 'away', permissions: ['manage_content', 'moderate_chat'] },
                    { id: 3, name: 'Mike Designer', role: 'Graphic Designer', status: 'offline', permissions: ['design_overlays'] }
                ]);
                const [inviteEmail, setInviteEmail] = useState('');
                const [inviteRole, setInviteRole] = useState('editor');
                const [sharedProjects, setSharedProjects] = useState([
                    { id: 1, name: 'Summer Campaign', collaborators: 3, lastUpdated: '2025-07-23T14:30' },
                    { id: 2, name: 'Tutorial Series', collaborators: 2, lastUpdated: '2025-07-23T10:15' }
                ]);
                
                const inviteTeamMember = () => {
                    if (!inviteEmail.trim()) {
                        alert('Please enter an email address');
                        return;
                    }
                    
                    alert('Invitation sent to ' + inviteEmail + ' as ' + inviteRole);
                    setInviteEmail('');
                };
                
                const removeTeamMember = (memberId) => {
                    if (confirm('Are you sure you want to remove this team member?')) {
                        setTeamMembers(prev => prev.filter(m => m.id !== memberId));
                    }
                };
                
                return (
                    <div className="collaboration-tools">
                        <div className="section-header">
                            <h2>👥 Collaboration Tools</h2>
                            <p>Manage your team and collaborative projects</p>
                        </div>
                        
                        <div className="collaboration-layout">
                            <div className="team-management">
                                <h3>Team Members</h3>
                                <div className="invite-section">
                                    <div className="invite-form">
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="Enter email address..."
                                            className="input-field"
                                        />
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="editor">Video Editor</option>
                                            <option value="manager">Content Manager</option>
                                            <option value="moderator">Chat Moderator</option>
                                            <option value="designer">Graphic Designer</option>
                                        </select>
                                        <button onClick={inviteTeamMember} className="btn-primary">
                                            ✉️ Invite
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="team-members-list">
                                    {teamMembers.map(member => (
                                        <div key={member.id} className="team-member">
                                            <div className="member-info">
                                                <div className="member-avatar">
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="member-details">
                                                    <h4>{member.name}</h4>
                                                    <p>{member.role}</p>
                                                    <div className="member-permissions">
                                                        {member.permissions.map(perm => (
                                                            <span key={perm} className="permission-tag">
                                                                {perm.replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="member-actions">
                                                <span className={'status-indicator ' + member.status}>
                                                    ● {member.status}
                                                </span>
                                                <button 
                                                    onClick={() => removeTeamMember(member.id)}
                                                    className="btn-danger btn-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="shared-projects">
                                <h3>Shared Projects</h3>
                                <div className="projects-list">
                                    {sharedProjects.map(project => (
                                        <div key={project.id} className="project-item">
                                            <div className="project-info">
                                                <h4>{project.name}</h4>
                                                <p>{project.collaborators} collaborators</p>
                                                <p className="last-updated">
                                                    Last updated: {new Date(project.lastUpdated).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="project-actions">
                                                <button className="btn-secondary btn-sm">
                                                    📂 Open
                                                </button>
                                                <button className="btn-primary btn-sm">
                                                    👥 Manage
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-primary">+ New Project</button>
                            </div>
                        </div>
                        
                        <div className="real-time-collaboration">
                            <h3>📝 Real-time Collaboration</h3>
                            <div className="collaboration-features">
                                <div className="feature-card">
                                    <h4>💬 Team Chat</h4>
                                    <p>Instant messaging with your team members</p>
                                    <button className="btn-secondary">Open Chat</button>
                                </div>
                                <div className="feature-card">
                                    <h4>📋 Shared Notes</h4>
                                    <p>Collaborative notes and script writing</p>
                                    <button className="btn-secondary">Open Notes</button>
                                </div>
                                <div className="feature-card">
                                    <h4>📊 Project Dashboard</h4>
                                    <p>Track progress and assign tasks</p>
                                    <button className="btn-secondary">View Dashboard</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Main App Component
            function App() {
                const [user, setUser] = useState(null);
                const [content, setContent] = useState([]);
                const [activeTab, setActiveTab] = useState('dashboard');
                const [loading, setLoading] = useState(true);
                
                // Load user and content
                useEffect(() => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        window.location.href = 'http://localhost:3000';
                        return;
                    }
                    
                    // Load user profile
                    fetch(API_BASE + '/auth/profile', {
                        headers: { 'Authorization': \`Bearer \${token}\` }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setUser(data.data);
                            if (!data.data.isCreator) {
                                alert('Access denied. Creator account required.');
                                window.location.href = 'http://localhost:3000';
                                return;
                            }
                            loadContent(data.data._id, token);
                        } else {
                            localStorage.removeItem('token');
                            window.location.href = 'http://localhost:3000';
                        }
                    })
                    .catch(() => {
                        localStorage.removeItem('token');
                        window.location.href = 'http://localhost:3000';
                    });
                }, []);
                
                const loadContent = (userId, token) => {
                    fetch(API_BASE + \`/content?creatorId=\${userId}\`, {
                        headers: { 'Authorization': \`Bearer \${token}\` }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setContent(data.data || []);
                        }
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
                };
                
                const handleContentUpdate = () => {
                    const token = localStorage.getItem('token');
                    if (user && token) {
                        loadContent(user._id, token);
                    }
                };
                
                if (loading) {
                    return (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#fff'}}>
                            <div>Loading Creator Studio...</div>
                        </div>
                    );
                }
                
                const renderContent = () => {
                    switch (activeTab) {
                        case 'dashboard':
                            return <Dashboard user={user} content={content} />;
                        case 'content':
                            return <ContentManager content={content} onContentUpdate={handleContentUpdate} />;
                        case 'analytics':
                            return <Analytics content={content} />;
                        case 'monetization':
                            return <Monetization />;
                        case 'streaming':
                            return <Streaming />;
                        case 'multiplatform':
                            return <MultiPlatformStreaming />;
                        case 'streaming-tools':
                            return <AdvancedStreamingTools />;
                        case 'planning':
                            return <ContentPlanning />;
                        case 'collaboration':
                            return <CollaborationTools />;
                        case 'mobile':
                            return <MobileCompanion />;
                        case 'community':
                            return <Community />;
                        case 'settings':
                            return <Settings user={user} />;
                        default:
                            return <Dashboard user={user} content={content} />;
                    }
                };
                
                return (
                    <div className="layout">
                        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />
                        <main className="main-content">
                            {renderContent()}
                        </main>
                    </div>
                );
            }
            
            // Render the app
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        </script>
    </body>
    </html>
  `);
});

// API proxy for development
app.use('/api', (req, res) => {
  res.json({ 
    message: 'Creator Studio - API requests should go to localhost:3004',
    apiUrl: 'http://localhost:3004/api',
    requested: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🎨 PRISM Creator Studio running on http://localhost:${PORT}`);
  console.log(`🔗 Consumer Frontend: http://localhost:${process.env.CONSUMER_PORT || 3000}`);
  console.log(`🔗 API Server: http://localhost:${process.env.API_PORT || 3004}`);
});
