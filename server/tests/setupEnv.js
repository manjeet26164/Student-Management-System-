process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:5173";
require("express-async-errors");