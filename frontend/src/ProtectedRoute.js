// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "./context/AuthProvider";

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useAuth();

//   return isAuthenticated() ? children : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
 
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRoles } = useAuth();
 
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
 
  if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
    return(<div>
      <p>You do not have access to this component</p>
    </div>
    );
  }
 
  return children;
};
 
export default ProtectedRoute;
