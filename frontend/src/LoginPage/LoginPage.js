import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import styles from './css/LoginPage.module.css';

const LoginPage = () => {
    const { login, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();

    // Validate input fields
    const validate = () => {
        const errors = {};
        if (!username.trim()) errors.username = 'Username is required';
        if (!password) errors.password = 'Password is required';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
        return errors;
    };

    // Handle login submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        const errors = validate();

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});

        try {
            const res = await login(username, password);
            if (res.status === 200) {
                navigate('/dashboard');
            } else {
                setFormError('Invalid credentials');
            }
        } catch (err) {
            setFormError('Login failed. Please try again later.');
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Login</h2>

                {formError && <div className={styles.formError}>{formError}</div>}

                <div className={styles.inputGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        className={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {fieldErrors.username && <span className={styles.error}>{fieldErrors.username}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {fieldErrors.password && <span className={styles.error}>{fieldErrors.password}</span>}
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className={styles.forgotPassword}>
                {/* Use the Link component to navigate to the forgot-password route */}
                <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
