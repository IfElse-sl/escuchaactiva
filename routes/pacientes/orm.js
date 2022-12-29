const Sequelize=require('sequelize')

const model=conn=>{
  const Paciente=conn.define('pacientes', {
  	ID:{
      type:Sequelize.INTEGER,
      primaryKey:true,
      autoIncrement:true,
    },
    paisID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    provinciaID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    localidadID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    foto:Sequelize.STRING,
    nombre:{
      type:Sequelize.STRING,
      allowNull:false
    },
    apellido:{
      type:Sequelize.STRING,
      allowNull:false
    },
    fecha_nac:{
      type:Sequelize.DATEONLY,
      allowNull:false
    },
    telefono:Sequelize.STRING,
    genero:Sequelize.ENUM('M','F','I'),
    informacion:Sequelize.STRING,
    estado:Sequelize.ENUM('ACTIVO', 'INACTIVO', 'BAJA', 'PENDIENTE', 'PENDIENTE-CODIGO'),
    createdAt:Sequelize.DATE,
    updatedAt:Sequelize.DATE
  })

  return{Paciente}
}
exports.model=model

exports.relations=conn=>{
  const Paciente=model(conn).Paciente,
        Credencial=require('../credenciales/orm').model(conn).Credencial,
        Extras=require('../extras/orm').model(conn),
        Sesion=require('../sesiones/orm').model(conn).Sesion,
        Pais=Extras.Pais,
        Provincia=Extras.Provincia,
        Localidad=Extras.Localidad

  Paciente.hasOne(Credencial,{as:'credencial',foreignKey:'pacienteID'})
  Paciente.belongsTo(Pais,{as:'pais'})
  Paciente.belongsTo(Provincia)
  Paciente.belongsTo(Localidad,{as:'localidad'})
  Paciente.hasOne(Sesion,{as:'sesion',foreignKey:'pacienteID'})

  return{
    Paciente,
    Credencial,
    Sesion,
    Pais,Localidad,Provincia
  }
}

