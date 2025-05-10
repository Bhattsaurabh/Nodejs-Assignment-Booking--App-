import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js';


dotenv.config({
    path: './.env'
})

// calling connectDB method from here 

connectDB()
.then( () =>{

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });


    app.listen(process.env.PORT || 8000, () =>  {
        console.log(` Server is running at port:
             ${process.env.PORT}`);

    })
})