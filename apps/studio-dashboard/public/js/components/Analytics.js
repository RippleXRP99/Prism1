// Studio Analytics Component
function StudioAnalytics({ studio }) {
    const [analytics, setAnalytics] = React.useState({
        overview: {
            totalRevenue: 0,
            monthlyRevenue: 0,
            avgCommission: 20,
            totalCreators: 0
        },
        performance: [],
        topCreators: []
    });
    const [period, setPeriod] = React.useState('30d');
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        loadAnalytics();
    }, [studio, period]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const result = await window.studioAPI.getStudioAnalytics(studio.id, period);
            if (result.success) {
                setAnalytics(result.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return React.createElement('div', {
            style: { textAlign: 'center', padding: 'var(--prism-space-3xl)' }
        }, [
            React.createElement('div', { key: 'spinner', className: 'loading-spinner' }),
            React.createElement('p', { 
                key: 'text', 
                style: { marginTop: 'var(--prism-space-lg)', color: 'var(--prism-gray-400)' }
            }, 'Lade Analytics...')
        ]);
    }

    return React.createElement('div', {
        className: 'animate-in'
    }, [
        React.createElement('div', {
            key: 'header',
            style: { 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--prism-space-2xl)'
            }
        }, [
            React.createElement('div', { key: 'title-section' }, [
                React.createElement('h1', {
                    key: 'title',
                    className: 'gradient-studio',
                    style: { fontSize: 'var(--prism-text-3xl)', marginBottom: 'var(--prism-space-sm)' }
                }, '📊 Studio Analytics'),
                React.createElement('p', {
                    key: 'subtitle',
                    style: { color: 'var(--prism-gray-400)' }
                }, 'Performance-Insights und Trends')
            ]),

            React.createElement('select', {
                key: 'period-select',
                value: period,
                onChange: (e) => setPeriod(e.target.value),
                className: 'input-studio',
                style: { width: '150px' }
            }, [
                React.createElement('option', { key: '7d', value: '7d' }, 'Letzte 7 Tage'),
                React.createElement('option', { key: '30d', value: '30d' }, 'Letzte 30 Tage'),
                React.createElement('option', { key: '90d', value: '90d' }, 'Letzte 90 Tage'),
                React.createElement('option', { key: '1y', value: '1y' }, 'Letztes Jahr')
            ])
        ]),

        React.createElement('div', {
            key: 'overview',
            className: 'stats-grid'
        }, [
            React.createElement('div', {
                key: 'total-revenue',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--prism-success)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, `€${analytics.overview.totalRevenue.toLocaleString()}`),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Gesamt-Umsatz')
            ]),

            React.createElement('div', {
                key: 'monthly-revenue',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--studio-accent)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, `€${analytics.overview.monthlyRevenue.toLocaleString()}`),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Monatlicher Umsatz')
            ]),

            React.createElement('div', {
                key: 'avg-commission',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--studio-primary)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, `${analytics.overview.avgCommission}%`),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Ø Kommission')
            ]),

            React.createElement('div', {
                key: 'total-creators',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--prism-info)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, analytics.overview.totalCreators),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Aktive Creator')
            ])
        ]),

        React.createElement('div', {
            key: 'detailed-analytics',
            className: 'feature-grid',
            style: { marginTop: 'var(--prism-space-2xl)' }
        }, [
            React.createElement('div', {
                key: 'top-creators',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--studio-primary)'
                    }
                }, '🏆 Top Creator'),
                
                analytics.topCreators.length > 0 ? 
                    analytics.topCreators.slice(0, 5).map((creator, index) =>
                        React.createElement('div', {
                            key: creator.id,
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--prism-space-md)',
                                borderRadius: 'var(--prism-radius-md)',
                                background: index === 0 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                marginBottom: 'var(--prism-space-sm)'
                            }
                        }, [
                            React.createElement('div', { key: 'info' }, [
                                React.createElement('div', {
                                    key: 'name',
                                    style: { 
                                        fontWeight: '600',
                                        color: index === 0 ? 'var(--studio-primary)' : 'var(--prism-gray-300)'
                                    }
                                }, `${index + 1}. ${creator.name}`),
                                React.createElement('div', {
                                    key: 'category',
                                    style: { 
                                        fontSize: 'var(--prism-text-sm)',
                                        color: 'var(--prism-gray-400)'
                                    }
                                }, creator.category)
                            ]),
                            React.createElement('div', {
                                key: 'earnings',
                                style: { 
                                    fontWeight: '600',
                                    color: 'var(--prism-success)'
                                }
                            }, `€${creator.earnings.toLocaleString()}`)
                        ])
                    ) :
                    React.createElement('p', {
                        key: 'no-data',
                        style: { 
                            textAlign: 'center',
                            color: 'var(--prism-gray-400)',
                            padding: 'var(--prism-space-xl)'
                        }
                    }, 'Keine Daten verfügbar')
            ]),

            React.createElement('div', {
                key: 'performance-chart',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--studio-primary)'
                    }
                }, '📈 Performance Trend'),
                
                React.createElement('div', {
                    key: 'chart-placeholder',
                    style: {
                        height: '200px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--prism-radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--prism-gray-400)'
                    }
                }, 'Performance Chart wird geladen...')
            ])
        ])
    ]);
}
