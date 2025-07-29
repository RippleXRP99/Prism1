// Login Modal Component for Creator Studio
function CreatorLoginModal({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [displayName, setDisplayName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin 
                ? { email, password }
                : { email, password, username, displayName };

            const response = await fetch(`http://localhost:3004${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                // Store authentication data
                localStorage.setItem('prism-token', data.token);
                localStorage.setItem('prism-user', JSON.stringify(data.user));
                
                // If new user, automatically upgrade to creator
                if (!isLogin) {
                    setTimeout(async () => {
                        try {
                            const upgradeResponse = await fetch(`http://localhost:3004/api/admin/users/${data.user.id}/role`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ role: 'creator' })
                            });
                            
                            const upgradeData = await upgradeResponse.json();
                            if (upgradeData.success) {
                                const updatedUser = { ...data.user, role: 'creator' };
                                localStorage.setItem('prism-user', JSON.stringify(updatedUser));
                                onLoginSuccess(updatedUser);
                            } else {
                                onLoginSuccess(data.user);
                            }
                        } catch (error) {
                            console.error('Auto-upgrade failed:', error);
                            onLoginSuccess(data.user);
                        }
                    }, 500);
                } else {
                    onLoginSuccess(data.user);
                }
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError('Network error. Please check if the API server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }
    }, React.createElement('div', {
        style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            borderRadius: '20px',
            color: '#fff',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }
    }, [
        React.createElement('h2', {
            key: 'title',
            style: { textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem' }
        }, isLogin ? 'Login to Creator Studio' : 'Join Creator Studio'),
        
        error && React.createElement('div', {
            key: 'error',
            style: {
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
            }
        }, error),

        React.createElement('form', {
            key: 'form',
            onSubmit: handleSubmit
        }, [
            !isLogin && React.createElement('input', {
                key: 'username',
                type: 'text',
                placeholder: 'Username',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                required: true,
                style: {
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#333'
                }
            }),
            
            !isLogin && React.createElement('input', {
                key: 'displayName',
                type: 'text',
                placeholder: 'Display Name (optional)',
                value: displayName,
                onChange: (e) => setDisplayName(e.target.value),
                style: {
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#333'
                }
            }),
            
            React.createElement('input', {
                key: 'email',
                type: 'email',
                placeholder: 'Email',
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                style: {
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#333'
                }
            }),
            
            React.createElement('input', {
                key: 'password',
                type: 'password',
                placeholder: 'Password',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                style: {
                    width: '100%',
                    padding: '12px',
                    marginBottom: '20px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#333'
                }
            }),
            
            React.createElement('button', {
                key: 'submit',
                type: 'submit',
                disabled: isLoading,
                style: {
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: isLoading ? '#666' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }
            }, isLoading ? '⏳ Loading...' : (isLogin ? '🔑 Login' : '🚀 Create Account')),
            
            React.createElement('p', {
                key: 'toggle',
                style: { textAlign: 'center', margin: 0, opacity: 0.9 }
            }, [
                isLogin ? "Don't have an account? " : "Already have an account? ",
                React.createElement('button', {
                    key: 'toggleBtn',
                    type: 'button',
                    onClick: () => {
                        setIsLogin(!isLogin);
                        setError('');
                    },
                    style: {
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: 'inherit'
                    }
                }, isLogin ? 'Sign up here' : 'Login here')
            ])
        ])
    ]));
}
