const Sequelize=require('sequelize')

const model=conn=>{
  const Blog=conn.define('blogs',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoriaID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    createdID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    imgPortada:Sequelize.STRING,
    titulo:{
      type: Sequelize.STRING,
      allowNull:false
    },
    introduccion:{
      type: Sequelize.TEXT,
      allowNull:false
    },
    desarrollo:{
      type: Sequelize.TEXT,
      allowNull:false
    },
    views:Sequelize.INTEGER,
    prioridad:Sequelize.INTEGER,
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt:Sequelize.DATE,
    updatedAt:Sequelize.DATE
  })

  return{Blog}
  exports.Blog=Blog
}
exports.model=model

exports.relations=conn=>{
  const Blog=model(conn).Blog,
        Usuario=require('../usuarios/orm').model(conn).Usuario,
        BlogFile=require('./files/orm').model(conn).BlogFile,
        Categoria=require('./categorias/orm').model(conn).Categoria,
        Temas=require('./temas/orm').model(conn),
        Tema=Temas.Tema,
        TemasBlog=Temas.TemasBlog

  Blog.hasMany(BlogFile,{as:'files'})
  Blog.belongsTo(Categoria)
  Blog.belongsTo(Usuario,{foreignKey:'createdID'})
  //Blog.hasMany(TemasBlog)
  //TemasBlog.belongsTo(Tema)
  Blog.belongsToMany(Tema,{through:TemasBlog})
  Tema.belongsToMany(Blog,{through:TemasBlog})
  Blog.hasMany(TemasBlog,{as:'blog_temas'})

  return{
    Blog,
    Usuario,
    BlogFile,
    Categoria,
    Tema,TemasBlog
  }
}