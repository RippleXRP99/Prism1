// Simple Creator Settings Component
function CreatorSettings({ user, setActiveTab }) {
    return React.createElement('div', {
        className: 'animate-in'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'header'
        }, [
            React.createElement('h1', {
                key: 'title',
                className: 'gradient-text'
            }, '⚙️ Creator Einstellungen'),
            React.createElement('p', {
                key: 'subtitle'
            }, 'Verwalten Sie Ihr Profil und Einstellungen')
        ]),
        
        React.createElement('div', {
            key: 'content',
            className: 'card-prism'
        }, [
            React.createElement('h3', {
                key: 'profile-title',
                style: {
                    fontSize: 'var(--prism-text-lg)',
                    fontWeight: '600',
                    color: 'var(--prism-gray-100)',
                    marginBottom: 'var(--prism-space-md)'
                }
            }, '👤 Profil Einstellungen'),
            
            React.createElement('div', {
                key: 'profile-form',
                style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
            }, [
                React.createElement('div', {
                    key: 'name-field',
                    style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                }, [
                    React.createElement('label', {
                        key: 'name-label',
                        style: { color: 'var(--prism-gray-300)', fontSize: 'var(--prism-text-sm)' }
                    }, 'Name'),
                    React.createElement('input', {
                        key: 'name-input',
                        type: 'text',
                        defaultValue: user?.name || '',
                        placeholder: 'Ihr Name...',
                        style: {
                            padding: '8px 12px',
                            background: 'var(--prism-gray-800)',
                            border: '1px solid var(--prism-gray-700)',
                            borderRadius: '6px',
                            color: 'var(--prism-gray-100)',
                            fontSize: 'var(--prism-text-sm)'
                        }
                    })
                ]),
                
                React.createElement('div', {
                    key: 'email-field',
                    style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                }, [
                    React.createElement('label', {
                        key: 'email-label',
                        style: { color: 'var(--prism-gray-300)', fontSize: 'var(--prism-text-sm)' }
                    }, 'E-Mail'),
                    React.createElement('input', {
                        key: 'email-input',
                        type: 'email',
                        defaultValue: user?.email || '',
                        placeholder: 'ihre@email.com',
                        style: {
                            padding: '8px 12px',
                            background: 'var(--prism-gray-800)',
                            border: '1px solid var(--prism-gray-700)',
                            borderRadius: '6px',
                            color: 'var(--prism-gray-100)',
                            fontSize: 'var(--prism-text-sm)'
                        }
                    })
                ]),
                
                React.createElement('button', {
                    key: 'save-btn',
                    className: 'btn-prism',
                    onClick: () => {
                        alert('Einstellungen gespeichert!');
                    },
                    style: {
                        padding: '12px 24px',
                        marginTop: 'var(--prism-space-md)'
                    }
                }, '💾 Speichern')
            ])
        ])
    ]);
}

// Export the component
window.CreatorSettings = CreatorSettings;
