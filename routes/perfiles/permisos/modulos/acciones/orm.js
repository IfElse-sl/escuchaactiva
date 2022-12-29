const Sequelize=require('sequelize')

const model=conn=>{
  const Accion=conn.define('modulos_acciones',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    moduloID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    parentID:Sequelize.INTEGER,
    htmlID:Sequelize.STRING,
    title:{
      type: Sequelize.STRING,
      allowNull:false
    },
    icon:Sequelize.STRING,
    href:Sequelize.STRING,
    url:Sequelize.STRING,
    type:Sequelize.STRING,
    position:Sequelize.STRING,
    comentarios:Sequelize.STRING,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  const Permiso_Accion=conn.define('permisos_acciones',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    permisoID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    accionID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  Accion.hasMany(Accion,{foreignKey:'parentID',as:'children'})

  return{Accion,Permiso_Accion}
  exports.Accion=Accion
  exports.Permiso_Accion=Permiso_Accion
}
exports.model=model

exports.relations=conn=>{
  const Accion=model(conn).Accion

  return{Accion}
}