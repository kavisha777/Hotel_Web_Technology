
import { useState } from 'react';
import Home from './pages/Home';
import AuthModal from './components/AuthModal';

function App() {
    const [authType, setAuthType] = useState(null);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogout = async () => {
        try {
            const { default: api } = await import('./services/api');
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <>
            <Home
                user={user}
                onLogin={() => setAuthType('login')}
                onRegister={() => setAuthType('register')}
                onLogout={handleLogout}
            />

            {authType && (
                <AuthModal
                    type={authType}
                    onClose={() => setAuthType(null)}
                    onSuccess={setUser}
                    onSwitch={() =>
                        setAuthType(
                            authType === 'login' ? 'register' : 'login'
                        )
                    }
                />
            )}
        </>
    );
}

export default App;
