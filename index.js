const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const stripe = require('stripe')(process.env.Stripe_secrect_key);
const jwt = require('jsonwebtoken');
/// sign in , sign out , verfiy token
// set token local storage , axiossecure
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
    const usersCollection = client.db('cart').collection("users");



    // jwt sign and logout 

    // settoken on local stroage 

    app.post('/signin' ,async  (req,res)=>{

      const user = req.body;
      console.log(user);

      const token = jwt.sign(user, process.env.secrect_key, {expiresIn:'6h'})
      console.log("token is", token);

      res.send({token});

    })

    app.get('/logout' , (req,res)=>{
      // empty



    })

    // verfiy path 

    const verifiyPath = (req, res, next)=>{
      console.log('headers ' ,req.headers);

      const token = req.headers.authorization?.split(' ')[1];

      console.log("this token inside pathverify",token)

      if(!token)
      {
        return res.status(401).send({message : 'access denied token'})

      }
      jwt.verify(token, process.env.secrect_key,(error, decode)=>{
        if(error)
        {
          return res.status(403).send({message : 'indvalid expire token'})
        }
        req.user=decode;
      })
      



      next();
    }

    



   


   


    // get req 

    app.get('/products',async  (req , res)=>{

      const products = await productsCollection.find().toArray();
      res.send(products);


  
    })

    // implement cart 

    app.post('/cart', verifiyPath,  async (req,res)=>{
      // get item form boyd 

      const item = req.body;

      const result = await cartCollection.insertOne(item);
      res.send(result);



    })
    // get cart 

    app.get('/carts', verifiyPath, async (req,res)=>{
      const result = await cartCollection.find().toArray();
      res.send(result);
    })

    // user store in database

    app.post('/users', async (req,res)=>{
      const users = req.body;
      // get all user from body ;
      // now need user inser to make a collection 

      const result = await usersCollection.insertOne(users);

      // if 




      res.send(result);

    })

    // now find user 
    // this for admin
    app.get('/users', async (req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })


    // implement stripe

    // create payment initent 

    app.post('/create-payment-intent' , async (req,res)=>{

      const {price} = req.body;
      const amount = parseInt(price*100);
    

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


