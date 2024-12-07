const { resolve } = require('path')
const mysql = require('./databaseSetupMysql')

const getConnection = async ()=>{
    return new Promise((resolve, reject)=>{
        mysql.pool.getConnection((err,connection)=>{
            err?reject(err):resolve(connection)
        })
    })
}

exports.execute = async function(query, bindValuesArray){
    return new Promise(async (resolve, reject)=>{
        try{
            const connection = await getConnection()
            connection.query(query, bindValuesArray, function (err, result){
                if (err) {
                    connection.release();
                    reject(err);
                } else {
                    connection.release();
                    resolve(result);
                }
            })
        }catch(e){
            reject(e);
        }
    })
}   