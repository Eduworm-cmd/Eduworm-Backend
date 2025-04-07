const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { mongoose_connection } = require("./DB/mongoose_connection");
const courseContentRouter = require("./src/routes/courseContentRoutes");



dotenv.config({
  path:`.env.${process.env.NODE_ENV || "development"}`
});
app.use(express.json());
mongoose_connection(); //connecting to database
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true,
    }
));



app.use("/api/courseContent", courseContentRouter);



const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});