import express from "express";
import configViewEngine from "./configs/viewEngine"
import initWebRoutes from "./routes/web"

let app = express();

configViewEngine(app);

initWebRoutes(app);

let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`messenger is running ${port}`);
})