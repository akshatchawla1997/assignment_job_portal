const mysql = require("mysql2")

const pool = mysql.createPool({
    connectionLimit : 10,
    // host : "64.202.188.184",   //when using workbench in system then use it
    host: "localhost",  // ip address of server running mysql
    port:  "3306",
    user: "root",    // user name to your mysql database
    password: "1234",
    database: "jobportal", // use the specified database
    multipleStatements: true
})


module.exports = {
    pool    
}