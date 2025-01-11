const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const stripe = require('stripe')(process.env.Stripe_secrect_key);

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

    const productsCollection = client.db('product').collection('products');
    const cartCollection = client.db('cart').collection("carts");
    const paymentsCollection = client.db('cart').collection("payments");



   


   


    // get req 

    app.get('/products',async  (req , res)=>{

      const products = await productsCollection.find().toArray();
      res.send(products);


  
    })

    // implement cart 

    app.post('/cart', async (req,res)=>{
      // get item form boyd 

      const item = req.body;

      const result = await cartCollection.insertOne(item);
      res.send(result);



    })
    // get cart 

    app.get('/carts', async (req,res)=>{
      const result = await cartCollection.find().toArray();
      res.send(result);
    })


    // implement stripe

    // create payment initent 

    app.post('/create-payment-intent' , async (req,res)=>{

      const {price} = req.body;
      const amount = parseInt(price*100);
      console.log(amount,'inside ammount')

      const paymentIntent= await stripe.paymentIntents.create({
        amount : amount,
        currency : 'usd',
        payment_method_types:['card']



      })
      res.send({
        clientSecret: paymentIntent.client_secret 
      })

    })


    // payment post data 

    app.post('/payments' , async (req,res)=>{
      const payment = req.body;
      const paymentResult = await paymentsCollection.insertOne(payment);
   

      // delete payment id 
      const query = {_id : {
        // $in : paymentCards.map(id => new object(id))

     
      }}
      // delete many (id);
      res.send(paymentResult);
    })


    



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


