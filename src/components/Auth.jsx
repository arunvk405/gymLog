import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, UserPlus, Loader2, Info } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [error, setError] = useState('');

    const { login, signup, loginWithGoogle, loginWithGoogleRedirect, redirectError } = useAuth();

    const currentHost = window.location.hostname;
    const isLocalNetworkIP = currentHost !== 'localhost' && currentHost !== '127.0.0.1' && !currentHost.includes('firebaseapp.com') && !currentHost.includes('web.app');

    // Display any redirect error if occurred during page reload
    React.useEffect(() => {
        if (redirectError) {
            if (redirectError.code === 'auth/unauthorized-domain') {
                setError(`Domain/IP "${currentHost}" is not authorized in Firebase. Add "${currentHost}" in Firebase Console > Authentication > Settings > Authorized Domains.`);
            } else if (redirectError.code === 'auth/operation-not-allowed') {
                setError("Google Sign-In is not enabled in Firebase Console (Authentication > Sign-in method > Google).");
            } else {
                setError(redirectError.message ? redirectError.message.replace('Firebase: ', '') : "Sign-in failed during redirect.");
            }
        }
    }, [redirectError, currentHost]);

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
            if (err.code === 'auth/email-already-in-use') msg = "This email is already registered. Try logging in.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
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
                setError("Popup was blocked by your browser. You can use Email/Password or tap 'Sign In with Redirect' below.");
            } else if (err.code === 'auth/operation-not-allowed') {
                setError("Google Sign-In is not enabled in Firebase Console (Authentication > Sign-in method > Google).");
            } else if (err.code === 'auth/unauthorized-domain') {
                setError(`Domain/IP "${currentHost}" is not authorized in Firebase. Please add "${currentHost}" in Firebase Console > Authentication > Settings > Authorized Domains.`);
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in popup was closed before completing. On iPhone/Safari, try signing in with Email & Password or use the redirect button below.");
            } else if (err.code === 'auth/cancelled-popup-request') {
                setError("Sign-in was cancelled. Please try again.");
            } else {
                setError(err.message ? err.message.replace('Firebase: ', '') : "Google login failed. Please try again.");
            }
        } finally {
            setSocialLoading(null);
        }
    };

    const handleGoogleRedirect = async () => {
        setError('');
        try {
            await loginWithGoogleRedirect();
        } catch (err) {
            setError(err.message || "Failed to redirect.");
        }
    };

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: 'calc(1.5rem + env(safe-area-inset-top, 0px)) 1rem calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Bulk<span style={{ color: 'var(--accent-color)' }}>Bro</span>
                </h1>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    {isLogin ? 'Login to continue your journey' : 'Start your fitness profile today'}
                </p>

                {isLocalNetworkIP && (
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.75rem', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: 1.4 }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <strong>Mobile Network Testing:</strong> If Google Sign-In fails on your iPhone, ensure <code>{currentHost}</code> is added to <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</strong>.
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: 'var(--error-color)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid var(--error-color)', lineHeight: 1.4 }}>
                        {error}
                        {error.includes("popup") && (
                            <div style={{ marginTop: '0.8rem' }}>
                                <button
                                    type="button"
                                    onClick={handleGoogleRedirect}
                                    style={{ background: 'var(--panel-color)', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Try Google Login with Full Redirect ➔
                                </button>
                            </div>
                        )}
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
                        {loading ? <Loader2 size={20} className="spin" /> : (isLogin ? 'Login with Email' : 'Create Account')}
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
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '0.8rem',
                            background: '#fff',
                            color: '#000',
                            border: '1px solid var(--border-color)',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {socialLoading === 'google' ? <Loader2 size={20} className="spin" /> : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                            </svg>
                        )}
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button type="button" className="secondary" onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ border: 'none', background: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, textTransform: 'none' }}>
                        {isLogin ? "Create an Account" : "Back to Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
