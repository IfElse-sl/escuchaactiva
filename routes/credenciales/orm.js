const Sequelize = require('sequelize')

const model=conn=>{
  const Credencial=conn.define('credenciales',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profesionalID:Sequelize.INTEGER,
    pacienteID:Sequelize.INTEGER,
    email:{
      type: Sequelize.STRING,
      allowNull:false
    },
    pass:{
      type: Sequelize.STRING,
      allowNull:false
    },
    token:Sequelize.STRING,
    codigo:Sequelize.STRING,
    estado: Sequelize.ENUM('ACTIVO','PENDIENTE','INACTIVO','BAJA','PENDIENTE-CODIGO'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{Credencial}
}
exports.model=model

exports.relations=conn=>{
  const Credencial=model(conn).Credencial,
        Profesional=require('../profesionales/orm').model(conn).Profesional,
        Paciente=require('../pacientes/orm').model(conn).Paciente

      Credencial.belongsTo(Profesional,{as:'profesionales',foreignKey:'profesionalID'})
      Credencial.belongsTo(Paciente,{as:'pacientes',foreignKey:'pacienteID'})
  
  return{
    Credencial,
    Profesional,
    Paciente
  }
} 