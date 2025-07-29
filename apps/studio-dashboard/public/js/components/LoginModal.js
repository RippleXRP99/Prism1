// Studio Login Modal Component
function StudioLoginModal({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [studioName, setStudioName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const credentials = isLogin 
                ? { email, password }
                : { email, password, studioName };
                
            const result = await window.studioAPI.authenticateStudio(credentials);
            
            if (result.success) {
                // Store studio data - the backend returns studio data in result.message
                const studioData = result.message || result.data;
                localStorage.setItem('prism-studio-token', studioData.token);
                localStorage.setItem('prism-studio-data', JSON.stringify(studioData));
                onLoginSuccess(studioData);
            } else {
                setError(result.error || 'Authentication failed');
            }
        } catch (error) {
            setError('An error occurred during authentication');
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', {
        className: 'modal-studio animate-in'
    }, [
        React.createElement('div', {
            key: 'modal-content',
            className: 'modal-content-studio'
        }, [
            React.createElement('div', {
                key: 'header',
                style: { textAlign: 'center', marginBottom: 'var(--prism-space-xl)' }
            }, [
                React.createElement('h2', {
                    key: 'title',
                    className: 'gradient-studio',
                    style: { fontSize: 'var(--prism-text-3xl)', marginBottom: 'var(--prism-space-sm)' }
                }, '🏢 PRISM Studio Dashboard'),
                React.createElement('p', {
                    key: 'subtitle',
                    style: { color: 'var(--prism-gray-400)' }
                }, isLogin ? 'Melden Sie sich in Ihr Studio-Dashboard an' : 'Registrieren Sie Ihr Studio')
            ]),

            React.createElement('form', {
                key: 'form',
                onSubmit: handleSubmit
            }, [
                !isLogin && React.createElement('div', {
                    key: 'studio-name',
                    style: { marginBottom: 'var(--prism-space-lg)' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { 
                            display: 'block', 
                            marginBottom: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            fontWeight: '600'
                        }
                    }, 'Studio Name'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: studioName,
                        onChange: (e) => setStudioName(e.target.value),
                        className: 'input-studio',
                        placeholder: 'Ihr Studio Name',
                        required: !isLogin
                    })
                ]),

                React.createElement('div', {
                    key: 'email',
                    style: { marginBottom: 'var(--prism-space-lg)' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { 
                            display: 'block', 
                            marginBottom: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            fontWeight: '600'
                        }
                    }, 'E-Mail'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'email',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        className: 'input-studio',
                        placeholder: 'studio@example.com',
                        required: true
                    })
                ]),

                React.createElement('div', {
                    key: 'password',
                    style: { marginBottom: 'var(--prism-space-xl)' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { 
                            display: 'block', 
                            marginBottom: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            fontWeight: '600'
                        }
                    }, 'Passwort'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'password',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        className: 'input-studio',
                        placeholder: '••••••••',
                        required: true
                    })
                ]),

                error && React.createElement('div', {
                    key: 'error',
                    style: {
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--prism-error)',
                        borderRadius: 'var(--prism-radius-md)',
                        padding: 'var(--prism-space-md)',
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--prism-error)'
                    }
                }, error),

                React.createElement('button', {
                    key: 'submit',
                    type: 'submit',
                    className: 'btn-studio',
                    disabled: isLoading,
                    style: { 
                        width: '100%',
                        marginBottom: 'var(--prism-space-lg)',
                        opacity: isLoading ? 0.7 : 1
                    }
                }, isLoading ? 'Wird verarbeitet...' : (isLogin ? 'Anmelden' : 'Studio Registrieren')),

                React.createElement('div', {
                    key: 'toggle',
                    style: { textAlign: 'center' }
                }, [
                    React.createElement('span', {
                        key: 'text',
                        style: { color: 'var(--prism-gray-400)' }
                    }, isLogin ? 'Noch kein Studio? ' : 'Bereits registriert? '),
                    React.createElement('a', {
                        key: 'link',
                        onClick: () => setIsLogin(!isLogin),
                        style: {
                            color: 'var(--studio-primary)',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }
                    }, isLogin ? 'Hier registrieren' : 'Hier anmelden')
                ])
            ])
        ])
    ]);
}
