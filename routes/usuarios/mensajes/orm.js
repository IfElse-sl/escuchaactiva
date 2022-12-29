const Sequelize = require('sequelize')

const model=conn=>{
  const Mensaje=conn.define('usuariosMensajes',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    talkerID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    receiverID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    message:{
      type:Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('PENDIENTE','LEIDA','BAJA','ACTIVO'),
    readAt: Sequelize.DATE,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {
    Mensaje
  }
  exports.Mensaje=Mensaje
}
exports.model = model

exports.relations=conn=>{
  const Mensaje = model(conn).Mensaje,
        Usuario = require('../orm').model(conn).Usuario

  Mensaje.belongsTo(Usuario,{foreignKey:'receiverID',as:'reciver'})
  Mensaje.belongsTo(Usuario,{foreignKey:'talkerID',as:'talker'})
//  Usuario.hasMany(Mensaje,{foreignKey:'receiverID',as:'received'})
//  Usuario.hasMany(Mensaje,{foreignKey:'talkerID',as:'sent'})

  return{
    Mensaje,
    Usuario
  }
}

