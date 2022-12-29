const Sequelize=require('sequelize')

const model=conn=>{
  const Filtro=conn.define('respuestas_filtros', {
  	ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    respuestaID:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    areaID:Sequelize.INTEGER,
    orientacionID:Sequelize.INTEGER,
    attribute:Sequelize.STRING,
    value:Sequelize.STRING,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Filtro}
}

exports.model=model

exports.relations=conn=>{
  const   Filtro=model(conn).Filtro

  return{
    Filtro
  }
}

