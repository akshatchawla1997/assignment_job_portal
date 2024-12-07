const Express = require("express");
const app = Express();
const publicRoute = require('./routes/publicRoute');
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const privateRoute = require("./routes/privateRoute");
app.use(cors())
app.use(bodyParser.json())
app.use(Express.json());
app.use(publicRoute);
app.use(privateRoute)
app.use(morgan('combined'));

// Define the root route at the end
app.get('/', (request, response) => {
  response.json({
    message: 'Works',
  });
});


app.listen(3002, () => {
    console.log("listening to port 3002");
});

