const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../../../functions').end,
		obj='ACCION'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'algo':
			router.use('/'+modulo[3],require('./'+modulo[3]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})


/*------------------------GET---------------------------*/
router.get('/moduloID/:id',(req,res)=>{
   	const 	id=String(req.params.id),
   			Accion=req.models.Accion
   	
   	Accion.findAll({
		attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
		where:{
			parentID:null,
			moduloID:id,
			estado:'ACTIVO'
		},
		include:{
			model:Accion,as:'children',
			attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
			where:{estado:'ACTIVO'},
			required:false
		}
   	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Accion=req.models.Accion

	Accion.findOne({
		attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
		where:{
			ID:id,
			estado:'ACTIVO'
		},
		include:{
			model:Accion,as:'children',
			attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
			where:{estado:'ACTIVO'},
			required:false
		}
	}).then(data=>{(!data)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router