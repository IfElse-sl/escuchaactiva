const Sequelize=require('sequelize')

const model=conn=>{
  const Pregunta=conn.define('preguntas', {
  	ID:{
      type: Sequelize.INTEGER,
      primaryKey:true,
      autoIncrement:true,
    },
    numero:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    titulo:{
      type:Sequelize.STRING,
      allowNull:false
    },
    tipo:{
      type: Sequelize.ENUM('NORMAL','RIESGO'),
      allowNull:false
    },
    estado:Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt:Sequelize.DATE,
    updatedAt:Sequelize.DATE
  })

  return{Pregunta}
}

exports.model=model

exports.relations=conn=>{
  const   Pregunta=model(conn).Pregunta,
          Respuesta=require('./respuestas/orm').model(conn).Respuesta,
          Filtro=require('./respuestas/filtros/orm').model(conn).Filtro

  Pregunta.hasMany(Respuesta)
  Respuesta.hasMany(Filtro)

  return{
    Pregunta,
    Respuesta,
    Filtro
  }
}

