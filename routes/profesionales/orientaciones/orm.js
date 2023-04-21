const Sequelize=require('sequelize')
const model=conn=>{
  const ProfesionalOrientacion=conn.define('profesionales_orientaciones',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profesionalID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    orientacionID:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{ProfesionalOrientacion}
  exports.ProfesionalOrientacion=ProfesionalOrientacion
}
exports.model=model

exports.relations=conn=>{
  const ProfesionalOrientacion=model(conn).ProfesionalOrientacion,
        Orientacion=require('../../orientaciones/orm').model(conn).Orientacion
  
  ProfesionalOrientacion.belongsTo(Orientacion,{foreignKey:'orientacionID'})
  Orientacion.hasOne(ProfesionalOrientacion,{foreignKey:'orientacionID'})

  return{
    ProfesionalOrientacion,
    Orientacion
  }
}