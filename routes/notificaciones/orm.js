const Sequelize=require('sequelize')

const model=conn=>{
  const Notificacion=conn.define('notificaciones',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo:{
      type:Sequelize.STRING,
      allowNull:false
    },
    descripcion:Sequelize.STRING,
    url:Sequelize.STRING,
    tipo:Sequelize.STRING,
    estado:Sequelize.ENUM('ACTIVO','INACTIVO','BAJA','BORRADOR','BAJA-AUTO'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Notificacion}
  exports.Notificacion=Notificacion
}
exports.model=model

exports.relations=conn=>{
  const Notificacion=model(conn).Notificacion,
        NotificacionUsuario=require('./usuarios/orm').model(conn).NotificacionUsuario,
        Usuario=require('../usuarios/orm').model(conn).Usuario

  Notificacion.hasMany(NotificacionUsuario,{foreignKey:'notificacionID'})

  return{
    Notificacion,
    NotificacionUsuario,
    Usuario
  }
}