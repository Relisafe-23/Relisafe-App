import React, { useState, useEffect, Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import SideBar from "../../components/SideBar";
import HeaderNavBar from "../../components/HeaderNavBar";
import routes from "../../routes";
import "../../css/SideBar.scss";

const DefaultLayout = (props) => {
  const openSideBar = props?.location?.state?.state;
  const productId = props?.location?.state?.productId || props?.location?.props?.data?.id;
  console.log("product id in public layout....", productId)
  const projectId = props?.location?.state?.projectId || props?.computedMatch?.params?.id;

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
              selecte
            />
          ) : null}

          <HeaderNavBar
            active={active}
            selectedComponent={props?.selectedComponent === "FTA" ? "FTA" : null}
          />
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
                      ) : (
                        null
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
                        null
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
