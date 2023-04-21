const Sequelize=require('sequelize')

const model=conn=>{
  const Profesional=conn.define('profesionales', {
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
    telefono:{
      type:Sequelize.STRING,
      allowNull:false
    },
    fecha_nac:{
      type:Sequelize.DATEONLY,
      allowNull:false
    },
    genero:Sequelize.ENUM('M','F','I'),
    edad_min:Sequelize.INTEGER,
    edad_max:Sequelize.INTEGER,
    religion:Sequelize.STRING,
    titulo:Sequelize.STRING,
    clientID:Sequelize.STRING,
    secret:Sequelize.STRING,
    constancia_monotributo:Sequelize.STRING,
    tipo_atencion:Sequelize.ENUM('TELEFONICA', 'VIDEOLLAMADA', 'TELEFONICA/VIDEOLLAMADA'),
    puntaje:Sequelize.FLOAT,
    cantOpiniones:Sequelize.INTEGER,
    resumen:Sequelize.STRING,
    informacion:Sequelize.TEXT,
    estado:Sequelize.ENUM('ACTIVO', 'INACTIVO', 'BAJA', 'PENDIENTE', 'PENDIENTE-CODIGO'),
    createdAt:Sequelize.DATE,
    updatedAt:Sequelize.DATE
  })

  return{Profesional}
}
exports.model=model

exports.relations=conn=>{
  const Profesional=model(conn).Profesional,
        Credencial=require('../credenciales/orm').model(conn).Credencial,
        Opinion=require('../opiniones/orm').model(conn).Opinion,
        Extras=require('../extras/orm').model(conn),
        Pais=Extras.Pais,
        Provincia=Extras.Provincia,
        Localidad=Extras.Localidad

  Profesional.hasOne(Credencial,{as:'credencial',foreignKey:'profesionalID'})
  Profesional.belongsTo(Pais,{as:'pais'})
  Profesional.belongsTo(Provincia)
  Profesional.belongsTo(Localidad,{as:'localidad'})
  Profesional.hasOne(Opinion,{as:'opinion',foreignKey:'profesionalID'})

  return{
    Profesional,
    Credencial,
    Opinion,
    Pais,Localidad,Provincia
  }
}

