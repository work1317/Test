import React, { createContext, useState, useContext, useReducer, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../utils/axiosInstance";

// Define roles and permissions
export const ROLE_TYPES = {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator',
};

export const PERMISSION_TYPES = {
    CAN_VIEW_ADMIN: 'can_view_admin',
    CAN_EDIT_USER: 'can_edit_user',
};

// Auth reducer for managing user state
const authReducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return { ...state, user: action.payload };
        case "SET_ROLES":
            return { ...state, userRoles: action.payload };
        case "SET_PERMISSIONS":
            return { ...state, userPermissions: action.payload };
        case "LOGOUT":
            return { ...state, user: null, userRoles: [], userPermissions: [] };
        default:
            return state;
    }
};

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        userRoles: [],
        userPermissions: [],
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Memoize the login function
    const login = useCallback(async (username, password) => {
        setLoading(true);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        try {
            const res = await api.post("/login/", { username, password });
            const { access, refresh } = res.data;
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            // Decode token to extract roles and permissions
            const decodedToken = jwtDecode(access);
            const roles = decodedToken.groups || [];
            const permissions = decodedToken.permissions || [];

            // Set user-related state
            dispatch({ type: "SET_USER", payload: { username: decodedToken.username } });
            dispatch({ type: "SET_ROLES", payload: roles });
            dispatch({ type: "SET_PERMISSIONS", payload: permissions });

            return res;
        } catch (err) {
            throw new Error("Login failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    }, [navigate]);

    // Check if the user is authenticated on page load (via localStorage)
    useEffect(() => {
        const access = localStorage.getItem("access");
        if (access) {
            try {
                const decoded = jwtDecode(access);
                dispatch({ type: "SET_USER", payload: { username: decoded.username } });
                dispatch({ type: "SET_ROLES", payload: decoded.groups || [] });
                dispatch({ type: "SET_PERMISSIONS", payload: decoded.permissions || [] });
            } catch (e) {
                logout();
            }
        }
    }, [logout]);

    // Function to check if the user has a specific role
    // const { hasAnyRole } = useAuth();
    //useEffect(() => {
    //     if (hasAnyRole(['doctor'])) {
    //     canDisable.current = true;
    //     }
    // }, [hasAnyRole]);
    const hasAnyRole = useCallback((allowedRoles) => {
        return allowedRoles.some(role => state.userRoles.includes(role));
    }, [state.userRoles]);

    // Function to check if the user has a specific permission
    const hasPermission = useCallback((permission) => {
        return state.userPermissions.includes(permission);
    }, [state.userPermissions]);

    // Checking if token exists and is valid (you can optionally add logic to check expiration)
  const isAuthenticated = () => {
    const token = localStorage.getItem("access");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000; // Checks if token is not expired
    } catch (e) {
      return false;
    }
  };

    return (
        <AuthContext.Provider value={{
            user: state.user,
            login,
            logout,
            userRoles: state.userRoles,
            userPermissions: state.userPermissions,
            hasAnyRole,
            hasPermission,
            isAuthenticated,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
