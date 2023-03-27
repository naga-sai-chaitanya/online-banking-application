const express = require('express')
const ejs = require('ejs')
const app = express()
app.set('view engine',ejs)
require('dotenv').config({path:'./config.env'})
const path = require('path')
const bp = require('body-parser')
const getAccountNumber = require('./tools/genAccNo.js')
const jwt = require('jsonwebtoken')
const Customer = require('./models/Customer.js')
const Transactions = require('./models/Transactions.js')
app.use('/public',express.static(path.join(__dirname,'public')))
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(express.json())


//Home Page
app.get('/', (req,res) => {
    res.render('home-page.ejs')
})


//Dummy function
const someFun = () => {
    console.log('Good Morning....');
}

//created a function in github
const anotherFun = () => {
    console.log('good evening');
}

//created another function in vs code

const differentFun = () => {
    consolel.log('good night');
}

//adding dynamic functionality
const updateData = (data) => {
    setTimeout(()=>{
        console.log('Data updated.....')
    },3000)
    
}

//To resgister a Customer
app.post('/register', async(req,res) => {
    
    const accountNumber = getAccountNumber()
    const {name,email,password} = req.body
    const customer = new Customer({"name":name,"email":email,"password":password,"accountNumber":accountNumber,"balance":10000})
    customer.save((err,data) => {
        if(err){
            if(err.code == 11000 && err.name == 'MongoServerError'){
               return  res.sendStatus(400)
            }
        }
        res.send('Register Successfully.').status(200)
    })
    
})




//To Login a User
app.post('/login',(req,res) => {
    const {email,password} = req.body;
    Customer.find({"email":email},(err,data) => {
        
        if(err){
            console.log(err)
        }
        if(data.length == 0){
            return res.render('error-home-page.ejs',{message:'User Not registered'})
        }
        else{
            const enteredPassword = data[0].password;
            if(password == enteredPassword){
                const userName = data[0].name;
                var SECRET_KEY = process.env.SECRET_KEY;
                var token = jwt.sign({email,userName},SECRET_KEY)
                res.cookie('jwt',token , { httpOnly: true, secure: true, maxAge: 3600000 })
                res.redirect('/dashboard')
            }
            else{
                
                return res.render('error-home-page.ejs',{message:'Password Incorrect!!!'})
            }
        }
    })
})


//Protected page
app.get('/dashboard', verifyToken, async(req, res) => {
    const name = req.user
    res.render('dashboard.ejs',{user:name})
})


//To logout a user
app.get('/logout',async(req, res) => {
    return res.clearCookie('jwt').render('home-page.ejs');
})


//To check token
function verifyToken(req,res,next){
    if(typeof req.headers.cookie == undefined){
        return res.sendStatus(400)
    }
    else{
        
        const cookie = req.headers.cookie;
       
        if(!cookie){
            return res.send('Session Expired!!! Login Again');
        }
        try{
            var jwt_token = cookie.split("jwt")[1].split("=")[1];
        }
        catch(err){
            return res.send('You have logged Out!! Kindly Login Again')
        }

        var SECRET_KEY = process.env.SECRET_KEY;
        const isValid = jwt.verify(jwt_token,SECRET_KEY);

        if(isValid){
            function parseJwt (jwt_token) {
                return JSON.parse(Buffer.from(jwt_token.split('.')[1], 'base64').toString());
            }
            const decoded = parseJwt(jwt_token)
            req.user = decoded.userName;
            next()
        }
        else{
            res.sendStatus(403)
        }
    }

}


//To fetch balance of a user
app.get('/balance',verifyToken,(req,res) => {
   
    const userName = req.user;
    Customer.find({name:userName},(err,result)=>{
        if(err){
            console.log(err)
        }
       
        return res.send(result[0])
        
    })

})


//POST request to transfer Funds
app.post('/transfer',verifyToken,(req,res)=>{
    const benificiaryAcc = req.body.accountNo;
    const amount = req.body.amount;
    
    const userName = req.user;
    Customer.findOne({name:userName},(err,found) => {
        if(err){
            console.log(err)
        }
        const senderUserBal = found["balance"]
        const senderAccNo = found.accountNumber;
        const senderName = found.name;
        if(parseInt(senderUserBal) < parseInt(amount)){
            return res.json({status:'failed',msg:'Insuficciant Funds!!!'})
        }
        
        Customer.findOne({accountNumber:benificiaryAcc},(err,benificiary) => {
            if(err){
                console.log(err)
            }
            if(!benificiary){
                return res.json({status:'failed',msg:'Account Not found!!!Please check Account Number.'})

            }
            else{
                const benificiary_bal = benificiary.balance;
                deduceSenderBal(userName,senderUserBal,amount)
                var updatedBalance = parseInt(amount) + parseInt(benificiary_bal)
                Customer.findOneAndUpdate({accountNumber:benificiaryAcc},{balance:updatedBalance},(err,result)=>{
                    if(err){
                        console.log(err)
                    }
                    var dt = new Date();
                    var userId = found._id.toString()
                    var benAccNo = benificiary.accountNumber;
                    var benName = benificiary.name;
                    var benId = benificiary._id.toString();
        
                    saveTransaction(userId,dt,benAccNo,benName,0,amount);

                    saveReceiverTransaction(benId,dt,senderAccNo,senderName,amount);
                    return res.json({status:'success',msg:'Transaction Successful.'})
                })
            }
            
        })

    })
})

//To save receiver transaction
const saveReceiverTransaction = (benId,dt,senderAccNo,senderName,amount) => {
    const transaction = new Transactions({"userId":benId,"date":dt,"accountNo":senderAccNo,"name":senderName,"Received":amount,"Sent":0})
    transaction.save((err,saved) => {
        if(err){
            console.log(err)
        }
        return;
    })
}

    






//To fetch all transactions
app.get('/transactions',(req,res) => {
    Transactions.find({},(err,all)=>{
        if(err){
            console.log(err)
        }
        console.log('typeof all',typeof(all));
        res.send(all)
    })
})

//To delete all transactions
app.delete('/transactions',(req,res) => {
    Transactions.deleteMany({},(err,deleted) => {
        if(err){
            console.log(err)
        }
        res.send(deleted)
    })
})


//To fetch transactions of a user without date
app.get('/transaction?',verifyToken,async(req,res)=>{
    const name = req.user;
    Customer.findOne({name:name},(err,found)=>{
        if(err){
            console.log(err)
        }
        const id = found._id.toString()
        
        Transactions.find({userId:id},(err,result)=>{
            if(err){
                console.log(err)
            }
           
            return res.send(result);
        })  
    })
   
})

//To fetch transactions of a user based on date

app.get('/transactions/user?', verifyToken, (req,res)=>{
    const name = req.user;
    Customer.findOne({name:name},(err,found)=>{
        if(err){
            console.log(err)
        }
        var {from,to} = req.query;
        const id = found._id.toString()
        to = new Date(to)
        to.setDate(to.getDate() + 1);

        Transactions.find({date:{$gte:from,$lte:to},userId:id},(err,results)=>{
            if(err){
                console.log(err)
            }
            
            return res.send(results)
        }) 
    })

})

//Check whether current date is including or not
app.get('/dummy/transaction?', (req, res)=>{
    var {id,from,to} = req.query;

    to = new Date(to)

    to.setDate(to.getDate() + 1);

    console.log('id,from,to',id,from,to);

    Transactions.find({date:{$gte:from,$lte:to},userId:id},(err,results)=>{
        if(err){
            console.log(err)
        }
        
        res.send(results)
        
    }) 
})






//To save the transaction
const saveTransaction = (userId,dt,benAccNo,benName,received,sent) => {
    const transaction = new Transactions({"userId":userId,"date":dt,"accountNo":benAccNo,"name":benName,"Received":received,"Sent":sent})
    transaction.save((err,saved) => {
        if(err){
            console.log(err)
        }
        return;
    })
}


//Deduce sender Balance
const deduceSenderBal = (userName,balance,amount) => {
    var updated = parseInt(balance) - parseInt(amount)
    Customer.findOneAndUpdate({name:userName},{balance:updated},(err,updated)=>{
        if(err){
            console.log(err)
        }
       
        return;
    })
}


//FETCH all customers
app.get('/customers',(req,res) => {
    Customer.find({},(err,data) => {
        if(err){
            console.log(err)
        }
        res.send(data)
    })
})

//DELETE all customers
app.delete('/customers',(req,res) => {
    Customer.deleteMany({},(err,deleted) => {
        if(err){
            console.log(err)
        }
        res.send(deleted)
    })
})


const port = process.env.PORT || 4060
//PORT
app.listen(port,(err) => {
    if(err){
        console.log(err)
    }
    console.log(`Server running on port ${port}`);
})
