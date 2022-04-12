const mysql =require("mysql");

const connection = mysql.createConnection({
    host:"yazlab1.cb1mdwd50emg.us-east-2.rds.amazonaws.com",
    user:"admin",
    password:"password",
    database:"yazlab1",
    insecureAuth : true
    
})
connection.connect();
module.exports={
    db:connection
}