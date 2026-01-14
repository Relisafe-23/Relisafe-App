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
  ADMIN: 'admin'
};

// Protected Route Component
const ProtectedRoute = ({ component: Component, roles = [], ...rest }) => {
  const sessionId = localStorage.getItem("sessionId");
  const userRole = localStorage.getItem("role");
  const history = useHistory();

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!sessionId;
  };

  // Check if user has required role
  const hasRequiredRole = () => {
    // If no specific roles required, allow access for both roles
    if (!roles || roles.length === 0) {
      return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(userRole);
    }
    
    // Check if user's role is in the allowed roles list
    return roles.includes(userRole);
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated()) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
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
        
        return <DefaultLayoutWrapper component={Component} {...props} />;
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

// DefaultLayout Wrapper Component
const DefaultLayoutWrapper = ({ component: Component, ...props }) => {
  const openSideBar = props?.location?.state?.state;
  const productId = props?.location?.state?.productId || props?.location?.props?.data?.id;
  const projectId = props?.location?.state?.projectId || props?.computedMatch?.params?.id;
  const userRole = localStorage.getItem("userRole");

  const [active, setActive] = useState(false);

  useEffect(() => {
    const savedSideBarValue = localStorage.getItem("sideBarValue");
    setActive(savedSideBarValue === "true");
  }, []); 

  const toggleActive = () => {
    const updatedValue = !active;
    setActive(updatedValue);
    localStorage.setItem("sideBarValue", updatedValue.toString());
  };

  console.log(active,"active")

  return (
    <div className="app">
      <div className="app-body" style={{ minHeight: "calc(100vh - 123px)" }}>
        <div>
          {localStorage.getItem("sessionId") ? (
            <SideBar
              onClick={toggleActive}
              value={projectId}
              active={active}
              props={productId}
              openSideBar={openSideBar}
              selectedComponent={props?.selectedComponent}
              userRole={userRole} // Pass user role to SideBar for menu filtering
            />
          ) : null}

          <HeaderNavBar
            active={active}
            selectedComponent={props?.selectedComponent === "FTA" ? "FTA" : null}
          />
          {console.log("Selected uiiooooComponent in Layout:", props.name)}
          <RbdIndex  
          active ={active}
          selectedComponent={props?.name === "RBD" ? "RBD" : null}/>
          {console.log("Selected Component in Layout:", props?.selectedComponent)}

          <div>
            {localStorage.getItem("sessionId") ? (
              <div className={`${active ? "site-maincontent home-content" : "site-maincontent active home-content"}`}>
                <Suspense>
                  <Switch>
                    {routes.map((route, idx) => {
                      return route.component ? (
                        <Route
                          key={idx}
                          path={route.path}
                          exact={route.exact}
                          name={route.name}
                          render={(props) => <route.component {...props} />}
                        />
                      ) : null;
                    })}
                  </Switch>
                </Suspense>
              </div>
            ) : (
              <div className={`${active ? "home-content-login" : "active home-content-login"}`}>
                <Suspense>
                  <Switch>
                    {routes.map((route, idx) => {
                      return route.component ? (
                        <Route
                          key={idx}
                          path={route.path}
                          exact={route.exact}
                          name={route.name}
                          render={(props) => <route.component {...props} />}
                        />
                      ) : null;
                    })}
                  </Switch>
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main DefaultLayout Component
const DefaultLayout = (props) => {
  const sessionId = localStorage.getItem("sessionId");
  
  // If there's no sessionId, redirect to login
  if (!sessionId) {
    return <Redirect to="/login" />;
  }

  return <DefaultLayoutWrapper {...props} />;
};

export default DefaultLayout;
export { ProtectedRoute, PublicRoute, USER_ROLES };