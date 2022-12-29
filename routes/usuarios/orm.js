const Sequelize = require('sequelize')

const model=conn=>{
  const Usuario=conn.define('usuarios',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    perfilID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    user:{
      type: Sequelize.STRING,
      allowNull:false
    },
    password:{
      type: Sequelize.STRING,
      allowNull:false
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull:false
    },
    direccion: Sequelize.STRING,
    telefono:Sequelize.INTEGER,
    genero:Sequelize.ENUM('M','F','I'),
    img:Sequelize.STRING,
    lastSesion:Sequelize.DATE,
    conexion: Sequelize.ENUM('CONECTADO','DESCONECTADO','NO MOLESTAR'),
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA','ESPECIAL'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Usuario}
  exports.Usuario=Usuario
}
exports.model=model

exports.relations=conn=>{
  const Usuario=model(conn).Usuario,
        Perfil=require('../perfiles/orm').model(conn).Perfil,
        Permiso=require('../perfiles/permisos/orm').model(conn).Permiso,
        Modulo=require('../perfiles/permisos/modulos/orm').model(conn).Modulo,
        Acciones=require('../perfiles/permisos/modulos/acciones/orm').model(conn),
        Permiso_Accion=Acciones.Permiso_Accion,
        Accion=Acciones.Accion,
        Mensaje=require('./mensajes/orm').model(conn).Mensaje
  
  Usuario.belongsTo(Perfil,{as:'perfil',foreignKey:'perfilID'})
  Usuario.hasMany(Mensaje,{foreignKey:'receiverID',as:'received'})
  Usuario.hasMany(Mensaje,{foreignKey:'talkerID',as:'sent'})

  Perfil.belongsToMany(Modulo,{through:Permiso,foreignKey:'perfilID'})
  Modulo.belongsToMany(Perfil,{through:Permiso})
  Modulo.hasMany(Accion)
  Perfil.hasMany(Permiso,{foreignKey:'perfilID'})
  Permiso.hasMany(Permiso_Accion)
  Permiso.hasMany(Permiso_Accion,{as:'acciones'})
  Accion.hasMany(Permiso_Accion,{foreignKey:'accionID'})
  
  return{
    Usuario,
    Perfil,
    Permiso,
    Permiso_Accion,
    Accion,
    Modulo,
    Mensaje
  }
}