const Sequelize=require('sequelize')

const model=conn=>{
  const Modulo=conn.define('modulos',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    parentID:Sequelize.INTEGER,
    title:{
      type: Sequelize.STRING,
      allowNull:false
    },
    routerLink:Sequelize.STRING,
    icon:{
      type: Sequelize.STRING,
      allowNull:false
    },
    hasSubMenu:{
      type: Sequelize.BOOLEAN,
      allowNull:false
    },
    target:Sequelize.STRING,
    href:Sequelize.STRING,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA','EN PROCESO','BETA','NUEVO'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  Modulo.hasMany(Modulo,{foreignKey:'parentID',as:'children'})

  return{Modulo}
  exports.Modulo=Modulo
}
exports.model=model

exports.relations=conn=>{
  const Modulo=model(conn).Modulo,
        Accion=require('./acciones/orm').model(conn).Accion

  Modulo.hasMany(Accion)

  return{
    Modulo,
    Accion
  }
}