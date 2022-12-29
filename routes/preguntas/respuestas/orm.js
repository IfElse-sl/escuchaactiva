const Sequelize=require('sequelize')

const model=conn=>{
  const Respuesta=conn.define('respuestas', {
  	ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    preguntaID:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    numero:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    titulo:{
      type: Sequelize.STRING,
      allowNull: false
    },
    riesgo:{
      type: Sequelize.ENUM('ALTISIMO','ALTO','MEDIO','BAJO'),
      allowNull: false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Respuesta}
}

exports.model=model

exports.relations=conn=>{
  const   Respuesta=model(conn).Respuesta,
          Filtro=require('./respuestas/orm').model(conn).Filtro

  Respuesta.hasMany(Filtro)

  return{
    Respuesta,
    Filtro
  }
}

