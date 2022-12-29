const Sequelize=require('sequelize')

const model=conn=>{
  const Perfil=conn.define('perfiles',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Perfil}
  exports.Perfil=Perfil
}
exports.model=model

exports.relations=conn=>{
  const Perfil=model(conn).Perfil,
        Permiso=require('./permisos/orm').model(conn).Permiso,
        Modulo=require('./permisos/modulos/orm').model(conn).Modulo,
        Acciones=require('./permisos/modulos/acciones/orm').model(conn),
        Accion=Acciones.Accion,
        Permiso_Accion=Acciones.Permiso_Accion

  Perfil.belongsToMany(Modulo,{through:Permiso,foreignKey:'perfilID'})
  Modulo.belongsToMany(Perfil,{through:Permiso})
  Modulo.hasMany(Accion)
  Perfil.hasMany(Permiso,{foreignKey:'perfilID'})
  Permiso.hasMany(Permiso_Accion)
  Permiso.hasMany(Permiso_Accion,{as:'acciones'})

  return{
    Perfil,
    Permiso,
    Modulo,
    Accion,
    Permiso_Accion
  }
}