const express = require("express");
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());



// auth
function verifyJWT(req , res , next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'unauthorized'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN,(error , decode)=>{
    if(error){
      return res.status(403).send({message:'Forbidden access'})
    }
    req.decode = decode;
    next();
  })
  
}



// for home page
app.get("/", (req, res) => {
  res.send("connected bd");
});
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqf9l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
  async function  run(){
    try{
      await client.connect();
      const serviceCollection = client.db('geniusCarService').collection('service');
      const orderCollection = client.db('geniusCarService').collection('order');
      //get services
      app.get('/user', async (req , res)=>{
        const query = {};
        const cursor =  serviceCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });
      // single data get
      app.get('/user/:id',async(req , res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result);
      })
      // post 
      app.post('/user',async(req,res)=>{
        const data = req.body;
        const result =await serviceCollection.insertOne(data);
        res.send(result);
      })
      // for delete 
      app.delete('/user/:id', async(req , res )=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await serviceCollection.deleteOne(query);
        res.send(result)
      })
      // for update
      app.get('/update/:id', async(req , res )=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result)
      })
      // for update 
      app.put('/user/:id',async(req , res)=>{
        const id = req.params.id;
        const data  = req.body;
        const query = {_id:ObjectId(id)};
        const options = { upsert: true };
        const updateData = {
          $set:data
        }
        const result = await serviceCollection.updateOne(query,updateData,options);
        res.send(result);
      });
      // order data save in db
      app.post('/order', async(req,res)=>{
        const order = req.body;
        const cursor = await orderCollection.insertOne(order);
        res.send(cursor);
      })
      // Order review 
      app.get('/order', verifyJWT, async(req , res)=>{
        const email = req.query.email;
        const decodeEmail = req.decode.email;
        if(email === decodeEmail){
          const query = {email};
          const cursor = orderCollection.find(query);
          const order = await cursor.toArray();
          res.send(order)
        }else{
          res.status(403).send({message:'forbidden access'})
        }
      })
      // token 
      app.post('/login',(req , res) =>{
        const user = req.body;
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN,{
          expiresIn:'1d'
        });
        res.send(accessToken);
      })
    }finally{
      // await client.close();
    }
  }
  run().catch(console.dir);

// listen
app.listen(port, () => {
  console.log(`localhost:${port}`);
});
