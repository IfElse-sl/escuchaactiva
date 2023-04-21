const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		end=require('../functions').end,
		obj='ORIENTACION'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/',(req,res)=>{
   	const 	Orientacion=req.models.Orientacion
   	
   	Orientacion.findAll({
		attributes:['ID','nombre'],
		where:{estado:'ACTIVO'},
		order:['nombre']
	}).then(data=>{(!data.length)?res.json({code:204}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router