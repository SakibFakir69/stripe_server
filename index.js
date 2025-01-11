const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json())


// 

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USERP_ASS}@cluster0.7ewvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect()




    // Database 

    const productsCollection = client.db('product').collection('products')

   


   


    // get req 

    app.get('/products',async  (req , res)=>{

      const products = await productsCollection.find().toArray();
      res.send(products);


  
    })

    // implement cart 

    app.post('/cart', async (req,res)=>{
      // get item form boyd 

      const item = req.body;

      const result = await productsCollection.insertOne(item);
      res.send(result);



    })
    // get 


    // implement stripe


    



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.log);


// test

app.get('/',(req,res)=>{
    res.send("okay")
})

// run

app.listen(port,()=> console.log(`server running on ${port}`))


