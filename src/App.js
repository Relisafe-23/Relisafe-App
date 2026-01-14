import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import history from "./history";

// Import components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Company from "./components/Company";
import User from "./components/User";
import ProjectList from "./components/ProjectList";
import PBS from "./components/PBS";
import FailureRatePrediction from "./components/FailureRatePrediction";
import MTTRPrediction from "./components/MTTRPrediction";
import FMECA from "./components/FMECA";
import RBD from "./components/RBD";
import FTA from "./components/FTA";
import PMMRA from "./components/PMMRA";
import SparePartsAnalysis from "./components/SparePartsAnalysis";
import Safety from "./components/Safety";
import ProjectDetails from "./components/ProjectList/ProjectDetails";
import Projectpermission from "./components/ProjectList/Projectpermission";
import EditprojectDetails from "./components/ProjectList/EditprojectDetails";
import CompanyAdmin from "./components/Company/CompanyAdmin";
import { ModalProvider } from "./components/ModalContext";
import SeparateLibrary from "./components/Libraries/SeparateLibrary";
import ConnectedLibrary from "./components/Libraries/ConnectedLibrary";
import Reports from "./components/Reports";
import Theme from "./components/Theme";

// Import route components with USER_ROLES
import { ProtectedRoute, PublicRoute, USER_ROLES } from "./container/PublicLayout/PublicLayout";

function App() {
  return (
    <div>
      <ModalProvider>
        <ToastContainer
          autoClose={5000}
          hideProgressBar={true}
          pauseOnHover={false}
          toastClassName="toastRequestSuccess"
          bodyClassName="toastBody"
          closeButton={false}
        />
        <Router history={history}>
          <Switch>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>

            {/* Public routes */}
            <PublicRoute
              exact
              restricted={true}
              path="/login"
              component={Login}
            />

            {/* SUPER ADMIN ONLY ROUTES */}
            <ProtectedRoute
              exact
              path="/company"
              component={Company}
              roles={[USER_ROLES.SUPER_ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/company/admin"
              component={CompanyAdmin}
              roles={[USER_ROLES.SUPER_ADMIN]}
            />

            {/* ADMIN ONLY ROUTES (All other routes for admin role) */}
            <ProtectedRoute
              exact
              path="/dashboard"
              component={Dashboard}
            />
            
            <ProtectedRoute
              exact
              path="/user"
              component={User}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/project/list"
              component={ProjectList}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/pbs/:id"
              component={PBS}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/failure-rate-prediction/:id"
              component={FailureRatePrediction}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/mttr/prediction/:id"
              component={MTTRPrediction}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/fmeca/:id"
              component={FMECA}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/rbd/:id"
              component={RBD}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/fta/:id"
              component={FTA}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/pmmra/:id"
              component={PMMRA}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/spare-parts-analysis/:id"
              component={SparePartsAnalysis}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/safety/:id"
              component={Safety}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/project/details/:id"
              component={ProjectDetails}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/permissions/:name"
              component={Projectpermission}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/project/details/edit/:name"
              component={EditprojectDetails}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/separate/library/:id"
              component={SeparateLibrary}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/connected/library/:id"
              component={ConnectedLibrary}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/theme"
              component={Theme}
              roles={[USER_ROLES.ADMIN]}
            />
            
            <ProtectedRoute
              exact
              path="/reports/:id"
              component={Reports}
              roles={[USER_ROLES.ADMIN]}
            />

            {/* Fallback route */}
            <Route path="*">
              <Redirect to="/login" />
            </Route>
          </Switch>
        </Router>
      </ModalProvider>
    </div>
  );
}

export default App;