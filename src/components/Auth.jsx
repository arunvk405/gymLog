import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [error, setError] = useState('');

    const { login, signup, loginWithGoogle, loginWithApple } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            console.error("Auth Error:", err);
            let msg = err.message.replace('Firebase: ', '');
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (socialLoading) return;
        setError('');
        setSocialLoading('google');
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error("Google Login Error:", err);
            if (err.code === 'auth/popup-blocked') {
                setError("Popup blocked! Please allow popups for this site.");
            } else if (err.code === 'auth/operation-not-allowed') {
                setError("Google login is not enabled in Firebase Console.");
            } else if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message.replace('Firebase: ', ''));
            }
        } finally {
            setSocialLoading(null);
        }
    };

    const handleAppleLogin = async () => {
        if (socialLoading) return;
        setError('');
        setSocialLoading('apple');
        try {
            await loginWithApple();
        } catch (err) {
            console.error("Apple Login Error:", err);
            if (err.code === 'auth/popup-blocked') {
                setError("Popup blocked! Please allow popups for this site.");
            } else if (err.code === 'auth/operation-not-allowed') {
                setError("Apple login is not enabled in Firebase Console.");
            } else if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message.replace('Firebase: ', ''));
            }
        } finally {
            setSocialLoading(null);
        }
    };

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '1rem' }}>
            <div className="panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Gym<span style={{ color: 'var(--accent-color)' }}>Log</span>
                </h1>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.85rem' }}>
                    {isLogin ? 'Login to continue your journey' : 'Start your fitness profile today'}
                </p>

                {error && (
                    <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: 'var(--error-color)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid var(--error-color)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: '40px' }}
                                placeholder="Email address"
                                disabled={loading || !!socialLoading}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: '40px' }}
                                placeholder="Password"
                                disabled={loading || !!socialLoading}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading || !!socialLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem' }}>
                        {loading ? <Loader2 size={20} className="spin" /> : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OR CONTINUE WITH</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                    <button
                        type="button"
                        className="secondary"
                        onClick={handleGoogleLogin}
                        disabled={loading || !!socialLoading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '0.8rem', background: 'white', color: '#000', border: 'none' }}
                    >
                        {socialLoading === 'google' ? <Loader2 size={20} className="spin" /> : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                            </svg>
                        )}
                        <span style={{ fontWeight: 600 }}>Continue with Google</span>
                    </button>

                    <button
                        type="button"
                        className="secondary"
                        onClick={handleAppleLogin}
                        disabled={loading || !!socialLoading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '0.8rem', background: '#000', color: '#fff', border: 'none' }}
                    >
                        {socialLoading === 'apple' ? <Loader2 size={20} className="spin" /> : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.96.95-2.1 2.22-3.41 2.22s-1.83-.84-3.32-.84c-1.48 0-2.04.81-3.32.84s-2.31-1.12-3.36-2.61c-2.13-3.03-3.75-8.56-1.57-12.38c1.08-1.89 3.03-3.08 5.14-3.11c1.61-.03 3.11 1.08 4.1 1.08c.98 0 2.82-1.33 4.74-1.14c.81.03 3.06.33 4.54 2.49c-.12.08-2.71 1.58-2.69 4.73c.02 3.78 3.29 5.04 3.32 5.06c-.03.08-.52 1.78-1.71 3.45M12.03 4.3c-.02-2.13 1.74-4 3.84-4.05c.03 2.5-2.22 4.49-3.84 4.05Z" />
                            </svg>
                        )}
                        <span style={{ fontWeight: 600 }}>Continue with Apple</span>
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button type="button" className="secondary" onClick={() => setIsLogin(!isLogin)} style={{ border: 'none', background: 'none', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                        {isLogin ? "Create an Account" : "Back to Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
