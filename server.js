//this is a test
const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');

const app = express();
app.use(bodyParser.json());

// ADD EXPRESS MIDDLEWARE FOR CORS HEADERS HERE
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin','http://chai-http.test');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

//GET  
app.get('/api/items', (req, res) => {
  knex.select('id', 'title', 'completed')
    .from('items')
    .returning('items')
    .then((response) => {
      console.log(response);
      return res.status(200).json(response);
    });
});

//POST 
app.post('/api/items', (req, res) => {
  console.log(req.body);
  //set the title as an object = to the request body
  const {title} = req.body;
  if(!title) {
    //used .send to send the message/string to the browser 
    return res.status(400).send('Missing Title');
  }
  knex('items')
    .insert({'title': req.body.title})
    .returning(['id','title','completed'])
    .then((results) => { 
      //here we cannot use res.send! Use .json() accepting in the response/results from Knex
      //since the results are returned as an array 
      //HOWEVER our test requires an object so we pass in results[0] to get the first object 
      console.log("These are results:" + results);
      return res.status(201).location(`${res.root}${results[0].id}`).json(results[0]);

      //include items table 

    });
    // .json({ key: 'value' }) should be taking in an object to satisfy our tests
   
});

app.get('/api/items/:itemId', (req, res) => {
  // const id = req.params.itemId;
  const id = parseInt(req.params.itemId);
  res.json({id});
});

//PUT
// app.put('/api/items/:id', (req, res) => {
//   const reqProperties = ['id', 'title', 'completed'];
//   const id = req.params.id;
//   const title = request.body;
//   knex('stories')
//     .from({'title': 'req.body'})
//     .update()
//     .then(results)=>console.log(results)
//     res.status(201).json(results);)
// });

//DELETE 

let server;
let knex;
function runServer(database = DATABASE, port = PORT) {
  return new Promise((resolve, reject) => {
    try {
      knex = require('knex')(database);
      server = app.listen(port, () => {
        console.info(`App listening on port ${server.address().port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return knex.destroy().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing servers');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => {
    console.error(`Can't start server: ${err}`);
    throw err;
  });
}

module.exports = { app, runServer, closeServer };