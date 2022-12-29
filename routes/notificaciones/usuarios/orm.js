const Sequelize=require('sequelize')

const model=conn=>{
  const NotificacionUsuario=conn.define('notificaciones_usuarios',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuarioID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    notificacionID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    snVisto:Sequelize.BOOLEAN,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA','BAJA-AUTO'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{NotificacionUsuario}
  exports.NotificacionUsuario=NotificacionUsuario
}
exports.model=model

exports.relations=conn=>{
  const NotificacionUsuario=model(conn).NotificacionUsuario,
        Usuario=require('../../usuarios/orm').model(conn).Usuario
        Notificacion=require('../orm').model(conn).Notificacion

  NotificacionUsuario.belongsTo(Usuario)
  NotificacionUsuario.belongsTo(Notificacion,{as:'notificacion'})

  return{NotificacionUsuario,Usuario,Notificacion}
}