const Sequelize = require('sequelize')

exports.conn=function(host,user,db,pass){  
  const db2=new Sequelize(db,user,pass,{
    host:host,
    dialect:'mysql',
    timezone:'-03:00',
    dialectOptions:{
      dateStrings:true
    },
    operatorsAliases:false
  })

  db2.authenticate().then(()=>{
      console.log('Conectado....')
  }).catch(err=>{console.error('Error al conectar con la DB:', err)})
  return db2
}