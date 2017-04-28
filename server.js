//this is a test
const express = require('express');
const bodyParser = require('body-parser');
const { DATABASE, PORT } = require('./config');

const app = express();
app.use(bodyParser.json());




// ADD EXPRESS MIDDLEWARE FOR CORS HEADERS HERE
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin',req.get('origin'));
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Max-Age', 86400);
  next();
});


//GET REQUEST of ALL ITEMS
app.get('/api/items', (req, res) => {
  knex.select('id', 'title', 'completed')
    .from('items')
    .returning('items')
    .then((response) => {
      console.log(response);
      return res.status(200).json(response);
    });
});

//GET REQUEST OF ONE ITEM
app.get('/api/items/:itemId', (req, res) => {
  const id = parseInt(req.params.itemId);
  res.json({id});
});

//POST 

app.post('/api/items', (req, res) => {
  console.log(req.body);
  // const {title} = req.body;
  const title = req.body.title;
  if(!title) {
    return res.status(400).send('Missing Title');
  }

  knex('items')
    // .insert({title: title})
    .insert({'title': title, 'completed': 'false'})
    .returning(['id','title','completed'])
    .then((results) => { 
      const item = results[0];
      item.url = `${res.root}${results[0].id}`;
      console.log("These are results:" + results);

      res.status(201).location(item.url).json(item);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// Alex post request
// app.post('/api/items', (req, res) => {
//   const { title } = req.body;
//   if (!title) {
//     return res.status(400).send('Missing Title in request body');
//   }

//   knex.insert({
//     title: title
//   })
//     .into('items')
//     .returning(['id', 'title', 'completed'])
//     .then((results) => {
//       const item = results[0];
//       item.url = `${res.root}${results[0].id}`;
//       res.status(201).location(item.url).json(item);
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).send('Internal server error');
//     });
// });


//PUT
//  app.put('/api/items/:id', (req, res) => {
//   const reqProperties = ['id', 'title', 'completed'];
//   const id = req.params.id;
//   const title = request.body;
//   knex('title')
//     .from('items')
//     .where({'id': 'req.body.id'})
//     .update('title')
//     .then((results)) => {
//       console.log(results)
//       res.status(201).json(results);
//     });
// });

//DELETE ONE ITEM
// app.delete('api/items/:id', (req, res) => {
//   if(field) {
//     knex('items')
//       .where({'id': 'request.params.id'})
//   }

// });



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