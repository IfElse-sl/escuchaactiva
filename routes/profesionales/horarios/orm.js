const Sequelize=require('sequelize')
const model=conn=>{
  const ProfesionalHorario=conn.define('profesionales_horarios',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profesionalID:{
      type: Sequelize.INTEGER,
      allowNull:false
    },
    dia:{
      type: Sequelize.ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'),
      allowNull:false
    },
    hora_desde:{
      type: Sequelize.TIME,
      allowNull:false
    },
    hora_hasta:{
      type: Sequelize.TIME,
      allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return{ProfesionalHorario}
  exports.ProfesionalHorario=ProfesionalHorario
}
exports.model=model

exports.relations=conn=>{
  const ProfesionalHorario=model(conn).ProfesionalHorario,
        Sesion=require('../../sesiones/orm').model(conn).Sesion,
        Pago=require('../../sesiones/pagos/orm').model(conn).Pago,
        Paciente=require('../../pacientes/orm').model(conn).Paciente

  ProfesionalHorario.hasMany(Sesion,{as:'sesiones',foreignKey:'horarioID'})
  ProfesionalHorario.hasOne(Sesion,{as:'sesion',foreignKey:'horarioID'})
  Sesion.hasOne(Pago,{as:'pago',foreignKey:'sesionID'})
  Sesion.belongsTo(Paciente)

  return{
    ProfesionalHorario,
    Sesion,
    Pago,
    Paciente
  }
}