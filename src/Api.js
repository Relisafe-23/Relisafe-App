import axios from "axios";

// const Api = axios.create({
//   baseURL: "https://relisafe-api.herokuapp.com//",
// });
// const Api = axios.create({
//   baseURL: "https://relisafe-api-e067e0a7c5f8.herokuapp.com/",
// });


const Api = axios.create({
  baseURL: "http://localhost:8000/",
});

export default Api;
