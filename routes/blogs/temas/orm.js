const Sequelize=require('sequelize')

const model=conn=>{
  const TemasBlog=conn.define('temas_blogs',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blogID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    temaID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })
  const Tema=conn.define('temas',{
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

  return{TemasBlog,Tema}
  exports.TemasBlog=TemasBlog
  exports.Tema=Tema
}
exports.model=model

exports.relations=conn=>{
  const Temas=model(conn),
        TemasBlog=Temas.TemasBlog,
        Tema=Temas.Tema

  Tema.hasMany(TemasBlog)

  return{
    Tema,
    TemasBlog
  }
}