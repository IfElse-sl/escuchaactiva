const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../functions').end,
		obj='PERMISO'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[4]){
		case 'modulos':
			router.use('/'+modulo[4],require('./'+modulo[4]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})


/*------------------------GET---------------------------*/
router.get('/v2',(req,res)=>{
   	const 	Permiso=req.models.Permiso
   	
   	Permiso.findAll({
		attributes: ['ID','moduloID','perfilID','estado'],
		where: {estado: {[Op.not]: 'BAJA'}},
		order: [['ID','DESC']]
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/v2/perfilID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Permiso=req.models.Permiso,
		 	Modulo=req.models.Modulo

	Permiso.findAll({
		attributes:[],
		where:{
			perfilID:id,
			estado:{[Op.not]:'BAJA'}
		},
		order:[[Modulo,'title','DESC']],
		include:[{
			model:Modulo,
			attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado'],
			where:{
				ID:{[Op.ne]:0},
				parentID:0,
				estado: {[Op.not]: 'BAJA'}
			},
			include:{
				model:Modulo,as:'children',
				attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado'],
				where: {estado: {[Op.not]: 'BAJA'}},
				required:false,
				include:{
					model:Modulo,as:'children',
					attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','estado'],
					where: {estado:{[Op.not]:'BAJA'}},
					required:false
				}
			}
		}]
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/v2',(req,res)=>{
	const 	body=req.body,
			Permiso=req.models.Permiso

	res.locals.conn.transaction().then(tr=>{
		Permiso.bulkCreate(body,{transaction:tr
		}).then(data=>{
			tr.commit()
			res.sendStatus(201)
		}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})


/*------------------------DELETE------------------------*/
router.delete('/v2/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Permiso=req.models.Permiso

	Permiso.destroy({where:{ID:id}
	}).then(data=>{(data!=0)?res.sendStatus(201):res.sendStatus(204)
	}).catch(err=>{end(res,err,'DELETE',obj)})
})

router.delete('/v2/perfilID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Permiso=req.models.Permiso

	res.locals.conn.transaction().then(tr=>{
		Permiso.destroy({
			where:{perfilID:id},
			transaction:tr
		}).then(data=>{
			if(data!=0){
				tr.commit()
				res.sendStatus(200)
			}else{
				tr.rollback()
				res.sendStatus(204)
			}
		}).catch(err=>{end(res,err,'DELETE',obj,tr)})
 	})
})


/*------------------------PATCH-------------------------*/
router.patch('/v2/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Permiso=req.models.Permiso

	Permiso.update({
		estado:body.estado,
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.sendStatus(201):res.sendStatus(204)
	}).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router