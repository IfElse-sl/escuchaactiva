const Sequelize=require('sequelize')

exports.model=conn=>{
  const Provincia=conn.define('provincias', {
  	ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    paisID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull:false
    },
    estado:Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt:Sequelize.DATE,
    updatedAt:Sequelize.DATE
  })

  const Localidad = conn.define('localidades', {
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provinciaID:{
      type:Sequelize.INTEGER,
      allowNull:false
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull: false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  const Pais = conn.define('paises', {
    ID:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre:{
      type: Sequelize.STRING,
      allowNull: false
    },
    estado: Sequelize.ENUM('ACTIVO','INACTIVO','BAJA'),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  })

  Localidad.belongsTo(Provincia)
  Provincia.hasMany(Localidad)
  Provincia.belongsTo(Pais,{as:'pais'})
  Pais.hasMany(Provincia,{foreignKey:'paisID'})

  return{Localidad,Provincia,Pais}
  exports.Pais=Pais
  exports.Provincia=Provincia
  exports.Localidad=Localidad
}