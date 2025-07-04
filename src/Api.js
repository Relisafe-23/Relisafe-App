import axios from "axios";

// const Api = axios.create({
//   baseURL: "https://relisafe-api.herokuapp.com//",
// });
const Api = axios.create({
  baseURL: "http://localhost:8000/",
});

// const Api = axios.create({
//   baseURL: "http://localhost:8000/",
// });

export default Api;
