import express from "express";
import configViewEngine from "./configs/viewEngine"
import initWebRoutes from "./routes/web"
import bodyParser from "body-parser";

let app = express();

configViewEngine(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

initWebRoutes(app);

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`messenger is running ${port}`);
})