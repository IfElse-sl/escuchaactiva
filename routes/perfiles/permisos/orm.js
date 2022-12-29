const Sequelize=require('sequelize')

const model=conn=>{
  const Permiso=conn.define('permisos',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    perfilID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    moduloID:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA','ESPECIAL'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Permiso}
  exports.Permiso=Permiso
}
exports.model=model

exports.relations=conn=>{
  const Permiso=model(conn).Permiso,
        Modulo=require('./modulos/orm').model(conn).Modulo,
        Acciones=require('./modulos/acciones/orm').model(conn),
        Accion=Acciones.Accion,
        Permiso_Accion=Acciones.Permiso_Accion
  
  Permiso.belongsTo(Modulo)
  Permiso.belongsToMany(Accion,{through:Permiso_Accion})

  return{
    Permiso,
    Modulo,
    Accion,
    Permiso_Accion
  }
}