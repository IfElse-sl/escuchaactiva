const Sequelize = require('sequelize')

const model=conn=>{
  const Sesion=conn.define('sesiones',{
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
    horarioID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    fecha:{
      type: Sequelize.DATE,
      allowNull:false
    },
    duracion:Sequelize.TIME,
    resumen:Sequelize.TEXT,
    estado: Sequelize.ENUM('PENDIENTE','ACTIVA','INACTIVA','BAJA','EN CURSO','FINALIZADO','AUSENTE','CANCELADA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {
    Sesion
  }
  
}
exports.model=model

exports.relations=conn=>{
  const Sesion=model(conn).Sesion,
        Profesional=require('../profesionales/orm').model(conn).Profesional,
        Paciente=require('../pacientes/orm').model(conn).Paciente,
        ProfesionalHorario=require('../profesionales/horarios/orm').model(conn).ProfesionalHorario,
        Pago=require('./pagos/orm').model(conn).Pago

  Sesion.belongsTo(Profesional,{as:'profesional'})
  Sesion.belongsTo(Paciente)
  Sesion.belongsTo(ProfesionalHorario,{as:'horario'})
  Sesion.hasMany(Pago,{as:'pagos',foreignKey:'sesionID'})
  Sesion.hasOne(Pago,{as:'pago',foreignKey:'sesionID'})
  
  return{
    Sesion,
    Profesional,
    Paciente,
    Pago,
    ProfesionalHorario
  }
} 