// Simple Test Component to verify React is working
function SimpleTest() {
    return React.createElement('div', {
        style: {
            padding: '20px',
            background: '#1a1a1a',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            minHeight: '100vh'
        }
    }, [
        React.createElement('h1', {
            key: 'title',
            style: { color: '#6A0DAD', marginBottom: '20px' }
        }, '🎨 PRISM Creator Studio - Test'),
        React.createElement('p', {
            key: 'status',
            style: { marginBottom: '10px' }
        }, '✅ React is working!'),
        React.createElement('p', {
            key: 'constants',
            style: { marginBottom: '10px' }
        }, `Constants loaded: ${typeof window.navItems !== 'undefined' ? '✅' : '❌'}`),
        React.createElement('p', {
            key: 'nav-count',
            style: { marginBottom: '20px' }
        }, `Navigation items: ${window.navItems?.length || 0}`),
        React.createElement('button', {
            key: 'load-full-app',
            style: {
                padding: '10px 20px',
                background: '#6A0DAD',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
            },
            onClick: () => {
                console.log('Loading full app...');
                const container = document.getElementById('root');
                container.innerHTML = '';
                const root = ReactDOM.createRoot(container);
                root.render(React.createElement(CreatorStudioApp));
            }
        }, 'Load Full Creator Studio')
    ]);
}

// Render test component first
console.log('Starting with test component...');
const container = document.getElementById('root');
if (container) {
    container.innerHTML = '';
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(SimpleTest));
    console.log('Test component rendered');
}
