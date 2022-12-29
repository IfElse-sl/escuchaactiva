const Sequelize = require('sequelize')

const model=conn=>{
  const TipoDocumento=conn.define('tiposDocumentos',{
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

  return{
    TipoDocumento
  }
}
exports.model=model