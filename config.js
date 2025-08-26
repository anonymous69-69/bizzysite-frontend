let API_BASE_URL = "";

if (process.env.NODE_ENV === "development") {
  API_BASE_URL = "http://localhost:5050";
} else {
  API_BASE_URL = "https://bizzysite.onrender.com";
}

export default API_BASE_URL;