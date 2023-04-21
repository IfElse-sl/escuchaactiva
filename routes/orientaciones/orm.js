const Sequelize=require('sequelize')

const model=conn=>{
  const Orientacion=conn.define('orientaciones', {
  	ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull: false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Orientacion}
}

exports.model=model

exports.relations=conn=>{
  const   Orientacion=model(conn).Orientacion

  return{Orientacion}
}

