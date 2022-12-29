const Sequelize = require('sequelize')

const model=conn=>{
  const Pago=conn.define('sesiones_pagos',{
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sesionID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    monto:{
      type:Sequelize.FLOAT,
      allowNull:false
    },
    tipo:{
      type:Sequelize.ENUM('PAGO','DEVOLUCION'),
      allowNull:false
    },
    fechaPago:Sequelize.DATE,
    paypalID:Sequelize.STRING,
    url_pago:Sequelize.STRING,
    url_exito:Sequelize.STRING,
    url_rechazo:Sequelize.STRING,
    estado: Sequelize.ENUM('ACTIVO', 'INACTIVO', 'BAJA', 'PENDIENTE', 'PAGADO', 'RECHAZADO', 'CANCELADO'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  return {
    Pago
  }
  
}
exports.model=model

exports.relations=conn=>{
  const Pago=model(conn).Pago,
        Profesional=require('../profesionales/orm').model(conn).Profesional,
        Paciente=require('../pacientes/orm').model(conn).Paciente
  
  return{
    Pago
  }
} 