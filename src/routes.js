// User
import Login from "./components/Login";

import Dashboard from "./components/Dashboard";
import User from "./components/User";
import Company from "./components/Company";
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
import EditProjectDetails from "./components/ProjectList/EditprojectDetails";
import CompanyAdmin from "./components/Company/CompanyAdmin";
import Theme from "./components/Theme";
import { ThemeProvider } from "./components/Theme";
import SeparateLibrary from "./components/Libraries/SeparateLibrary";
import ConnectedLibrary from "./components/Libraries/ConnectedLibrary";
import Reports from "./components/Reports";


//Side Menu Bar
// import AddProjectList from "./components/Projects";

// List of routes
const routes = [
  {
    path: "/login",
    exact: true,
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    exact: true,
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/user",
    exact: true,
    name: "User",
    component: User,
  },
  {
    path: "/theme",
    exact: true,
    name: "Theme",
    component: Theme,
  },

  {
    path: "/company",
    exact: true,
    name: "Company",
    component: Company,
  },
  {
    path: "/project/list",
    exact: true,
    name: "ProjectList",
    component: ProjectList,
  },
  // {
  //   path: "/project/create",
  //   exact: true,
  //   name: "Projects",
  //   component: AddProjectList,
  // },
  {
    path: "/pbs/:id",
    exact: true,
    name: "PBS",
    component: PBS,
  },
  {
    path: "/failure-rate-prediction/:id",
    exact: true,
    name: "FailureRatePrediction",
    component: FailureRatePrediction,
  },
  {
    path: "/mttr/prediction/:id",
    exact: true,
    name: "MTTRPrediction",
    component: MTTRPrediction,
  },
  {
    path: "/fmeca/:id",
    exact: true,
    name: "FMECA",
    component: FMECA,
  },
  {
    path: "/rbd/:id",
    exact: true,
    name: "RBD",
    component: RBD,
  },
  {
    path: "/fta/:id",
    exact: true,
    name: "FTA",
    component: FTA,
  },
  {
    path: "/pmmra/:id",
    exact: true,
    name: "PMMRA",
    component: PMMRA,
  },
  {
    path: "/spare-parts-analysis/:id",
    exact: true,
    name: "SparePartsAnalysis",
    component: SparePartsAnalysis,
  },
  {
    path: "/safety/:id",
    exact: true,
    name: "Safety",
    component: Safety,
  },

  {
    path: "/project/details/:id",
    exact: true,
    name: "ProjectDetails",
    component: ProjectDetails,
  },

  {
    path: "/project/details/edit/:name",
    exact: true,
    name: "EditProjectDetails",
    component: EditProjectDetails,
  },

  // {
  //   path: "/editProject/:name",
  //   exact: true,
  //   name: "EditprojectList",
  //   component: Editprojectlist,
  // },

  {
    path: "/permissions/:name",
    exact: true,
    name: "ProjectPermission",
    component: Projectpermission,
  },
  {
    path: "/company/admin",
    exact: true,
    name: "CompanyAdmin",
    component: CompanyAdmin,
  },
  {
    path: "/separate/library/:id",
    exact: true,
    name: "SeparateLibrary",
    component: SeparateLibrary,
  },
  {
    path: "/connected/library/:id",
    exact: true,
    name: "ConnectedLibrary",
    component: ConnectedLibrary,
  }, 
  {
    path: "/reports/:id",
    exact: true,
    name: "Reports",
    component: Reports,
  },
];

export default routes;
