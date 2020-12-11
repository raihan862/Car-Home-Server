const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
const ObjectId = require('mongodb').ObjectId
const MongoClient = require('mongodb').MongoClient;
const objectid = require('mongodb').ObjectId
require('dotenv').config();




const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('doctors'))
app.use(fileUpload())
const uname = process.env.USER_NAME;
const pass = process.env.PASSWORD;
const dbname = process.env.DATABASE_NAME;
const collection = process.env.COLLECTION;
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${uname}:${pass}@cluster0.5av9x.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get('/',(req,res)=>{
    res.send("hello")
})
client.connect(err=>{
    const Cars = client.db(dbname).collection(collection);

    app.post('/addCar',(req,res)=>{
        const Name = req.body.Name;
        const brandName = req.body.brandName;
        const modelName =  req.body.modelName;
        const price = req.body.price;
        const uploadedPhoto = imgProcess(req.files.file)
        
        Cars.insertOne({Name,brandName,modelName,price,uploadedPhoto})
        .then(result=>{
          console.log(result.insertedCount);
          const data ={Name,brandName,modelName,price,uploadedPhoto}
          res.set('data',data)
          
          res.status(200).send()
            })
        
        .catch(error=>{})
    
    })


    app.get("/getCars",(req,res)=>{

        Cars.find()
        .toArray((error,document)=>{
            res.send(document)
        })
    })
    app.get("/getCar/:modelName",(req,res)=>{

        Cars.find({modelName: req.params.modelName})
        .toArray((error,document)=>{
            res.send(document[0])
        })
    })

    app.put('/updateCar/:id',(req,res)=>{
        console.log("come");
        const Name = req.body.Name;
        const brandName = req.body.brandName;
        const modelName =  req.body.modelName;
        const price = req.body.price;
         
        let photo="";
        
         if (req.body.photo) {
             photo = req.body.photo;
         }
         let uploadedPhoto;
         console.log(req.body.uploadedPhoto);
         if (req.body.size) {
            const contentType = req.body.contentType
            const size = req.body.size;
            const img = req.body.img;
            uploadedPhoto = {contentType,size,img}

         }
        if (req.files) {  
            uploadedPhoto = imgProcess(req.files.file)
        } 
         
         
        Cars.updateOne({_id:ObjectId(req.params.id)},
        {
            $set:{Name,brandName,modelName,price,uploadedPhoto}
        }
        ).then(mgs=>{
            console.log("update success");
            res.redirect('/')
        })
        .catch(errr=>console.log(errr))
    })

    app.delete('/deleteCar/:id',(req,res)=>{
        console.log("come");
        Cars.deleteOne({_id:ObjectId(req.params.id)})
        .then(resp=>res.send("Delete SuccessFully"))
        .catch(err=>{
            console.log(err);
        })
       
    })
    
   
})







app.listen(port,(req,res)=>{
     
})

const imgProcess=(file)=>{
    
    const newImg = file.data
    const encImg = newImg.toString('base64')

    const   img={
        contentType: file.mimetype,
        size: file.size,
        
        img: Buffer.from(encImg, 'base64')
    } 
    return img
    


} 