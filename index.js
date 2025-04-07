const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { mongoose_connection } = require("./DB/mongoose_connection");
<<<<<<< HEAD
const courseContentRouter = require("./src/routes/courseContentRoutes");
const ClassRouter = require("./src/routes/classRoutes");
=======
const courseContentRouter = require("./src/routes/courseContentroutes/courseContentRoutes");
const userRouter = require("./src/routes/userRoutes/userRoute");
const authRouter = require("./src/routes/authRoutes/authRoutes");
>>>>>>> 30152f9b4477b7098d79cbf5ddcc8f5989cd9257



app.use(morgan('dev'));
dotenv.config({
  path:`.env.${process.env.NODE_ENV || "development"}`
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose_connection(); 
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true,
    }
));



app.use("/api/courseContent", courseContentRouter);
<<<<<<< HEAD
app.use("/api/classes",ClassRouter);
=======
app.use("/api/user", userRouter);
app.use("/api/courseContent", authRouter);
>>>>>>> 30152f9b4477b7098d79cbf5ddcc8f5989cd9257



const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});