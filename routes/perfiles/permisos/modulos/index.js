const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../../functions').end,
		obj='MODULO'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[5]){
		case 'acciones':
			router.use('/'+modulo[5],require('./'+modulo[5]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})


/*------------------------GET---------------------------*/
router.get('/v2',(req,res)=>{
   	const 	Modulo=req.models.Modulo,
			Accion=req.models.Accion
   	
   	Modulo.findAll({
		attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado'],
		where: {
			ID:{[Op.ne]:0},
			parentID:0,
			estado: {[Op.not]: 'BAJA'}
		},
		order:['title'],
		include:[{
			model:Modulo,as:'children',
			attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado'],
			where:{estado:{[Op.not]:'BAJA'}},
			order:['title'],
			required:false,
			include:[{
				model:Modulo,as:'children',
				attributes: ['ID','parentID','title','routerLink','icon','hasSubMenu','estado'],
				where:{estado:{[Op.not]:'BAJA'}},
				order:['title'],
				required:false,
				include:{
					model:Accion,
					attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
					where:{estado:'ACTIVO'},
					required:false,
					include:{
						model:Accion,as:'children',
						attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
						where:{estado:'ACTIVO'},
						required:false
					}
				}
			},{
				model:Accion,
				attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
				where:{estado:'ACTIVO'},
				required:false,
				include:{
					model:Accion,as:'children',
					attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
					where:{estado:'ACTIVO'},
					required:false
				}
			}]
		},{
			model:Accion,
			attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
			where:{estado:'ACTIVO'},
			required:false,
			include:{
				model:Accion,as:'children',
				attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios'],
				where:{estado:'ACTIVO'},
				required:false
			}
		}]
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/v2/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Modulo=req.models.Modulo

	Modulo.update({
		estado:body.estado
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.sendStatus(201):res.sendStatus(204)
	}).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router