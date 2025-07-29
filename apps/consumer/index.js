const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic React setup - will be replaced with proper build process
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PRISM - Content Discovery Platform</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            /* PRISM Design System - Embedded for better performance */
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
                background: var(--prism-gray-25);
                min-height: 100vh;
                overflow-x: hidden;
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
            
            .btn-prism-ghost {
                background: transparent;
                color: var(--prism-gray-600);
                border: 1px solid var(--prism-gray-300);
            }
            
            .btn-prism-ghost:hover {
                background: var(--prism-gray-50);
                color: var(--prism-gray-800);
            }
            
            /* Input System */
            .input-prism {
                width: 100%;
                padding: var(--prism-space-md) var(--prism-space-lg);
                border: 1px solid var(--prism-gray-300);
                border-radius: var(--prism-radius-lg);
                font-family: inherit;
                font-size: var(--prism-text-base);
                background: var(--prism-gray-50);
                transition: var(--prism-transition);
                outline: none;
            }
            
            .input-prism:focus {
                border-color: var(--prism-purple);
                background: white;
                box-shadow: 0 0 0 3px rgba(106, 13, 173, 0.1);
            }
            
            /* Card System */
            .card-prism {
                background: white;
                border-radius: var(--prism-radius-2xl);
                padding: var(--prism-space-2xl);
                box-shadow: var(--prism-shadow);
                border: 1px solid var(--prism-gray-100);
                transition: var(--prism-transition);
            }
            
            .card-prism:hover {
                box-shadow: var(--prism-shadow-lg);
            }
            
            /* Animations */
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            @keyframes prism-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes prism-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            
            .prism-spin { animation: prism-spin 1s linear infinite; }
            .prism-pulse { animation: prism-pulse 2s ease-in-out infinite; }
            
            /* Modern PRISM App Specific Styles */
            body { 
                background: var(--prism-gray-50);
                min-height: 100vh;
                overflow-x: hidden;
            }
            
            /* Header Styles */
            .header { 
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid var(--prism-gray-200);
                padding: var(--prism-space-lg) var(--prism-space-2xl);
                position: sticky;
                top: 0;
                z-index: 100;
                transition: all var(--prism-transition);
            }
            
            .header.scrolled {
                box-shadow: var(--prism-shadow-lg);
                border-bottom-color: var(--prism-gray-300);
            }
            
            .logo { 
                font-size: var(--prism-text-2xl);
                font-weight: 800;
                background: var(--prism-gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                display: flex;
                align-items: center;
                gap: var(--prism-space-sm);
            }
            
            .logo-icon {
                width: 32px;
                height: 32px;
                background: var(--prism-gradient-primary);
                border-radius: var(--prism-radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: var(--prism-text-lg);
                animation: float 3s ease-in-out infinite;
            }
            
            .nav { 
                display: flex; 
                gap: var(--prism-space-xl);
                align-items: center;
            }
            
            .nav a { 
                text-decoration: none; 
                color: var(--prism-gray-600); 
                padding: var(--prism-space-sm) var(--prism-space-lg); 
                border-radius: var(--prism-radius-lg);
                font-weight: 500;
                transition: all var(--prism-transition);
                position: relative;
                overflow: hidden;
            }
            
            .nav a::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 0;
                height: 2px;
                background: var(--prism-gradient-primary);
                transition: all var(--prism-transition);
                transform: translateX(-50%);
            }
            
            .nav a:hover {
                color: var(--prism-purple);
                background: rgba(106, 13, 173, 0.05);
            }
            
            .nav a:hover::before {
                width: 80%;
            }
            
            /* Main Content */
            .main-content { 
                max-width: 1400px; 
                margin: var(--prism-space-3xl) auto; 
                padding: 0 var(--prism-space-2xl);
                animation: fadeIn 0.8s ease-out;
            }
            
            /* App Layout */
            .app-container {
                min-height: 100vh;
                background: var(--prism-gray-25);
            }
            
            .loading-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: var(--prism-gray-25);
            }
            
            .loading-spinner {
                text-align: center;
            }
            
            .main-content {
                min-height: calc(100vh - 80px);
            }
            
            .main-layout {
                max-width: 1400px;
                margin: 0 auto;
                padding: var(--prism-space-2xl);
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: var(--prism-space-3xl);
                align-items: start;
            }
            
            .content-section {
                min-width: 0; /* Prevent grid overflow */
            }
            
            .section-header {
                margin-bottom: var(--prism-space-3xl);
                text-align: center;
            }
            
            .section-title {
                font-size: var(--prism-text-3xl);
                font-weight: 700;
                margin-bottom: var(--prism-space-md);
            }
            
            .section-subtitle {
                font-size: var(--prism-text-lg);
                color: var(--prism-gray-600);
                max-width: 600px;
                margin: 0 auto;
            }
            
            /* Hero Section */
            .hero { 
                text-align: center; 
                padding: var(--prism-space-3xl) var(--prism-space-2xl); 
                background: white;
                border-radius: var(--prism-radius-2xl); 
                margin-bottom: var(--prism-space-3xl);
                box-shadow: var(--prism-shadow-lg);
                position: relative;
                overflow: hidden;
            }
            
            .hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100%;
                background: var(--prism-gradient-radial);
                opacity: 0.02;
                z-index: 0;
            }
            
            .hero-content {
                position: relative;
                z-index: 1;
            }
            
            .hero h1 {
                font-size: var(--prism-text-5xl);
                font-weight: 800;
                background: var(--prism-gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: var(--prism-space-lg);
                line-height: 1.1;
            }
            
            .hero p {
                font-size: var(--prism-text-xl);
                color: var(--prism-gray-600);
                margin-bottom: var(--prism-space-2xl);
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            /* Content Grid */
            .content-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
                gap: var(--prism-space-2xl);
                margin-bottom: var(--prism-space-3xl);
            }
            
            .content-card { 
                background: white; 
                border-radius: var(--prism-radius-2xl); 
                overflow: hidden;
                box-shadow: var(--prism-shadow);
                transition: all var(--prism-transition);
                position: relative;
                cursor: pointer;
            }
            
            .content-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--prism-gradient-primary);
                transform: scaleX(0);
                transition: transform var(--prism-transition);
            }
            
            .content-card:hover {
                transform: translateY(-8px);
                box-shadow: var(--prism-shadow-2xl);
            }
            
            .content-card:hover::before {
                transform: scaleX(1);
            }
            
            .thumbnail { 
                width: 100%; 
                height: 200px; 
                background: var(--prism-gradient-subtle);
                position: relative;
                overflow: hidden;
            }
            
            .thumbnail::after {
                content: '🎬';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: var(--prism-text-4xl);
                opacity: 0.3;
            }
            
            .card-content {
                padding: var(--prism-space-xl);
            }
            
            .card-title {
                font-size: var(--prism-text-xl);
                font-weight: 600;
                color: var(--prism-gray-800);
                margin-bottom: var(--prism-space-sm);
            }
            
            .card-description {
                color: var(--prism-gray-600);
                font-size: var(--prism-text-base);
                line-height: 1.6;
                margin-bottom: var(--prism-space-lg);
            }
            
            .card-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: var(--prism-gray-500);
                font-size: var(--prism-text-sm);
            }
            
            .thumbnail-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: opacity var(--prism-transition);
                background: rgba(0, 0, 0, 0.8);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }
            
            .content-card:hover .thumbnail-overlay {
                opacity: 1;
            }
            
            .views {
                display: flex;
                align-items: center;
            }
            
            .category-badge {
                background: var(--prism-gradient-primary);
                color: white;
                padding: var(--prism-space-xs) var(--prism-space-sm);
                border-radius: var(--prism-radius-lg);
                font-size: var(--prism-text-xs);
                font-weight: 500;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .content-grid {
                    grid-template-columns: 1fr;
                    gap: var(--prism-space-lg);
                }
                
                .main-layout {
                    flex-direction: column;
                }
                
                .sidebar {
                    order: 2;
                    margin-top: var(--prism-space-2xl);
                }
            }
            
            /* Auth Section */
            .auth-section { 
                display: flex; 
                gap: var(--prism-space-lg);
                align-items: center;
            }
            
            /* Sidebar */
            .sidebar { 
                width: 280px; 
                background: white; 
                padding: var(--prism-space-2xl); 
                border-radius: var(--prism-radius-2xl); 
                height: fit-content;
                box-shadow: var(--prism-shadow);
                position: sticky;
                top: 120px;
            }
            
            .sidebar h3 {
                font-size: var(--prism-text-lg);
                font-weight: 600;
                color: var(--prism-gray-800);
                margin-bottom: var(--prism-space-lg);
                padding-bottom: var(--prism-space-sm);
                border-bottom: 2px solid var(--prism-gray-100);
            }
            
            .sidebar-item {
                padding: var(--prism-space-md) var(--prism-space-lg);
                border-radius: var(--prism-radius-lg);
                margin-bottom: var(--prism-space-sm);
                color: var(--prism-gray-600);
                cursor: pointer;
                transition: all var(--prism-transition);
                display: flex;
                align-items: center;
                gap: var(--prism-space-sm);
            }
            
            .sidebar-item:hover {
                background: rgba(106, 13, 173, 0.05);
                color: var(--prism-purple);
                transform: translateX(4px);
            }
            
            .sidebar-item.active {
                background: var(--prism-gradient-primary);
                color: white;
                box-shadow: var(--prism-glow-subtle);
            }
            
            /* Main Layout */
            .main-layout { 
                display: grid; 
                grid-template-columns: 280px 1fr; 
                gap: var(--prism-space-3xl);
                align-items: start;
            }
            
            .feed-item { 
                background: white; 
                padding: var(--prism-space-2xl); 
                border-radius: var(--prism-radius-2xl); 
                margin-bottom: var(--prism-space-xl);
                box-shadow: var(--prism-shadow);
                transition: all var(--prism-transition);
            }
            
            .feed-item:hover {
                box-shadow: var(--prism-shadow-lg);
                transform: translateY(-2px);
            }
            
            /* Loading States */
            .loading-skeleton {
                background: var(--prism-gray-200);
                border-radius: var(--prism-radius);
                animation: prism-pulse 2s infinite;
            }
            
            .loading-card {
                padding: var(--prism-space-xl);
            }
            
            .loading-title {
                height: 24px;
                margin-bottom: var(--prism-space-md);
            }
            
            .loading-content {
                height: 16px;
                margin-bottom: var(--prism-space-sm);
            }
            
            .loading-content.short {
                width: 60%;
            }
            
            /* Status Indicators */
            .status-indicator {
                display: inline-flex;
                align-items: center;
                gap: var(--prism-space-xs);
                padding: var(--prism-space-xs) var(--prism-space-sm);
                border-radius: var(--prism-radius-full);
                font-size: var(--prism-text-xs);
                font-weight: 500;
            }
            
            .status-online {
                background: rgba(16, 185, 129, 0.1);
                color: var(--prism-success);
            }
            
            .status-offline {
                background: rgba(107, 114, 128, 0.1);
                color: var(--prism-gray-500);
            }
            
            /* Responsive Design */
            @media (max-width: 1024px) {
                .main-layout { 
                    grid-template-columns: 1fr; 
                }
                .sidebar { 
                    width: 100%;
                    position: static;
                    order: 2;
                }
                .header { 
                    padding: var(--prism-space-lg); 
                }
                .nav {
                    gap: var(--prism-space-lg);
                }
            }
            
            @media (max-width: 768px) {
                .content-grid {
                    grid-template-columns: 1fr;
                }
                .hero h1 {
                    font-size: var(--prism-text-4xl);
                }
                .hero p {
                    font-size: var(--prism-text-lg);
                }
                .main-content {
                    padding: 0 var(--prism-space-lg);
                }
                .nav {
                    display: none; /* Mobile menu would go here */
                }
                
                .search-container {
                    display: none;
                }
                
                .search-toggle {
                    display: block;
                }
                
                .search-container.active {
                    display: block;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--prism-surface);
                    padding: var(--prism-space-lg);
                    border-top: 1px solid var(--prism-border);
                }
                
                .user-menu {
                    flex-direction: column;
                    gap: var(--prism-space-sm);
                }
                
                .profile-header {
                    flex-direction: column;
                    text-align: center;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .preferences-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            /* Enhanced Header Styles */
            .header-main {
                display: flex;
                align-items: center;
                gap: var(--prism-space-lg);
                width: 100%;
            }
            
            .search-container {
                flex: 1;
                max-width: 500px;
                position: relative;
            }
            
            .search-form {
                position: relative;
            }
            
            .search-input-wrapper {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--prism-radius-lg);
                padding: 0;
                backdrop-filter: blur(10px);
            }
            
            .search-input {
                flex: 1;
                background: transparent;
                border: none;
                padding: var(--prism-space-md);
                color: white;
                outline: none;
                font-size: 14px;
            }
            
            .search-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }
            
            .search-btn, .filters-btn {
                background: transparent;
                border: none;
                color: white;
                padding: var(--prism-space-md);
                cursor: pointer;
                border-radius: var(--prism-radius-md);
                transition: background-color 0.2s;
            }
            
            .search-btn:hover, .filters-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .search-filters {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--prism-surface);
                border: 1px solid var(--prism-border);
                border-radius: var(--prism-radius-lg);
                padding: var(--prism-space-lg);
                margin-top: var(--prism-space-sm);
                z-index: 1000;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: var(--prism-space-md);
                box-shadow: var(--prism-shadow-lg);
            }
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: var(--prism-space-sm);
            }
            
            .filter-group label {
                font-size: 12px;
                font-weight: 500;
                color: var(--prism-text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .filter-group select {
                background: var(--prism-input-bg);
                border: 1px solid var(--prism-border);
                border-radius: var(--prism-radius-md);
                padding: var(--prism-space-sm);
                color: var(--prism-text);
                font-size: 14px;
            }
            
            .nav {
                display: flex;
                gap: var(--prism-space-md);
            }
            
            .nav-btn, .user-nav-btn {
                background: transparent;
                border: none;
                color: white;
                padding: var(--prism-space-sm) var(--prism-space-md);
                border-radius: var(--prism-radius-md);
                cursor: pointer;
                text-decoration: none;
                transition: all 0.2s;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: var(--prism-space-sm);
            }
            
            .nav-btn:hover, .user-nav-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            .nav-btn.active, .user-nav-btn.active {
                background: var(--prism-primary);
                color: white;
            }
            
            .search-toggle {
                background: transparent;
                border: none;
                color: white;
                padding: var(--prism-space-sm);
                border-radius: var(--prism-radius-md);
                cursor: pointer;
                font-size: 18px;
                display: none;
            }
            
            .notifications-container {
                position: relative;
            }
            
            .notifications-btn {
                position: relative;
                background: transparent;
                border: none;
                color: white;
                padding: var(--prism-space-sm);
                border-radius: var(--prism-radius-md);
                cursor: pointer;
                font-size: 18px;
                transition: background-color 0.2s;
            }
            
            .notifications-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: var(--prism-error);
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: translate(25%, -25%);
            }
            
            .notifications-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 350px;
                background: var(--prism-surface);
                border: 1px solid var(--prism-border);
                border-radius: var(--prism-radius-lg);
                box-shadow: var(--prism-shadow-lg);
                z-index: 1000;
                margin-top: var(--prism-space-sm);
            }
            
            .user-menu {
                display: flex;
                align-items: center;
                gap: var(--prism-space-md);
            }
            
            /* Component Styles */
            .subscription-manager, .wallet-system, .user-profile {
                max-width: 1200px;
                margin: 0 auto;
                padding: var(--prism-space-xl);
            }
            
            .section-header {
                margin-bottom: var(--prism-space-2xl);
                text-align: center;
            }
            
            .section-header h2 {
                margin: 0 0 var(--prism-space-md) 0;
                font-size: 2rem;
                font-weight: 700;
            }
            
            .section-header p {
                margin: 0;
                color: var(--prism-text-secondary);
                font-size: 1.1rem;
            }
            
            .wallet-card {
                background: linear-gradient(135deg, var(--prism-primary), var(--prism-secondary));
                border-radius: var(--prism-radius-lg);
                padding: var(--prism-space-2xl);
                margin-bottom: var(--prism-space-2xl);
                color: white;
            }
            
            .balance-amount {
                display: flex;
                align-items: baseline;
                gap: var(--prism-space-xs);
            }
            
            .amount {
                font-size: 3rem;
                font-weight: 700;
            }
            
            .social-interactions {
                margin-top: var(--prism-space-lg);
                padding: var(--prism-space-lg);
                background: var(--prism-surface);
                border-radius: var(--prism-radius-lg);
                border: 1px solid var(--prism-border);
            }
            
            .social-actions {
                display: flex;
                align-items: center;
                gap: var(--prism-space-lg);
                margin-bottom: var(--prism-space-lg);
                padding-bottom: var(--prism-space-lg);
                border-bottom: 1px solid var(--prism-border);
            }
            
            .social-btn {
                display: flex;
                align-items: center;
                gap: var(--prism-space-sm);
                background: transparent;
                border: 1px solid var(--prism-border);
                border-radius: var(--prism-radius-md);
                padding: var(--prism-space-sm) var(--prism-space-md);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }
            
            .empty-state {
                text-align: center;
                padding: var(--prism-space-2xl);
                color: var(--prism-text-secondary);
            }
            
            .loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: var(--prism-space-2xl);
                text-align: center;
            }
            
            /* Scroll Animations */
            .scroll-reveal {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
            }
            
            .scroll-reveal.visible {
                opacity: 1;
                transform: translateY(0);
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        
        <script type="text/babel">
            const { useState, useEffect } = React;
            
            // API Base URL
            const API_BASE = 'http://localhost:3004/api';
            
            // Components
            function Header({ 
                user, 
                onLogin, 
                onLogout, 
                searchQuery, 
                onSearchChange, 
                searchFilters, 
                onFiltersChange,
                notifications, 
                unreadCount, 
                showNotifications, 
                onToggleNotifications,
                currentView,
                onViewChange 
            }) {
                const [scrolled, setScrolled] = useState(false);
                const [showSearch, setShowSearch] = useState(false);
                const [showFilters, setShowFilters] = useState(false);
                
                useEffect(() => {
                    const handleScroll = () => {
                        setScrolled(window.scrollY > 50);
                    };
                    window.addEventListener('scroll', handleScroll);
                    return () => window.removeEventListener('scroll', handleScroll);
                }, []);
                
                const handleSearchSubmit = (e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                        onViewChange('feed');
                        // Trigger search
                    }
                };
                
                return (
                    <header className={'header ' + (scrolled ? 'scrolled' : '')}>
                        <div className="header-main">
                            <div className="logo">
                                <div className="logo-icon">🎬</div>
                                PRISM
                            </div>
                            
                            {/* Search Bar */}
                            <div className={'search-container ' + (showSearch ? 'active' : '')}>
                                <form onSubmit={handleSearchSubmit} className="search-form">
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Search videos, creators, and more..."
                                            value={searchQuery}
                                            onChange={(e) => onSearchChange(e.target.value)}
                                            className="search-input"
                                        />
                                        <button type="submit" className="search-btn">
                                            🔍
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="filters-btn"
                                        >
                                            ⚙️
                                        </button>
                                    </div>
                                    
                                    {showFilters && (
                                        <div className="search-filters">
                                            <div className="filter-group">
                                                <label>Type:</label>
                                                <select 
                                                    value={searchFilters.type} 
                                                    onChange={(e) => onFiltersChange({...searchFilters, type: e.target.value})}
                                                >
                                                    <option value="all">All Content</option>
                                                    <option value="video">Videos</option>
                                                    <option value="live">Live Streams</option>
                                                    <option value="series">Series</option>
                                                </select>
                                            </div>
                                            <div className="filter-group">
                                                <label>Duration:</label>
                                                <select 
                                                    value={searchFilters.duration} 
                                                    onChange={(e) => onFiltersChange({...searchFilters, duration: e.target.value})}
                                                >
                                                    <option value="all">Any Duration</option>
                                                    <option value="short">Short (&lt; 5min)</option>
                                                    <option value="medium">Medium (5-20min)</option>
                                                    <option value="long">Long (&gt; 20min)</option>
                                                </select>
                                            </div>
                                            <div className="filter-group">
                                                <label>Quality:</label>
                                                <select 
                                                    value={searchFilters.quality} 
                                                    onChange={(e) => onFiltersChange({...searchFilters, quality: e.target.value})}
                                                >
                                                    <option value="all">Any Quality</option>
                                                    <option value="720p">720p+</option>
                                                    <option value="1080p">1080p+</option>
                                                    <option value="4k">4K</option>
                                                </select>
                                            </div>
                                            <div className="filter-group">
                                                <label>Sort by:</label>
                                                <select 
                                                    value={searchFilters.sortBy} 
                                                    onChange={(e) => onFiltersChange({...searchFilters, sortBy: e.target.value})}
                                                >
                                                    <option value="recent">Most Recent</option>
                                                    <option value="popular">Most Popular</option>
                                                    <option value="views">Most Viewed</option>
                                                    <option value="rating">Highest Rated</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                            
                            {/* Navigation */}
                            <nav className="nav">
                                <button 
                                    className={'nav-btn ' + (currentView === 'feed' ? 'active' : '')}
                                    onClick={() => onViewChange('feed')}
                                >
                                    🏠 Home
                                </button>
                                <a href="http://localhost:3001" target="_blank" className="nav-btn">
                                    🎥 Creator Studio
                                </a>
                                <a href="http://localhost:3002" target="_blank" className="nav-btn">
                                    ⚙️ Admin
                                </a>
                            </nav>
                            
                            {/* User Actions */}
                            <div className="auth-section">
                                <button 
                                    className="search-toggle"
                                    onClick={() => setShowSearch(!showSearch)}
                                >
                                    🔍
                                </button>
                                
                                {user ? (
                                    <>
                                        {/* Notifications */}
                                        <div className="notifications-container">
                                            <button 
                                                className="notifications-btn"
                                                onClick={onToggleNotifications}
                                            >
                                                🔔
                                                {unreadCount > 0 && (
                                                    <span className="notification-badge">{unreadCount}</span>
                                                )}
                                            </button>
                                            
                                            {showNotifications && (
                                                <div className="notifications-dropdown">
                                                    <div className="notifications-header">
                                                        <h3>Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <button className="mark-read-btn">Mark all read</button>
                                                        )}
                                                    </div>
                                                    <div className="notifications-list">
                                                        {notifications.length === 0 ? (
                                                            <p className="no-notifications">No notifications yet</p>
                                                        ) : (
                                                            notifications.slice(0, 5).map(notification => (
                                                                <div key={notification._id} className={'notification-item ' + (notification.read ? '' : 'unread')}>
                                                                    <span className="notification-icon">{notification.type === 'like' ? '❤️' : notification.type === 'comment' ? '💬' : '📺'}</span>
                                                                    <div className="notification-content">
                                                                        <p>{notification.message}</p>
                                                                        <span className="notification-time">
                                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* User Menu */}
                                        <div className="user-menu">
                                            <button 
                                                className={'user-nav-btn ' + (currentView === 'subscriptions' ? 'active' : '')}
                                                onClick={() => onViewChange('subscriptions')}
                                            >
                                                📺 Subscriptions
                                            </button>
                                            <button 
                                                className={'user-nav-btn ' + (currentView === 'wallet' ? 'active' : '')}
                                                onClick={() => onViewChange('wallet')}
                                            >
                                                💳 Wallet
                                            </button>
                                            <button 
                                                className={'user-nav-btn ' + (currentView === 'profile' ? 'active' : '')}
                                                onClick={() => onViewChange('profile')}
                                            >
                                                👤 Profile
                                            </button>
                                            <button className="btn-prism btn-prism-outline" onClick={onLogout}>
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-prism btn-prism-ghost" onClick={() => onLogin('login')}>
                                            Login
                                        </button>
                                        <button className="btn-prism btn-prism-primary" onClick={() => onLogin('register')}>
                                            Sign Up
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>
                );
            }
            
            function Hero() {
                return (
                    <div className="hero scroll-reveal">
                        <div className="hero-content">
                            <h1>Welcome to PRISM</h1>
                            <p>Discover amazing content from talented creators around the world. Experience the future of content creation and consumption.</p>
                            <div className="flex-prism flex-center" style={{gap: 'var(--prism-space-lg)'}}>
                                <button className="btn-prism btn-prism-primary">
                                    <span>🚀</span>
                                    Get Started
                                </button>
                                <button className="btn-prism btn-prism-outline">
                                    <span>📺</span>
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function Sidebar({ activeCategory, onCategoryChange }) {
                const categories = [
                    { id: 'all', name: 'All Content', icon: '🎬' },
                    { id: 'live', name: 'Live Streams', icon: '🔴' },
                    { id: 'videos', name: 'Videos', icon: '📹' },
                    { id: 'photos', name: 'Photos', icon: '📸' },
                    { id: 'trending', name: 'Trending', icon: '🔥' },
                    { id: 'new', name: 'New Releases', icon: '⭐' }
                ];
                
                return (
                    <div className="sidebar scroll-reveal">
                        <h3>Categories</h3>
                        {categories.map(category => (
                            <div 
                                key={category.id}
                                className={'sidebar-item ' + (activeCategory === category.id ? 'active' : '')}
                                onClick={() => onCategoryChange(category.id)}
                            >
                                <span>{category.icon}</span>
                                {category.name}
                            </div>
                        ))}
                        
                        <div style={{marginTop: 'var(--prism-space-2xl)'}}>
                            <h3>Quick Stats</h3>
                            <div className="card-prism" style={{padding: 'var(--prism-space-lg)'}}>
                                <div style={{marginBottom: 'var(--prism-space-md)'}}>
                                    <div className="text-prism-purple text-2xl font-bold">2,847</div>
                                    <div className="text-prism-gray-500 text-sm">Active Creators</div>
                                </div>
                                <div style={{marginBottom: 'var(--prism-space-md)'}}>
                                    <div className="text-prism-pink text-2xl font-bold">18.2K</div>
                                    <div className="text-prism-gray-500 text-sm">Live Viewers</div>
                                </div>
                                <div>
                                    <div className="text-prism-success text-2xl font-bold">127K</div>
                                    <div className="text-prism-gray-500 text-sm">Total Content</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Live Streaming Component with Chat
            function LiveStreamViewer({ streamId }) {
                const [isLive, setIsLive] = useState(true);
                const [viewerCount, setViewerCount] = useState(847);
                const [chatMessages, setChatMessages] = useState([
                    { id: 1, user: 'StreamFan92', message: 'Amazing stream! 🔥', timestamp: new Date().toLocaleTimeString() },
                    { id: 2, user: 'ContentLover', message: 'Been waiting for this all week!', timestamp: new Date().toLocaleTimeString() },
                    { id: 3, user: 'VIPMember', message: 'Love the new setup! 💕', timestamp: new Date().toLocaleTimeString() }
                ]);
                const [newMessage, setNewMessage] = useState('');
                const [streamQuality, setStreamQuality] = useState('1080p');
                
                const sendMessage = () => {
                    if (newMessage.trim()) {
                        const message = {
                            id: Date.now(),
                            user: 'You',
                            message: newMessage,
                            timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, message]);
                        setNewMessage('');
                        
                        // Simulate viewer count changes
                        setViewerCount(prev => prev + Math.floor(Math.random() * 3));
                    }
                };
                
                return (
                    <div className="live-stream-container">
                        <div className="stream-main">
                            <div className="stream-player">
                                <div className="stream-video">
                                    {isLive ? (
                                        <div className="live-video-placeholder">
                                            <div className="live-indicator">
                                                <span className="live-dot"></span>
                                                LIVE
                                            </div>
                                            <div className="stream-overlay">
                                                <div className="stream-info">
                                                    <h2>Live Stream - Creator Studio Session</h2>
                                                    <div className="stream-stats">
                                                        <span className="viewer-count">
                                                            👥 {viewerCount.toLocaleString()} viewers
                                                        </span>
                                                        <span className="stream-quality">📺 {streamQuality}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="video-content">
                                                <div className="simulated-stream">
                                                    <div className="stream-animation"></div>
                                                    <p>🎥 Live content streaming...</p>
                                                    <p style={{fontSize: '0.9rem', opacity: 0.8}}>WebRTC connection active</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="stream-offline">
                                            <h3>Stream Offline</h3>
                                            <p>Creator will be back soon!</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="stream-controls">
                                    <div className="quality-selector">
                                        <label>Quality:</label>
                                        <select value={streamQuality} onChange={(e) => setStreamQuality(e.target.value)}>
                                            <option value="480p">480p</option>
                                            <option value="720p">720p</option>
                                            <option value="1080p">1080p</option>
                                        </select>
                                    </div>
                                    <div className="stream-actions">
                                        <button className="btn-prism btn-prism-ghost">
                                            <span>❤️</span>
                                            Like
                                        </button>
                                        <button className="btn-prism btn-prism-ghost">
                                            <span>💰</span>
                                            Tip
                                        </button>
                                        <button className="btn-prism btn-prism-primary">
                                            <span>⭐</span>
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="stream-chat">
                            <div className="chat-header">
                                <h3>Live Chat</h3>
                                <span className="chat-count">{chatMessages.length} messages</span>
                            </div>
                            
                            <div className="chat-messages">
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className="chat-message">
                                        <div className="message-header">
                                            <span className="username">{msg.user}</span>
                                            <span className="timestamp">{msg.timestamp}</span>
                                        </div>
                                        <div className="message-content">{msg.message}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="chat-input">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="form-input"
                                />
                                <button onClick={sendMessage} className="btn-prism btn-prism-primary">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Video-on-Demand Player Component
            function VideoPlayer({ content }) {
                const [isPlaying, setIsPlaying] = useState(false);
                const [currentTime, setCurrentTime] = useState(0);
                const [duration, setDuration] = useState(1200); // 20 minutes
                const [volume, setVolume] = useState(80);
                const [quality, setQuality] = useState('1080p');
                const [isFullscreen, setIsFullscreen] = useState(false);
                
                const formatTime = (seconds) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    return mins + ':' + (secs < 10 ? '0' : '') + secs;
                };
                
                const togglePlay = () => {
                    setIsPlaying(!isPlaying);
                    if (!isPlaying) {
                        // Simulate video progress
                        const interval = setInterval(() => {
                            setCurrentTime(prev => {
                                if (prev >= duration) {
                                    clearInterval(interval);
                                    setIsPlaying(false);
                                    return duration;
                                }
                                return prev + 1;
                            });
                        }, 1000);
                    }
                };
                
                return (
                    <div className={'video-player' + (isFullscreen ? ' fullscreen' : '')}>
                        <div className="video-container">
                            <div className="video-placeholder">
                                <div className="video-overlay">
                                    <div className="play-button" onClick={togglePlay}>
                                        <span style={{fontSize: '4rem'}}>
                                            {isPlaying ? '⏸️' : '▶️'}
                                        </span>
                                    </div>
                                </div>
                                <div className="video-info-overlay">
                                    <h3>{content.title}</h3>
                                    <p>{content.description}</p>
                                </div>
                            </div>
                            
                            <div className="video-controls">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{width: ((currentTime / duration) * 100) + '%'}}
                                    ></div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={currentTime}
                                        onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                                        className="progress-slider"
                                    />
                                </div>
                                
                                <div className="control-buttons">
                                    <button onClick={togglePlay} className="control-btn">
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </button>
                                    
                                    <div className="volume-control">
                                        <span>🔊</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={(e) => setVolume(e.target.value)}
                                            className="volume-slider"
                                        />
                                    </div>
                                    
                                    <div className="time-display">
                                        {formatTime(currentTime) + ' / ' + formatTime(duration)}
                                    </div>
                                    
                                    <div className="quality-selector">
                                        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                                            <option value="480p">480p</option>
                                            <option value="720p">720p</option>
                                            <option value="1080p">1080p</option>
                                            <option value="1440p">1440p</option>
                                        </select>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsFullscreen(!isFullscreen)} 
                                        className="control-btn"
                                    >
                                        {isFullscreen ? '🗗' : '⛶'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function LoadingCard() {
                return (
                    <div className="content-card loading-card">
                        <div className="loading-skeleton" style={{height: '200px', marginBottom: 'var(--prism-space-lg)'}}></div>
                        <div className="loading-skeleton loading-title"></div>
                        <div className="loading-skeleton loading-content"></div>
                        <div className="loading-skeleton loading-content short"></div>
                    </div>
                );
            }
            
            function ContentCard({ content, delay = 0 }) {
                return (
                    <div 
                        className="content-card" 
                        onClick={() => alert('View content: ' + content.title)}
                        style={{
                            animation: 'fadeIn 0.6s ease-out ' + delay + 'ms both'
                        }}
                    >
                        <div className="thumbnail">
                            <div className="thumbnail-overlay">
                                <span style={{fontSize: '2rem'}}>▶️</span>
                            </div>
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">{content.title}</h3>
                            <p className="card-description">
                                {content.description?.length > 120 
                                    ? content.description.substring(0, 120) + '...' 
                                    : content.description
                                }
                            </p>
                            <div className="card-meta">
                                <span className="views">
                                    <span style={{marginRight: 'var(--prism-space-xs)'}}>👁️</span>
                                    {content.views?.toLocaleString() || 0} views
                                </span>
                                <span className="category">
                                    <span className="category-badge">
                                        {content.category || 'General'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                );
            }
            
            function ContentFeed({ content }) {
                if (!content.length) {
                    return (
                        <div className="card-prism" style={{
                            textAlign: 'center', 
                            padding: 'var(--prism-space-4xl)',
                            margin: 'var(--prism-space-2xl)',
                            background: 'var(--prism-gradient-subtle)'
                        }}>
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: 'var(--prism-space-lg)',
                                opacity: '0.6'
                            }}>
                                🎬
                            </div>
                            <h3 style={{
                                fontSize: 'var(--prism-text-xl)',
                                marginBottom: 'var(--prism-space-md)',
                                color: 'var(--prism-gray-700)'
                            }}>
                                No content available yet
                            </h3>
                            <p style={{
                                color: 'var(--prism-gray-600)',
                                marginBottom: 'var(--prism-space-xl)'
                            }}>
                                Check back later or visit the Creator Studio to create amazing content!
                            </p>
                            <a href="http://localhost:3002" className="btn-prism btn-prism-primary">
                                <span>🚀</span>
                                Go to Creator Studio
                            </a>
                        </div>
                    );
                }
                
                return (
                    <div className="content-grid">
                        {content.map((item, index) => (
                            <ContentCard 
                                key={item._id} 
                                content={item} 
                                delay={index * 100}
                            />
                        ))}
                    </div>
                );
            }
            
            function LoginModal({ isOpen, type, onClose, onSuccess }) {
                const [formData, setFormData] = React.useState({ 
                    email: '', 
                    password: '', 
                    username: '', 
                    displayName: '' 
                });
                const [loading, setLoading] = React.useState(false);
                const [error, setError] = React.useState('');
                
                if (!isOpen) return null;
                
                const handleSubmit = async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    setError('');
                    
                    try {
                        // Basic validation
                        if (!formData.email || !formData.password) {
                            setError('Email and password are required');
                            setLoading(false);
                            return;
                        }
                        
                        if (formData.password.length < 6) {
                            setError('Password must be at least 6 characters');
                            setLoading(false);
                            return;
                        }
                        
                        if (type === 'register' && !formData.username) {
                            setError('Username is required for registration');
                            setLoading(false);
                            return;
                        }
                        
                        // Real API call
                        const endpoint = type === 'register' ? '/api/auth/register' : '/api/auth/login';
                        const apiUrl = \`http://localhost:3004\${endpoint}\`;
                        
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: formData.email,
                                password: formData.password,
                                username: formData.username,
                                displayName: formData.displayName
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                            setError(data.error || 'Authentication failed');
                            setLoading(false);
                            return;
                        }
                        
                        // Store authentication data
                        localStorage.setItem('prism-token', data.token);
                        localStorage.setItem('prism-user', JSON.stringify(data.user));
                        
                        // Update admin panel users list
                        if (type === 'register') {
                            const existingUsers = JSON.parse(localStorage.getItem('prism_users') || '[]');
                            const userExists = existingUsers.find(user => user.email === data.user.email);
                            
                            if (!userExists) {
                                existingUsers.push(data.user);
                                localStorage.setItem('prism_users', JSON.stringify(existingUsers));
                            }
                        }
                        
                        // Call success callback
                        onSuccess(data.user);
                        onClose();
                        
                        // Reset form
                        setFormData({ email: '', password: '', username: '', displayName: '' });
                        
                    } catch (err) {
                        console.error('Authentication error:', err);
                        setError(err.message || 'Network error. Please check if the API server is running.');
                    }
                    
                    setLoading(false);
                };
                
                return (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(18, 18, 18, 0.8)', 
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div className="card-prism" style={{
                            padding: 'var(--prism-space-3xl)', 
                            width: '480px', 
                            maxWidth: '90vw',
                            margin: 'var(--prism-space-lg)',
                            animation: 'slideUp 0.4s ease-out'
                        }}>
                            <div style={{textAlign: 'center', marginBottom: 'var(--prism-space-2xl)'}}>
                                <h2 className="text-3xl font-bold gradient-text" style={{marginBottom: 'var(--prism-space-sm)'}}>
                                    {type === 'register' ? '🚀 Join PRISM' : '🔑 Welcome Back'}
                                </h2>
                                <p className="text-prism-gray-600">
                                    {type === 'register' 
                                        ? 'Create your account to start discovering amazing content' 
                                        : 'Sign in to your account to continue'
                                    }
                                </p>
                            </div>
                            
                            {error && (
                                <div style={{
                                    color: 'var(--prism-error)', 
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    padding: 'var(--prism-space-md)',
                                    borderRadius: 'var(--prism-radius-lg)',
                                    marginBottom: 'var(--prism-space-lg)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                {type === 'register' && (
                                    <>
                                        <div style={{marginBottom: 'var(--prism-space-lg)'}}>
                                            <label style={{display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '500'}}>
                                                Username *
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your username"
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                className="input-prism"
                                                style={{width: '100%'}}
                                                required
                                                minLength="3"
                                            />
                                        </div>
                                        <div style={{marginBottom: 'var(--prism-space-lg)'}}>
                                            <label style={{display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '500'}}>
                                                Display Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="How others will see you"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                                className="input-prism"
                                                style={{width: '100%'}}
                                            />
                                        </div>
                                    </>
                                )}
                                <div style={{marginBottom: 'var(--prism-space-lg)'}}>
                                    <label style={{display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '500'}}>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="input-prism"
                                        style={{width: '100%'}}
                                        required
                                    />
                                </div>
                                <div style={{marginBottom: 'var(--prism-space-2xl)'}}>
                                    <label style={{display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '500'}}>
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="input-prism"
                                        style={{width: '100%'}}
                                        required
                                        minLength="6"
                                    />
                                    {type === 'register' && (
                                        <small style={{color: 'var(--prism-gray-500)', fontSize: '0.875rem'}}>
                                            Minimum 6 characters
                                        </small>
                                    )}
                                </div>
                                
                                <div className="flex-prism" style={{justifyContent: 'flex-end', gap: 'var(--prism-space-lg)'}}>
                                    <button 
                                        type="button" 
                                        onClick={onClose} 
                                        className="btn-prism btn-prism-ghost" 
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-prism btn-prism-primary" 
                                        disabled={loading}
                                        style={{minWidth: '140px'}}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="prism-spin" style={{
                                                    display: 'inline-block', 
                                                    width: '16px', 
                                                    height: '16px', 
                                                    border: '2px solid rgba(255,255,255,0.3)', 
                                                    borderTop: '2px solid white', 
                                                    borderRadius: '50%',
                                                    marginRight: '8px'
                                                }}></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span style={{marginRight: '8px'}}>
                                                    {type === 'register' ? '🚀' : '🔑'}
                                                </span>
                                                {type === 'register' ? 'Create Account' : 'Sign In'}
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <div style={{textAlign: 'center', marginTop: 'var(--prism-space-xl)', paddingTop: 'var(--prism-space-xl)', borderTop: '1px solid var(--prism-gray-200)'}}>
                                    <p style={{color: 'var(--prism-gray-600)', marginBottom: 'var(--prism-space-md)'}}>
                                        {type === 'register' ? 'Already have an account?' : "Don't have an account?"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError('');
                                            setFormData({ email: '', password: '', username: '', displayName: '' });
                                            // This would trigger a prop change to switch between login/register
                                        }}
                                        className="btn-prism btn-prism-link"
                                        disabled={loading}
                                    >
                                        {type === 'register' ? 'Sign In Instead' : 'Create New Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            }
            
            // Subscription Management Component
            function SubscriptionManager({ user, onUpdate }) {
                const [subscriptions, setSubscriptions] = useState([]);
                const [availablePlans, setAvailablePlans] = useState([]);
                const [loading, setLoading] = useState(true);
                const [processing, setProcessing] = useState(false);
                
                useEffect(() => {
                    loadSubscriptions();
                    loadAvailablePlans();
                }, []);
                
                const loadSubscriptions = async () => {
                    try {
                        const response = await fetch('/api/subscriptions', {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setSubscriptions(data.subscriptions || []);
                        }
                    } catch (error) {
                        console.error('Failed to load subscriptions:', error);
                    }
                };
                
                const loadAvailablePlans = async () => {
                    try {
                        const response = await fetch('/api/subscription-plans');
                        if (response.ok) {
                            const data = await response.json();
                            setAvailablePlans(data.plans || []);
                        }
                    } catch (error) {
                        console.error('Failed to load plans:', error);
                    } finally {
                        setLoading(false);
                    }
                };
                
                const handleSubscribe = async (planId) => {
                    setProcessing(true);
                    try {
                        const response = await fetch('/api/subscriptions/subscribe', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ planId })
                        });
                        
                        if (response.ok) {
                            await loadSubscriptions();
                            onUpdate && onUpdate();
                        } else {
                            alert('Subscription failed. Please try again.');
                        }
                    } catch (error) {
                        console.error('Subscription error:', error);
                        alert('Subscription failed. Please try again.');
                    } finally {
                        setProcessing(false);
                    }
                };
                
                const handleUnsubscribe = async (subscriptionId) => {
                    if (!confirm('Are you sure you want to unsubscribe?')) return;
                    
                    setProcessing(true);
                    try {
                        const response = await fetch('/api/subscriptions/' + subscriptionId, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        });
                        
                        if (response.ok) {
                            await loadSubscriptions();
                            onUpdate && onUpdate();
                        } else {
                            alert('Unsubscribe failed. Please try again.');
                        }
                    } catch (error) {
                        console.error('Unsubscribe error:', error);
                        alert('Unsubscribe failed. Please try again.');
                    } finally {
                        setProcessing(false);
                    }
                };
                
                if (loading) {
                    return (
                        <div className="loading-state">
                            <div className="prism-spin"></div>
                            <p>Loading subscriptions...</p>
                        </div>
                    );
                }
                
                return (
                    <div className="subscription-manager">
                        <div className="section-header">
                            <h2>📺 Subscription Management</h2>
                            <p>Manage your creator subscriptions and premium plans</p>
                        </div>
                        
                        {/* Active Subscriptions */}
                        <div className="active-subscriptions">
                            <h3>🎯 Active Subscriptions</h3>
                            {subscriptions.length === 0 ? (
                                <div className="empty-state">
                                    <p>No active subscriptions. Subscribe to creators to get exclusive content!</p>
                                </div>
                            ) : (
                                <div className="subscription-grid">
                                    <div className="subscription-card">
                                        <div className="creator-info">
                                            <img 
                                                src="/assets/default-avatar.png" 
                                                alt="Sarah Content"
                                                className="creator-avatar"
                                            />
                                            <div>
                                                <h4>Sarah Content</h4>
                                                <p className="subscription-type">Premium Plan</p>
                                                <p className="subscription-price">$19.99/month</p>
                                            </div>
                                        </div>
                                        <div className="subscription-status">
                                            <span className="status-badge active">
                                                active
                                            </span>
                                            <p className="next-billing">
                                                Next billing: 8/24/2025
                                            </p>
                                        </div>
                                        <button
                                            className="btn-prism btn-prism-danger btn-prism-sm"
                                        >
                                            Unsubscribe
                                        </button>
                                    </div>
                                    <div className="subscription-card">
                                        <div className="creator-info">
                                            <img 
                                                src="/assets/default-avatar.png" 
                                                alt="Mike Streams"
                                                className="creator-avatar"
                                            />
                                            <div>
                                                <h4>Mike Streams</h4>
                                                <p className="subscription-type">Basic Plan</p>
                                                <p className="subscription-price">$9.99/month</p>
                                            </div>
                                        </div>
                                        <div className="subscription-status">
                                            <span className="status-badge active">
                                                active
                                            </span>
                                            <p className="next-billing">
                                                Next billing: 7/30/2025
                                            </p>
                                        </div>
                                        <button
                                            className="btn-prism btn-prism-danger btn-prism-sm"
                                        >
                                            Unsubscribe
                                        </button>
                                    </div>
                                    <div className="subscription-card">
                                        <div className="creator-info">
                                            <img 
                                                src="/assets/default-avatar.png" 
                                                alt="Lisa Gaming"
                                                className="creator-avatar"
                                            />
                                            <div>
                                                <h4>Lisa Gaming</h4>
                                                <p className="subscription-type">VIP Plan</p>
                                                <p className="subscription-price">$49.99/month</p>
                                            </div>
                                        </div>
                                        <div className="subscription-status">
                                            <span className="status-badge active">
                                                active
                                            </span>
                                            <p className="next-billing">
                                                Next billing: 8/15/2025
                                            </p>
                                        </div>
                                        <button
                                            className="btn-prism btn-prism-danger btn-prism-sm"
                                        >
                                            Unsubscribe
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Available Plans */}
                        <div className="available-plans">
                            <h3>💎 Available Premium Plans</h3>
                            <div className="plans-grid">
                                <div className="plan-card">
                                    <div className="plan-header">
                                        <h4>Basic Plan</h4>
                                        <div className="plan-price">
                                            <span className="price">$9.99</span>
                                            <span className="period">/month</span>
                                        </div>
                                    </div>
                                    <div className="plan-features">
                                        <ul>
                                            <li>✓ HD Video Quality</li>
                                            <li>✓ Basic Chat Features</li>
                                            <li>✓ Mobile Access</li>
                                        </ul>
                                    </div>
                                    <button className="btn-prism btn-prism-primary">
                                        Subscribe
                                    </button>
                                </div>
                                <div className="plan-card">
                                    <div className="plan-header">
                                        <h4>Premium Plan</h4>
                                        <div className="plan-price">
                                            <span className="price">$19.99</span>
                                            <span className="period">/month</span>
                                        </div>
                                    </div>
                                    <div className="plan-features">
                                        <ul>
                                            <li>✓ 4K Video Quality</li>
                                            <li>✓ Advanced Chat Features</li>
                                            <li>✓ All Device Access</li>
                                            <li>✓ Exclusive Content</li>
                                        </ul>
                                    </div>
                                    <button className="btn-prism btn-prism-primary">
                                        Subscribe
                                    </button>
                                </div>
                                <div className="plan-card">
                                    <div className="plan-header">
                                        <h4>VIP Plan</h4>
                                        <div className="plan-price">
                                            <span className="price">$39.99</span>
                                            <span className="period">/month</span>
                                        </div>
                                    </div>
                                    <div className="plan-features">
                                        <ul>
                                            <li>✓ 8K Video Quality</li>
                                            <li>✓ Priority Support</li>
                                            <li>✓ Private Messaging</li>
                                            <li>✓ Early Access Content</li>
                                            <li>✓ Custom Requests</li>
                                        </ul>
                                    </div>
                                    <button className="btn-prism btn-prism-primary">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // In-App Purchases & Wallet Component
            function WalletSystem({ user, onUpdate }) {
                const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
                const [purchaseItems, setPurchaseItems] = useState([]);
                const [loading, setLoading] = useState(true);
                const [processing, setProcessing] = useState(false);
                const [topUpAmount, setTopUpAmount] = useState('');
                const [showTopUp, setShowTopUp] = useState(false);
                
                useEffect(() => {
                    loadWallet();
                    loadPurchaseItems();
                }, []);
                
                const loadWallet = async () => {
                    try {
                        const response = await fetch('/api/wallet', {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setWallet(data.wallet || { balance: 0, transactions: [] });
                        }
                    } catch (error) {
                        console.error('Failed to load wallet:', error);
                    }
                };
                
                const loadPurchaseItems = async () => {
                    try {
                        const response = await fetch('/api/store/items');
                        if (response.ok) {
                            const data = await response.json();
                            setPurchaseItems(data.items || []);
                        }
                    } catch (error) {
                        console.error('Failed to load store items:', error);
                    } finally {
                        setLoading(false);
                    }
                };
                
                const handleTopUp = async () => {
                    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return;
                    
                    setProcessing(true);
                    try {
                        const response = await fetch('/api/wallet/topup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ amount: parseFloat(topUpAmount) })
                        });
                        
                        if (response.ok) {
                            await loadWallet();
                            setTopUpAmount('');
                            setShowTopUp(false);
                            onUpdate && onUpdate();
                        } else {
                            alert('Top-up failed. Please try again.');
                        }
                    } catch (error) {
                        console.error('Top-up error:', error);
                        alert('Top-up failed. Please try again.');
                    } finally {
                        setProcessing(false);
                    }
                };
                
                const handlePurchase = async (item) => {
                    if (wallet.balance < item.price) {
                        alert('Insufficient balance. Please top up your wallet.');
                        return;
                    }
                    
                    setProcessing(true);
                    try {
                        const response = await fetch('/api/store/purchase', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ itemId: item._id })
                        });
                        
                        if (response.ok) {
                            await loadWallet();
                            onUpdate && onUpdate();
                            alert('Purchase successful! ' + item.name + ' has been added to your account.');
                        } else {
                            alert('Purchase failed. Please try again.');
                        }
                    } catch (error) {
                        console.error('Purchase error:', error);
                        alert('Purchase failed. Please try again.');
                    } finally {
                        setProcessing(false);
                    }
                };
                
                if (loading) {
                    return (
                        <div className="loading-state">
                            <div className="prism-spin"></div>
                            <p>Loading wallet...</p>
                        </div>
                    );
                }
                
                return (
                    <div className="wallet-system">
                        <div className="section-header">
                            <h2>💳 Wallet & Store</h2>
                            <p>Manage your digital wallet and purchase premium content</p>
                        </div>
                        
                        <div className="wallet-card">
                            <div className="wallet-header">
                                <div className="balance-info">
                                    <h3>Current Balance</h3>
                                    <div className="balance-amount">
                                        <span className="currency">$</span>
                                        <span className="amount">{wallet.balance.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTopUp(!showTopUp)}
                                    className="btn-prism btn-prism-primary"
                                >
                                    💰 Top Up
                                </button>
                            </div>
                            
                            {showTopUp && (
                                <div className="top-up-form">
                                    <div className="form-group">
                                        <label>Amount to add:</label>
                                        <div className="amount-input">
                                            <span className="currency-symbol">$</span>
                                            <input
                                                type="number"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                placeholder="0.00"
                                                min="1"
                                                step="0.01"
                                                className="input-prism"
                                            />
                                        </div>
                                    </div>
                                    <div className="quick-amounts">
                                        <button onClick={() => setTopUpAmount('10')} className="btn-prism btn-prism-ghost btn-prism-sm">$10</button>
                                        <button onClick={() => setTopUpAmount('25')} className="btn-prism btn-prism-ghost btn-prism-sm">$25</button>
                                        <button onClick={() => setTopUpAmount('50')} className="btn-prism btn-prism-ghost btn-prism-sm">$50</button>
                                        <button onClick={() => setTopUpAmount('100')} className="btn-prism btn-prism-ghost btn-prism-sm">$100</button>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            onClick={() => setShowTopUp(false)}
                                            className="btn-prism btn-prism-ghost"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleTopUp}
                                            disabled={processing || !topUpAmount}
                                            className="btn-prism btn-prism-primary"
                                        >
                                            {processing ? 'Processing...' : 'Add Funds'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="store-section">
                            <h3>🛍️ Premium Store</h3>
                            <div className="store-grid">
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/premium-filter.png" alt="Premium Filter Pack" />
                                        <span className="item-category">Filters</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>Premium Filter Pack</h4>
                                        <p className="item-description">Exclusive beauty filters and effects for your streams</p>
                                        <div className="item-footer">
                                            <span className="item-price">$4.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/custom-emotes.png" alt="Custom Emote Pack" />
                                        <span className="item-category">Emotes</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>Custom Emote Pack</h4>
                                        <p className="item-description">Unique animated emotes for chat interactions</p>
                                        <div className="item-footer">
                                            <span className="item-price">$7.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/premium-themes.png" alt="Premium Theme Pack" />
                                        <span className="item-category">Themes</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>Premium Theme Pack</h4>
                                        <p className="item-description">Dark and light premium themes for the interface</p>
                                        <div className="item-footer">
                                            <span className="item-price">$12.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/vip-badge.png" alt="VIP Badge" />
                                        <span className="item-category">Badge</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>VIP Badge</h4>
                                        <p className="item-description">Special VIP badge displayed next to your username</p>
                                        <div className="item-footer">
                                            <span className="item-price">$19.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="transactions-section">
                            <h3>📊 Transaction History</h3>
                            <div className="transactions-list">
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">💰</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Wallet Top-up</p>
                                            <p className="transaction-date">7/24/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount positive">
                                        +$50.00
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">🛒</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Premium Filter Pack</p>
                                            <p className="transaction-date">7/23/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount negative">
                                        -$4.99
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">💸</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Subscription: Premium Plan</p>
                                            <p className="transaction-date">7/22/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount negative">
                                        -$19.99
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">🛒</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Custom Emote Pack</p>
                                            <p className="transaction-date">7/21/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount negative">
                                        -$7.99
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">💰</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Wallet Top-up</p>
                                            <p className="transaction-date">7/20/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount positive">
                                        +$25.00
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            
            // Enhanced Social Interactions Component
            function SocialInteractions({ contentId, user }) {
                const [comments, setComments] = useState([]);
                const [likes, setLikes] = useState(0);
                const [isLiked, setIsLiked] = useState(false);
                const [newComment, setNewComment] = useState('');
                const [loading, setLoading] = useState(true);
                const [sharing, setSharing] = useState(false);
                
                useEffect(() => {
                    loadSocialData();
                }, [contentId]);
                
                const loadSocialData = async () => {
                    try {
                        const [commentsRes, likesRes] = await Promise.all([
                            fetch('/api/content/' + contentId + '/comments'),
                            fetch('/api/content/' + contentId + '/likes', {
                                headers: user ? {
                                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                                } : {}
                            })
                        ]);
                        
                        if (commentsRes.ok) {
                            const commentsData = await commentsRes.json();
                            setComments(commentsData.comments || []);
                        }
                        
                        if (likesRes.ok) {
                            const likesData = await likesRes.json();
                            setLikes(likesData.count || 0);
                            setIsLiked(likesData.isLiked || false);
                        }
                    } catch (error) {
                        console.error('Failed to load social data:', error);
                    } finally {
                        setLoading(false);
                    }
                };
                
                const handleLike = async () => {
                    if (!user) {
                        alert('Please sign in to like content');
                        return;
                    }
                    
                    try {
                        const response = await fetch('/api/content/' + contentId + '/like', {
                            method: isLiked ? 'DELETE' : 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        });
                        
                        if (response.ok) {
                            setIsLiked(!isLiked);
                            setLikes(prev => isLiked ? prev - 1 : prev + 1);
                        }
                    } catch (error) {
                        console.error('Like error:', error);
                    }
                };
                
                const handleComment = async (e) => {
                    e.preventDefault();
                    if (!user || !newComment.trim()) return;
                    
                    try {
                        const response = await fetch('/api/content/' + contentId + '/comments', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ text: newComment.trim() })
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            setComments(prev => [data.comment, ...prev]);
                            setNewComment('');
                        }
                    } catch (error) {
                        console.error('Comment error:', error);
                    }
                };
                
                const handleShare = async (platform) => {
                    setSharing(true);
                    try {
                        const shareUrl = window.location.href;
                        const shareText = 'Check out this amazing content on PRISM!';
                        
                        if (platform === 'native' && navigator.share) {
                            await navigator.share({
                                title: shareText,
                                url: shareUrl
                            });
                        } else {
                            let shareLink = '';
                            switch (platform) {
                                case 'twitter':
                                    shareLink = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(shareUrl);
                                    break;
                                case 'facebook':
                                    shareLink = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl);
                                    break;
                                case 'copy':
                                    await navigator.clipboard.writeText(shareUrl);
                                    alert('Link copied to clipboard!');
                                    return;
                            }
                            if (shareLink) window.open(shareLink, '_blank');
                        }
                    } catch (error) {
                        console.error('Share error:', error);
                    } finally {
                        setSharing(false);
                    }
                };
                
                if (loading) {
                    return (
                        <div className="social-loading">
                            <div className="prism-spin"></div>
                        </div>
                    );
                }
                
                return (
                    <div className="social-interactions">
                        <div className="social-actions">
                            <button
                                onClick={handleLike}
                                className={'social-btn like-btn ' + (isLiked ? 'liked' : '')}
                                disabled={!user}
                            >
                                <span className="social-icon">{isLiked ? '❤️' : '🤍'}</span>
                                <span className="social-count">{likes}</span>
                            </button>
                            
                            <button className="social-btn comment-btn">
                                <span className="social-icon">💬</span>
                                <span className="social-count">{comments.length}</span>
                            </button>
                            
                            <div className="share-dropdown">
                                <button className="social-btn share-btn" disabled={sharing}>
                                    <span className="social-icon">📤</span>
                                    <span>Share</span>
                                </button>
                                <div className="share-menu">
                                    {navigator.share && (
                                        <button onClick={() => handleShare('native')}>📱 Share</button>
                                    )}
                                    <button onClick={() => handleShare('twitter')}>🐦 Twitter</button>
                                    <button onClick={() => handleShare('facebook')}>📘 Facebook</button>
                                    <button onClick={() => handleShare('copy')}>📋 Copy Link</button>
                                </div>
                            </div>
                        </div>
                        
                        {user && (
                            <form onSubmit={handleComment} className="comment-form">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="comment-input"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newComment.trim()}
                                    className="comment-submit"
                                >
                                    Post
                                </button>
                            </form>
                        )}
                        
                        <div className="comments-section">
                            {comments.length === 0 ? (
                                <p className="no-comments">No comments yet. Be the first to comment!</p>
                            ) : (
                                <div className="comments-list">
                                    {comments.map(comment => (
                                        <div key={comment._id} className="comment-item">
                                            <img 
                                                src={comment.user.avatar || '/assets/default-avatar.png'} 
                                                alt={comment.user.displayName}
                                                className="comment-avatar"
                                            />
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.user.displayName}</span>
                                                    <span className="comment-time">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            
            // User Profile Management Component
            function UserProfile({ user, onUpdate }) {
                const [profile, setProfile] = useState(user);
                const [editing, setEditing] = useState(false);
                const [loading, setLoading] = useState(false);
                const [stats, setStats] = useState({
                    watchTime: 0,
                    subscriptions: 0,
                    liked: 0,
                    downloaded: 0
                });
                
                useEffect(() => {
                    loadUserStats();
                }, []);
                
                const loadUserStats = async () => {
                    try {
                        const response = await fetch('/api/user/stats', {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setStats(data.stats || stats);
                        }
                    } catch (error) {
                        console.error('Failed to load user stats:', error);
                    }
                };
                
                const handleSave = async () => {
                    setLoading(true);
                    try {
                        const response = await fetch('/api/user/profile', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify(profile)
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            onUpdate(data.user);
                            setEditing(false);
                        } else {
                            alert('Failed to update profile. Please try again.');
                        }
                    } catch (error) {
                        console.error('Profile update error:', error);
                        alert('Failed to update profile. Please try again.');
                    } finally {
                        setLoading(false);
                    }
                };
                
                const formatWatchTime = (minutes) => {
                    const hours = Math.floor(minutes / 60);
                    const mins = minutes % 60;
                    return hours + 'h ' + mins + 'm';
                };
                
                return (
                    <div className="user-profile">
                        <div className="section-header">
                            <h2>👤 Your Profile</h2>
                            <p>Manage your account settings and view your activity</p>
                        </div>
                        
                        <div className="profile-content">
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="avatar-section">
                                        <img 
                                            src={profile.avatar || '/assets/default-avatar.png'} 
                                            alt={profile.displayName}
                                            className="profile-avatar-large"
                                        />
                                        {editing && (
                                            <button className="change-avatar-btn">
                                                📷 Change Photo
                                            </button>
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        {editing ? (
                                            <div className="edit-form">
                                                <input
                                                    type="text"
                                                    value={profile.displayName}
                                                    onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                                                    placeholder="Display Name"
                                                    className="input-prism"
                                                />
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                    placeholder="Email"
                                                    className="input-prism"
                                                />
                                                <textarea
                                                    value={profile.bio || ''}
                                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                                    placeholder="Tell us about yourself..."
                                                    className="input-prism"
                                                    rows="3"
                                                />
                                            </div>
                                        ) : (
                                            <div className="profile-display">
                                                <h3>{profile.displayName}</h3>
                                                <p className="profile-email">{profile.email}</p>
                                                <p className="profile-username">@{profile.username}</p>
                                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                                                <p className="member-since">
                                                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-actions">
                                        {editing ? (
                                            <div className="edit-actions">
                                                <button
                                                    onClick={() => {
                                                        setProfile(user);
                                                        setEditing(false);
                                                    }}
                                                    className="btn-prism btn-prism-ghost"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className="btn-prism btn-prism-primary"
                                                >
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditing(true)}
                                                className="btn-prism btn-prism-primary"
                                            >
                                                ✏️ Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profile-stats">
                                <h3>📊 Your Activity</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon">⏱️</div>
                                        <div className="stat-value">{formatWatchTime(stats.watchTime)}</div>
                                        <div className="stat-label">Watch Time</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">📺</div>
                                        <div className="stat-value">{stats.subscriptions}</div>
                                        <div className="stat-label">Subscriptions</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">❤️</div>
                                        <div className="stat-value">{stats.liked}</div>
                                        <div className="stat-label">Liked Videos</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">⬇️</div>
                                        <div className="stat-value">{stats.downloaded}</div>
                                        <div className="stat-label">Downloads</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profile-preferences">
                                <h3>⚙️ Preferences</h3>
                                <div className="preferences-grid">
                                    <div className="preference-item">
                                        <label>
                                            <input type="checkbox" defaultChecked />
                                            <span>Email notifications</span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <label>
                                            <input type="checkbox" defaultChecked />
                                            <span>Push notifications</span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <label>
                                            <input type="checkbox" />
                                            <span>Auto-play videos</span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <label>
                                            <input type="checkbox" defaultChecked />
                                            <span>Dark mode</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // NotificationCenter Component
            function NotificationCenter({ user }) {
                const [notifications, setNotifications] = React.useState([]);
                const [loading, setLoading] = React.useState(false);

                React.useEffect(() => {
                    if (user) {
                        // Simulate loading notifications
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                        }, 500);
                    }
                }, [user]);

                return (
                    <div className="notifications-container">
                        <h3>🔔 Notifications</h3>
                        <div className="notifications-list">
                            <div className="notification-item">
                                <div className="notification-content">
                                    <h4>Welcome to PRISM!</h4>
                                    <p>Your account has been successfully created.</p>
                                    <span className="notification-time">2 hours ago</span>
                                </div>
                            </div>
                            <div className="notification-item">
                                <div className="notification-content">
                                    <h4>New Content Available</h4>
                                    <p>Sarah Content has uploaded a new video.</p>
                                    <span className="notification-time">5 hours ago</span>
                                </div>
                            </div>
                            <div className="notification-item">
                                <div className="notification-content">
                                    <h4>Payment Processed</h4>
                                    <p>Your subscription payment was successful.</p>
                                    <span className="notification-time">1 day ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // Content Discovery Component
            function ContentDiscovery() {
                const featuredContent = [
                    {
                        _id: 'demo1',
                        title: 'Gaming Highlights 2025',
                        description: 'Best gaming moments and epic wins compilation.',
                        category: 'Gaming',
                        views: 1523,
                        duration: '15:42',
                        thumbnail: '/assets/gaming-thumb.jpg',
                        creator: {
                            name: 'ProGamer',
                            avatar: '/assets/creator1.jpg'
                        }
                    },
                    {
                        _id: 'demo2',
                        title: 'Beauty Tips & Tricks',
                        description: 'Professional makeup tutorials and skincare advice.',
                        category: 'Beauty',
                        views: 2847,
                        duration: '22:15',
                        thumbnail: '/assets/beauty-thumb.jpg',
                        creator: {
                        }
                    },
                    {
                        _id: 'demo3',
                        title: 'Creator Tools Overview',
                        description: 'Explore the powerful tools available for content creators.',
                        category: 'Education',
                        views: 890,
                        duration: '18:30',
                        thumbnail: '/assets/education-thumb.jpg',
                        creator: {
                            name: 'PRISM Team',
                            avatar: '/assets/prism-logo.jpg'
                        }
                    }
                ];

                return (
                    <div className="content-discovery">
                        <h3>🎬 Featured Content</h3>
                        <div className="content-grid">
                            {featuredContent.map(content => (
                                <div key={content._id} className="content-card">
                                    <div className="content-thumbnail">
                                        <img src={content.thumbnail} alt={content.title} />
                                        <span className="content-duration">{content.duration}</span>
                                    </div>
                                    <div className="content-info">
                                        <h4>{content.title}</h4>
                                        <p>{content.description}</p>
                                        <div className="content-meta">
                                            <span className="category">{content.category}</span>
                                            <span className="views">{content.views.toLocaleString()} views</span>
                                        </div>
                                        <div className="creator-info">
                                            <img src={content.creator.avatar} alt={content.creator.name} />
                                            <span>{content.creator.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            // WalletManager Component
            function WalletManager({ user }) {
                const [wallet, setWallet] = React.useState({
                    balance: 42.50,
                    currency: 'USD'
                });
                const [processing, setProcessing] = React.useState(false);

                return (
                    <div className="wallet-manager">
                        <div className="wallet-header">
                            <h3>💰 Digital Wallet</h3>
                            <div className="wallet-balance">
                                <span className="balance-amount">$42.50</span>
                                <span className="balance-currency">USD</span>
                            </div>
                        </div>
                        
                        <div className="wallet-actions">
                            <button className="btn-prism btn-prism-primary">
                                💳 Add Funds
                            </button>
                            <button className="btn-prism btn-prism-secondary">
                                📊 View History
                            </button>
                        </div>

                        {/* Subscriptions Section */}
                        <div className="subscriptions-section">
                            <h3>📺 Active Subscriptions</h3>
                            <div className="subscriptions-list">
                                <div className="subscription-card">
                                    <div className="creator-info">
                                        <img 
                                            src="/assets/default-avatar.png" 
                                            alt="Sarah Content"
                                            className="creator-avatar"
                                        />
                                        <div>
                                            <h4>Sarah Content</h4>
                                            <p className="subscription-type">Premium Plan</p>
                                            <p className="subscription-price">$19.99/month</p>
                                        </div>
                                    </div>
                                    <div className="subscription-status">
                                        <span className="status-badge active">
                                            active
                                        </span>
                                        <p className="next-billing">
                                            Next billing: 8/24/2025
                                        </p>
                                    </div>
                                    <button className="btn-prism btn-prism-danger btn-prism-sm">
                                        Unsubscribe
                                    </button>
                                </div>
                                <div className="subscription-card">
                                    <div className="creator-info">
                                        <img 
                                            src="/assets/default-avatar.png" 
                                            alt="Mike Streams"
                                            className="creator-avatar"
                                        />
                                        <div>
                                            <h4>Mike Streams</h4>
                                            <p className="subscription-type">Basic Plan</p>
                                            <p className="subscription-price">$9.99/month</p>
                                        </div>
                                    </div>
                                    <div className="subscription-status">
                                        <span className="status-badge active">
                                            active
                                        </span>
                                        <p className="next-billing">
                                            Next billing: 8/10/2025
                                        </p>
                                    </div>
                                    <button className="btn-prism btn-prism-danger btn-prism-sm">
                                        Unsubscribe
                                    </button>
                                </div>
                                <div className="subscription-card">
                                    <div className="creator-info">
                                        <img 
                                            src="/assets/default-avatar.png" 
                                            alt="Lisa Gaming"
                                            className="creator-avatar"
                                        />
                                        <div>
                                            <h4>Lisa Gaming</h4>
                                            <p className="subscription-type">VIP Plan</p>
                                            <p className="subscription-price">$49.99/month</p>
                                        </div>
                                    </div>
                                    <div className="subscription-status">
                                        <span className="status-badge active">
                                            active
                                        </span>
                                        <p className="next-billing">
                                            Next billing: 8/15/2025
                                        </p>
                                    </div>
                                    <button className="btn-prism btn-prism-danger btn-prism-sm">
                                        Unsubscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Available Plans */}
                        <div className="available-plans">
                            <h3>💎 Available Premium Plans</h3>
                            <div className="plans-grid">
                                <div className="plan-card">
                                    <div className="plan-header">
                                        <h4>Basic Plan</h4>
                                        <div className="plan-price">
                                            <span className="price">$9.99</span>
                                            <span className="period">/month</span>
                                        </div>
                                    </div>
                                    <div className="plan-features">
                                        <ul>
                                            <li>✓ HD Video Quality</li>
                                            <li>✓ Basic Chat Features</li>
                                            <li>✓ Mobile Access</li>
                                        </ul>
                                    </div>
                                    <button className="btn-prism btn-prism-primary">
                                        Subscribe
                                    </button>
                                </div>
                                <div className="plan-card">
                                    <div className="plan-header">
                                        <h4>Premium Plan</h4>
                                        <div className="plan-price">
                                            <span className="price">$19.99</span>
                                            <span className="period">/month</span>
                                        </div>
                                    </div>
                                    <div className="plan-features">
                                        <ul>
                                            <li>✓ 4K Video Quality</li>
                                            <li>✓ Advanced Chat Features</li>
                                            <li>✓ All Device Access</li>
                                            <li>✓ Exclusive Content</li>
                                        </ul>
                                    </div>
                                    <button className="btn-prism btn-prism-primary">
                                        Subscribe
                                    </button>
                                </div>
                                <div className="plan-card">
                                    <div className="plan-header">
                                        <h4>VIP Plan</h4>
                                        <div className="plan-price">
                                            <span className="price">$39.99</span>
                                            <span className="period">/month</span>
                                        </div>
                                    </div>
                                    <div className="plan-features">
                                        <ul>
                                            <li>✓ 8K Video Quality</li>
                                            <li>✓ Priority Support</li>
                                            <li>✓ Private Messaging</li>
                                            <li>✓ Early Access Content</li>
                                            <li>✓ Custom Requests</li>
                                        </ul>
                                    </div>
                                    <button className="btn-prism btn-prism-primary">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="store-section">
                            <h3>🛍️ Premium Store</h3>
                            <div className="store-grid">
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/premium-filter.png" alt="Premium Filter Pack" />
                                        <span className="item-category">Filters</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>Premium Filter Pack</h4>
                                        <p className="item-description">Exclusive beauty filters and effects for your streams</p>
                                        <div className="item-footer">
                                            <span className="item-price">$4.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/custom-emotes.png" alt="Custom Emote Pack" />
                                        <span className="item-category">Emotes</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>Custom Emote Pack</h4>
                                        <p className="item-description">Unique animated emotes for chat interactions</p>
                                        <div className="item-footer">
                                            <span className="item-price">$7.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/premium-themes.png" alt="Premium Theme Pack" />
                                        <span className="item-category">Themes</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>Premium Theme Pack</h4>
                                        <p className="item-description">Dark and light premium themes for the interface</p>
                                        <div className="item-footer">
                                            <span className="item-price">$12.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="store-item">
                                    <div className="item-image">
                                        <img src="/assets/vip-badge.png" alt="VIP Badge" />
                                        <span className="item-category">Badge</span>
                                    </div>
                                    <div className="item-info">
                                        <h4>VIP Badge</h4>
                                        <p className="item-description">Special VIP badge displayed next to your username</p>
                                        <div className="item-footer">
                                            <span className="item-price">$19.99</span>
                                            <button className="btn-prism btn-prism-primary btn-prism-sm">
                                                Purchase
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="transactions-section">
                            <h3>📊 Transaction History</h3>
                            <div className="transactions-list">
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">💰</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Wallet Top-up</p>
                                            <p className="transaction-date">7/24/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount positive">
                                        +$50.00
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">🛒</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Premium Filter Pack</p>
                                            <p className="transaction-date">7/23/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount negative">
                                        -$4.99
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">💸</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Subscription: Premium Plan</p>
                                            <p className="transaction-date">7/22/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount negative">
                                        -$19.99
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">🛒</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Custom Emote Pack</p>
                                            <p className="transaction-date">7/21/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount negative">
                                        -$7.99
                                    </div>
                                </div>
                                <div className="transaction-item">
                                    <div className="transaction-info">
                                        <span className="transaction-type">💰</span>
                                        <div className="transaction-details">
                                            <p className="transaction-description">Wallet Top-up</p>
                                            <p className="transaction-date">7/20/2025</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount positive">
                                        +$25.00
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // Main App Component
            function App() {
                const [user, setUser] = React.useState(null);
                const [loading, setLoading] = React.useState(true);
                const [showAuth, setShowAuth] = React.useState(false);
                const [authType, setAuthType] = React.useState('login');

                React.useEffect(() => {
                    // Check for existing authentication and validate token
                    const validateToken = async () => {
                        const savedToken = localStorage.getItem('prism-token');
                        const savedUser = localStorage.getItem('prism-user');
                        
                        if (savedToken && savedUser) {
                            try {
                                // Validate token with API
                                const response = await fetch('http://localhost:3004/api/auth/profile', {
                                    headers: {
                                        'Authorization': \`Bearer \${savedToken}\`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                
                                if (response.ok) {
                                    const data = await response.json();
                                    setUser(data.user);
                                } else {
                                    // Token is invalid, clear storage
                                    localStorage.removeItem('prism-token');
                                    localStorage.removeItem('prism-user');
                                    setUser(null);
                                }
                            } catch (error) {
                                console.error('Token validation error:', error);
                                // If API is not available, use saved data as fallback
                                try {
                                    const userData = JSON.parse(savedUser);
                                    setUser(userData);
                                } catch (parseError) {
                                    console.error('Error parsing saved user data:', parseError);
                                    localStorage.removeItem('prism-token');
                                    localStorage.removeItem('prism-user');
                                }
                            }
                        }
                        
                        setLoading(false);
                    };
                    
                    validateToken();
                }, []);

                const handleLogin = (type = 'login') => {
                    setAuthType(type);
                    setShowAuth(true);
                };

                const handleLogout = () => {
                    localStorage.removeItem('prism-token');
                    localStorage.removeItem('prism-user');
                    setUser(null);
                };

                const handleAuthSuccess = (userData) => {
                    setUser(userData);
                    setShowAuth(false);
                };

                if (loading) {
                    return (
                        <div className="loading-screen" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100vh',
                            background: 'var(--prism-black)',
                            color: 'var(--prism-white)'
                        }}>
                            <div className="loading-spinner" style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid var(--prism-gray-700)',
                                borderTop: '4px solid var(--prism-purple)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '16px'
                            }}></div>
                            <p style={{fontSize: '18px', color: 'var(--prism-gray-400)'}}>Loading PRISM...</p>
                        </div>
                    );
                }

                return (
                    <div className="app">
                        <Header 
                            user={user} 
                            onLogin={handleLogin}
                            onLogout={handleLogout}
                            searchQuery=""
                            onSearchChange={() => {}}
                            searchFilters={{type: 'all', duration: 'all', quality: 'all', sortBy: 'recent'}}
                            onFiltersChange={() => {}}
                            notifications={[]}
                            unreadCount={0}
                            showNotifications={false}
                            onToggleNotifications={() => {}}
                            currentView="feed"
                            onViewChange={() => {}}
                        />
                        <main className="main-content">
                            {!user && (
                                <div className="hero-section" style={{
                                    textAlign: 'center',
                                    padding: '80px 20px',
                                    background: 'linear-gradient(135deg, var(--prism-black) 0%, var(--prism-gray-900) 100%)',
                                    marginBottom: '40px'
                                }}>
                                    <h1 className="gradient-text" style={{
                                        fontSize: '3rem',
                                        fontWeight: 'bold',
                                        marginBottom: '20px'
                                    }}>
                                        Welcome to PRISM
                                    </h1>
                                    <p style={{
                                        fontSize: '1.25rem',
                                        color: 'var(--prism-gray-400)',
                                        marginBottom: '40px',
                                        maxWidth: '600px',
                                        margin: '0 auto 40px'
                                    }}>
                                        Discover amazing content, connect with creators, and enjoy premium entertainment
                                    </p>
                                    <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
                                        <button 
                                            onClick={() => handleLogin('register')}
                                            className="btn-prism btn-prism-primary"
                                            style={{fontSize: '18px', padding: '12px 32px'}}
                                        >
                                            🚀 Get Started
                                        </button>
                                        <button 
                                            onClick={() => handleLogin('login')}
                                            className="btn-prism btn-prism-secondary"
                                            style={{fontSize: '18px', padding: '12px 32px'}}
                                        >
                                            🔑 Sign In
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <ContentDiscovery />
                            
                            {user && (
                                <>
                                    <WalletManager user={user} />
                                    <SocialInteractions contentId="demo1" user={user} />
                                    <NotificationCenter user={user} />
                                </>
                            )}
                        </main>
                        
                        <LoginModal
                            isOpen={showAuth}
                            type={authType}
                            onClose={() => setShowAuth(false)}
                            onSuccess={handleAuthSuccess}
                        />
                    </div>
                );
            }

            // Render App
            ReactDOM.render(<App />, document.getElementById('root'));
        </script>
    </body>
</html>
  `);
});

// API proxy for development
app.use('/api', (req, res) => {
  res.json({ 
    message: 'Consumer frontend - API requests should go to localhost:3004',
    apiUrl: 'http://localhost:3004/api',
    requested: req.originalUrl 
  });
});

// Start server
const PORT = process.env.CONSUMER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎬 PRISM Consumer Frontend running on http://localhost:${PORT}`);
  console.log(`🔗 API Server: http://localhost:${process.env.API_PORT || 3004}`);
  console.log(`🔗 Creator Studio: http://localhost:${process.env.CREATOR_PORT || 3001}`);
  console.log(`✨ Features: Content Discovery, Feed, Authentication, Responsive Design`);
});
