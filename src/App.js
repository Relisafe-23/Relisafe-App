import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { ToastContainer } from "react-toastify";

// ReactToastify CSS
import "react-toastify/dist/ReactToastify.min.css";

import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

// History
import history from "./history";

//containers
import PublicLayout from "./container/PublicLayout/PublicLayout";

// Login
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
// import Editprojectlist from "./components/ProjectList/EditProjectList";
import Projectpermission from "./components/ProjectList/Projectpermission";
import EditprojectDetails from "./components/ProjectList/EditprojectDetails";
import CompanyAdmin from "./components/Company/CompanyAdmin";
import { ModalProvider } from "./components/ModalContext";
import SeparateLibrary from "./components/Libraries/SeparateLibrary";
import ConnectedLibrary from "./components/Libraries/ConnectedLibrary";
import Reports from "./components/Reports";
// import AddProjectList from "./components/Projects";

 import Theme from "./components/Theme";
// import ThemeSlider from "./color";



function App() {
  const userId = localStorage.getItem("userId");
   //const [sessionId, setSessionId] = useState(false);
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
            <Route exact path="/" component={Login}>
              <Redirect to="/login" />
            </Route>

            <PublicLayout exact name="Login" path="/login" component={Login} />
            <PublicLayout exact name="Dashboard" path="/dashboard" component={Dashboard} />
            <PublicLayout exact name="Company" path="/company" component={Company} />
            <PublicLayout exact name="User" path="/user" component={User} />
            <PublicLayout exact name="ProjectList" path="/project/list" component={ProjectList} />
            <PublicLayout exact name="pbs" path="/pbs/:id" component={PBS} />
            <PublicLayout
              exact
              name="FailureRatePrediction"
              path="/failure-rate-prediction/:id"
              component={FailureRatePrediction}
            />
            <PublicLayout exact name="MTTRPrediction" path="/mttr/prediction/:id" component={MTTRPrediction} />
            <PublicLayout exact name="FMECA" path="/fmeca/:id" component={FMECA} />
            <PublicLayout exact name="RBD" path="/rbd/:id" component={RBD} />
            <PublicLayout exact name="FTA" path="/fta/:id" component={FTA} selectedComponent={"FTA"} />
            <PublicLayout exact name="PMMRA" path="/pmmra/:id" component={PMMRA} />
            <PublicLayout
              exact
              name="SparePartsAnalysis"
              path="/spare-parts-analysis/:id"
              component={SparePartsAnalysis}
            />
            <PublicLayout exact name="Safety" path="/safety/:id" component={Safety} />
            {/* <PublicLayout exact name="Editproject" path="/editProject/:name" component={Editprojectlist} /> */}
            <PublicLayout exact name="ProjectDetails" path="/project/details/:id" component={ProjectDetails} />
            <PublicLayout exact name="Projectpermission" path="/permissions/:name" component={Projectpermission} />
            <PublicLayout
              exact
              name="EditprojectDetails"
              path="/project/details/edit/:name"
              component={EditprojectDetails}
            />
            <PublicLayout exact name="CompanyAdmin" path="/company/admin" component={CompanyAdmin} />
            <PublicLayout exact name="SeparateLibrary" path="/separate/library/:id" component={SeparateLibrary} />
            <PublicLayout exact name="ConnectedLibrary" path="/connected/library/:id" component={ConnectedLibrary} />
            <PublicLayout exact name="Theme" path="/theme" component={Theme} />
            <PublicLayout exact name="Reports" path="/reports/:id" component={Reports} />
          </Switch>
        </Router>
      </ModalProvider>
    </div>
    // return (
    //   <Theme>
    //     <div style={{ flex: 1 }}>
    //       {isVisible === true ? Splash_Screen : <Routes data={sessionId} />}
  
    //     </div>
    //   </Theme>
    //   );
  );
 
}

export default App;
