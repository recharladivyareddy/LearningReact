mongoose.connect(`mongodb://localhost:27017//codingPlatform`)
.then(()=>{
 console.log(`MongoDB Connected on port : 27017`)
})
.catch((err)=>{ console.log(err)})

let myschema=new mongoose.Schema({
    email:String,
    password:String
   })

let mymodel=new mongoose.model(col,myschema);

model.exports = mymodel;