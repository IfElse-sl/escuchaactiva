const Sequelize=require('sequelize')

exports.model=function(conn){
  const History=conn.define('blogHistorys',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    blogID:{
      type: Sequelize.STRING,
      allowNull:false
    },
    tipo:{
      type: Sequelize.ENUM('CLICK','VIEW'),
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  const History_Day=conn.define('blogHistorys_days',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    blogID:{
      type: Sequelize.STRING,
      allowNull:false
    },
    fecha:{
      type:Sequelize.DATEONLY,
      allowNull:false
    },
    views:Sequelize.INTEGER,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {
    History,
    History_Day
  }
}