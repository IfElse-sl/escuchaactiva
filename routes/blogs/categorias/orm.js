const Sequelize=require('sequelize')

exports.model=function(conn){
  const Categoria=conn.define('categorias',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {Categoria}
  exports.Categoria=Categoria
}