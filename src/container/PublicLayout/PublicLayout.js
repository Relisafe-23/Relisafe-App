import React, { Component, Suspense, useState } from "react";
import { Switch, Route } from "react-router-dom";
import SideBar from "../../components/SideBar";
import HeaderNavBar from "../../components/HeaderNavBar";

// routes config
import routes from "../../routes";

// Styles
import "../../css/SideBar.scss";
const DefaultLayout = (props) => {
  // const propsValue = props?.location?.props?.data ? props?.location?.props?.data : props?.location?.state?.previousData;
  const openSideBar = props?.location?.state?.state;
  const productId = props?.location?.state?.productId
    ? props?.location?.state?.productId
    : props?.location?.props?.data?.id;
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.computedMatch?.params?.id;

  const [active, setActive] = useState(false);

  const sessionId = localStorage.getItem("sessionId");
  const loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;
  const value = () => {
    setActive(!active);
  };

  return (
    <div className="app">
      <div className="app-body" style={{ minHeight: "calc(100vh - 123px)" }}>
        <div>
          {sessionId ? (
            <SideBar
              onClick={value}
              value={projectId}
              active={active}
              props={productId}
              openSideBar={openSideBar}
              selecte
            />
          ) : null}

          <HeaderNavBar
            active={active}
            selectedComponent={props?.selectedComponent === "FTA" ? "FTA" : null}
          />
          <div>
            {sessionId ? (
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
                      ) : (
                        ""
                      );
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
                      ) : (
                        ""
                      );
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

export default DefaultLayout;
