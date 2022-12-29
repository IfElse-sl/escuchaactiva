const Sequelize=require('sequelize')

const model=conn=>{
  const File=conn.define('profesionales_files', {
  	ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profesionalID:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    tipo:{
      type:Sequelize.ENUM('DNI-A', 'DNI-R', 'CUIL', 'MONOTRIBUTO', 'TITULO'),
      allowNull: false
    },
    url:{
      type: Sequelize.STRING,
      allowNull: false
    },
    comentarios:Sequelize.STRING,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{File}
}

exports.model=model

exports.relations=conn=>{
  const   File=model(conn).File

  return{File}
}

