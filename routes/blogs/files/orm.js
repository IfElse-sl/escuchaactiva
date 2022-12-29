const Sequelize=require('sequelize')

const model=conn=>{
  const BlogFile=conn.define('blogFiles',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blogID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    titulo:{
      type: Sequelize.STRING,
      allowNull:false
    },
    url:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {
    BlogFile
  }
  exports.BlogFile=BlogFile
}
exports.model=model

exports.relations=conn=>{
  const BlogFile=model(conn).BlogFile

  return{BlogFile}
}