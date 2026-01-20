import React, { useState, useEffect, Suspense } from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import SideBar from "../../components/SideBar";
import HeaderNavBar from "../../components/HeaderNavBar";
import RbdIndex from "../../components/HeaderNavBar/RbdIndex";
import routes from "../../routes";
import "../../css/SideBar.scss";

// Define role constants
const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'admin',
  EMPLOYEE : 'Employee'
};

// Protected Route Component
const ProtectedRoute = ({ component: Component, roles = [], selectedComponent, name, ...rest }) => {
  const sessionId = localStorage.getItem("sessionId");
  const userRole = localStorage.getItem("role");

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!sessionId;
  };

  // Check if user has required role
  const hasRequiredRole = () => {
    // If no specific roles required, allow access for both roles
    if (!roles || roles.length === 0) {
      return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE].includes(userRole);
    }
    
    // Check if user's role is in the allowed roles list
    return roles.includes(userRole);
  };

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (!isAuthenticated()) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: routeProps.location }
              }}
            />
          );
        }
        
        if (!hasRequiredRole()) {
          // Redirect to unauthorized page or dashboard
          return (
            <Redirect
              to={{
                pathname: "/dashboard",
                state: { 
                  message: "You don't have permission to access this page",
                  showNotification: true
                }
              }}
            />
          );
        }
        
        return (
          <DefaultLayoutWrapper 
            component={Component} 
            selectedComponent={selectedComponent}
            name={name}
            {...routeProps}
            {...rest} // Pass all route props
          />
        );
      }}
    />
  );
};

// Public Route Component (only for non-authenticated users)
const PublicRoute = ({ component: Component, restricted = false, ...rest }) => {
  const sessionId = localStorage.getItem("sessionId");
  
  return (
    <Route
      {...rest}
      render={(props) =>
        sessionId && restricted ? (
          <Redirect to="/dashboard" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

// SIMPLIFIED DefaultLayout Wrapper Component
const DefaultLayoutWrapper = ({ component: Component, selectedComponent, name, ...props }) => {
  const openSideBar = props?.location?.state?.state;
  const productId = props?.location?.state?.productId || props?.location?.props?.data?.id;
  const projectId = props?.location?.state?.projectId || props?.computedMatch?.params?.id;
  const userRole = localStorage.getItem("userRole");

  const [active, setActive] = useState(() => {
    const savedSideBarValue = localStorage.getItem("sideBarValue");
    return savedSideBarValue === "true";
  });

  const toggleActive = () => {
    const updatedValue = !active;
    setActive(updatedValue);
    localStorage.setItem("sideBarValue", updatedValue.toString());
  };

  // console.log("=== LAYOUT DEBUG ===");
  // console.log("Active state:", active);
  // console.log("Selected component:", selectedComponent);
  // console.log("Route name:", name);
  // console.log("Component to render:", Component?.name);
  // console.log("Project ID:", projectId);
  // console.log("====================");

  // Don't render the component if it's login page
  if (props.location.pathname === "/login") {
    return <Component {...props} />;
  }

  return (
    <div className="app">
      <div className="app-body" style={{ minHeight: "calc(100vh - 123px)" }}>
        <div>
          {/* Sidebar */}
          <SideBar
            onClick={toggleActive}
            value={projectId}
            active={active}
            props={productId}
            openSideBar={openSideBar}
            selectedComponent={selectedComponent}
            userRole={userRole}
          />

          {/* Header */}
          <HeaderNavBar
            active={active}
            selectedComponent={selectedComponent === "FTA" ? "FTA" : null}
          />
          
          {/* RBD Index - Only for RBD routes */}
          {name === "RBD" && (
            <RbdIndex  
              active={active}
              selectedComponent={name === "RBD" ? "RBD" : null}
            />
          )}

          {/* Main Content */}
          <div className={`${active ? "site-maincontent home-content" : "site-maincontent active home-content"}`}>
            <Suspense fallback={<div>Loading...</div>}>
              {/* DIRECTLY RENDER THE COMPONENT PASSED FROM PROTECTEDROUTE */}
              <Component {...props} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main DefaultLayout Component (for backward compatibility)
const DefaultLayout = (props) => {
  const sessionId = localStorage.getItem("sessionId");
  
  // If there's no sessionId, redirect to login
  if (!sessionId) {
    return <Redirect to="/login" />;
  }

  return <DefaultLayoutWrapper {...props} />;
};

// Also export a simple LayoutRoute for direct usage
export const LayoutRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <DefaultLayoutWrapper 
          component={Component}
          {...props}
          {...rest}
        />
      )}
    />
  );
};

export default DefaultLayout;
export { ProtectedRoute, PublicRoute, USER_ROLES };