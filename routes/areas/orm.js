const Sequelize=require('sequelize')

const model=conn=>{
  const Area=conn.define('areas', {
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

  return{Area}
}

exports.model=model

exports.relations=conn=>{
  const   Area=model(conn).Area

  return{Area}
}

