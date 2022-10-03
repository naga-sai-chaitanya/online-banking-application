

const express = require('express')
const ejs = require('ejs')

const app = express()

app.set('view engine',ejs)


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

app.get('/', (req,res) => {
    res.render('home-page.ejs')
})


//To resgister a Customer
app.post('/register', async(req,res) => {
    
    const accountNumber = getAccountNumber()
    console.log('accountNumber',accountNumber)
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
                var token = jwt.sign({email,userName},'mySecretKey')
                console.log('token generated',token);
            
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
    //console.log("req.user",req.user)
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
        res.sendStatus(400)
    }
    else{
        
        const cookie = req.headers.cookie;
        if(cookie == undefined){
            return res.send('Session Expired!!! Login Again');
        }
        
        const jwt_token = cookie.split("jwt")[1].split("=")[1];
      
        const isValid = jwt.verify(jwt_token,'mySecretKey')
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
   // console.log('in transfer post route')
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
            return res.send('Insuficciant Funds!!!')
        }
        
        Customer.findOne({accountNumber:benificiaryAcc},(err,benificiary) => {
            if(err){
                console.log(err)
            }
            if(!benificiary){
                return res.send('Account Not found!!!Please check Account Number.')

            }
            else{
                const benificiary_bal = benificiary.balance;
                deduceSenderBal(userName,senderUserBal,amount)
                var updatedBalance = parseInt(amount) + parseInt(benificiary_bal)
                Customer.findOneAndUpdate({accountNumber:benificiaryAcc},{balance:updatedBalance},(err,result)=>{
                    if(err){
                        console.log(err)
                    }
                    var dt = new Date().toDateString()
                    var userId = found._id.toString()
                    var benAccNo = benificiary.accountNumber;
                    var benName = benificiary.name;
                    var benId = benificiary._id.toString();
        
                    saveTransaction(userId,dt,benAccNo,benName,0,amount);

                    saveReceiverTransaction(benId,dt,senderAccNo,senderName,amount);
                    return res.send('Transaction Successful.');
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


//To fetch transactions of a user
app.get('/transaction',verifyToken,async(req,res)=>{
    const name = req.user;
    Customer.findOne({name:name},(err,found)=>{
        if(err){
            console.log(err)
        }
        const id = found._id.toString()
        console.log('id',id);
        Transactions.find({userId:id},(err,result)=>{
            if(err){
                console.log(err)
            }
            //console.log('result',result);
            res.send(result);
        })
        
    })
   
})


//To save the transaction
const saveTransaction = (userId,dt,benAccNo,benName,received,sent) => {
    const transaction = new Transactions({"userId":userId,"date":dt,"accountNo":benAccNo,"name":benName,"Received":received,"Sent":sent})
    transaction.save((err,saved) => {
        if(err){
            console.log(err)
        }
        //console.log('Transaction saved...')
        return;
    })
}

const deduceSenderBal = (userName,balance,amount) => {
    var updated = parseInt(balance) - parseInt(amount)
    Customer.findOneAndUpdate({name:userName},{balance:updated},(err,updated)=>{
        if(err){
            console.log(err)
        }
        //console.log('updated...')
        return;
    })
}


//To fetch all users
app.get('/customers',(req,res) => {
    Customer.find({},(err,data) => {
        if(err){
            console.log(err)
        }
        res.send(data)
    })
})

//To delete all users
app.delete('/customers',(req,res) => {
    Customer.deleteMany({},(err,deleted) => {
        if(err){
            console.log(err)
        }
        res.send(deleted)
    })
})


app.listen(4060,(err) => {
    if(err){
        console.log(err)
    }
    console.log('Server running on port 4060');
})
