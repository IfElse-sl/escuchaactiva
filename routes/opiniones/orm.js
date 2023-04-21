const Sequelize = require('sequelize')

const model=conn=>{
  const Opinion=conn.define('opiniones',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pacienteID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    profesionalID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    puntaje:{
      type: Sequelize.FLOAT,
      allowNull:false
    },
    comentarios:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVA','INACTIVA','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {
    Opinion
  }
  
}
exports.model=model

exports.relations=conn=>{
  const Opinion=model(conn).Opinion,
        Profesional=require('../profesionales/orm').model(conn).Profesional,
        Paciente=require('../pacientes/orm').model(conn).Paciente

  Opinion.belongsTo(Profesional,{as:'profesional'})
  Opinion.belongsTo(Paciente)
  
  return{
    Opinion,
    Profesional,
    Paciente
  }
} 