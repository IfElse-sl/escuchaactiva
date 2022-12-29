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
    codigo:{
        type:Sequelize.STRING,
        allowNull:false
    },
    estado: Sequelize.ENUM('ACTIVO','PENDIENTE','INACTIVO','BAJA'),
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

      Credencial.belongsTo(Comercio,{as:'comercios',foreignKey:'comercioID'})
      Credencial.belongsTo(Consumidor,{as:'consumidores',foreignKey:'consumidorID'})
  
  return{
    Credencial,
    Comercio,
    Consumidor
  }
} 