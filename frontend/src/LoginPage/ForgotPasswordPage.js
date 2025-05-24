import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/ForgotPasswordPage.module.css';
import api from '../utils/axiosInstance';

const ForgotPasswordPage = () => {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState({});
    const [resetSuccess, setResetSuccess] = useState('');
    const navigate = useNavigate();

    // Validate input fields
    const validate = () => {
        const errors = {};
        if (!username.trim()) errors.username = 'Username is required';
        if (!newPassword) errors.newPassword = 'New password is required';
        else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
        if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords must match';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError({});
        setResetSuccess('');

        const errors = validate();

        if (Object.keys(errors).length > 0) {
            setFormError(errors);
            return;
        }

        try {
            const response = await api.post('/password-reset/', {
                username,
                new_password: newPassword,
            });

            if (response.status === 200) {
                setResetSuccess('Password reset successful. You can now log in with your new password.');
                setTimeout(() => {
                    navigate('/login'); // Redirect to login after success
                }, 2000);
            }
        } catch (err) {
            setFormError({ general: 'Password reset failed. Please check your username or try again later.' });
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Forgot Password</h2>

                {/* Render formError messages */}
                {formError.general && <div className={styles.formError}>{formError.general}</div>}
                {resetSuccess && <div className={styles.successMessage}>{resetSuccess}</div>}

                <div className={styles.inputGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        className={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {formError.username && <span className={styles.error}>{formError.username}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        className={styles.input}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {formError.newPassword && <span className={styles.error}>{formError.newPassword}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {formError.confirmPassword && <span className={styles.error}>{formError.confirmPassword}</span>}
                </div>

                <button type="submit" className={styles.button}>
                    Reset Password
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
