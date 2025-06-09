import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
 
const NotificationContexts = createContext();
 
export const useNotifications = () => useContext(NotificationContexts);
 
function NotificationContext({ children }) {
  const [read, setRead] = useState(0);
  const [showDot, setShowDot] = useState(false);
  const [getdoctoradd,setgetdoctoradd]=useState(false);

  
    const fetchNotifications = async () => {
      try {
        const response = await api.get("notifications/list/");
        const data = response.data.data;
 
        const { total_unread = 0 } = data[0] || {};
        setRead(total_unread); // ✅ Sync unread count globally
 
        // ...rest of your code
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
  


    
    const onNotificationClick = () => {
    setShowDot(true); 
   
  };
 
  return (
    <NotificationContexts.Provider value={{ read, setRead, fetchNotifications, onNotificationClick, showDot, setShowDot,getdoctoradd, setgetdoctoradd,  }}>
      {children}
    </NotificationContexts.Provider>
  );
}
 
export default NotificationContext;