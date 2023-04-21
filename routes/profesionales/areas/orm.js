const Sequelize=require('sequelize')
const model=conn=>{
  const ProfesionalArea=conn.define('profesionales_areas',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profesionalID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    areaID:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{ProfesionalArea}
  exports.ProfesionalArea=ProfesionalArea
}
exports.model=model

exports.relations=conn=>{
  const ProfesionalArea=model(conn).ProfesionalArea,
        Area=require('../../areas/orm').model(conn).Area
  
  ProfesionalArea.belongsTo(Area)
  Area.hasOne(ProfesionalArea)

  return{
    ProfesionalArea,
    Area
  }
}