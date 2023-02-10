const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../functions').end,
		obj='NOTIFICACION-USUARIO'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})

/*------------------------GET---------------------------*/
router.get('/notificacionID/:id/p/:p/l/:l',(req,res)=>{
	const 	id=parseInt(req.params.id),l=parseInt(req.params.l),p=parseInt(req.params.p)*l,
			NotificacionUsuario=req.models.NotificacionUsuario,
			Usuario=req.models.Usuario
	if(l>200) return res.status(400).json({code:400,msg:'Limit muy grande'})

	NotificacionUsuario.findAndCountAll({
		attributes:[[Sequelize.literal('usuario.ID'),'ID'],[Sequelize.literal('usuario.nombre'),'nombre']],
		where:{
			notificacionID:id,
			estado:{[Op.not]:'BAJA'}
		},
		//order:[['ID','DESC']],
		limit:[p,l],
		include:{
			model:Usuario,
			attributes:[]
		}
	}).then(data=>{(!data.rows.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/not-in/notificacionID/:id',(req,res)=>{
	const 	id=parseInt(req.params.id),
			NotificacionUsuario=req.models.NotificacionUsuario,
			Usuario=req.models.Usuario

	NotificacionUsuario.findOne({
		attributes:[[Sequelize.literal('GROUP_CONCAT(usuarioID)'),'ID']],
		where:{
			notificacionID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		var where={estado:'ACTIVO'}
		if(data) where.ID={[Op.notIn]:data.get('ID').split(',')}
		Usuario.findAll({
			attributes:['ID','nombre'],
			where:where,
			order:['nombre']
		}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
		}).catch(err=>{end(res,err,'GET',obj)})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/cant/no-leidas/usuarioID/:id',(req,res)=>{
	const 	id=parseInt(req.params.id),
			NotificacionUsuario=req.models.NotificacionUsuario,
			Notificacion=req.models.Notificacion

	NotificacionUsuario.count({
		where:{
			usuarioID:id,
			snVisto:false,
			estado:{[Op.not]:'BAJA'}
		},
		include:{model:Notificacion,as:'notificacion',attributes:[],where:{estado:'ACTIVO'}}
	}).then(data=>{(!data)?res.json({code:404}):res.status(200).json({code:200,data:{cant:data}})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/many',(req,res)=>{
	const 	body=req.body,
			NotificacionUsuario=req.models.NotificacionUsuario

	res.locals.conn.transaction().then(tr=>{
		NotificacionUsuario.bulkCreate(body,{transaction:tr
		}).then(data=>{
			tr.commit()
			res.json({code:201})
		}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})


/*------------------------DELETE-------------------------*/
router.delete('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			NotificacionUsuario=req.models.NotificacionUsuario

	NotificacionUsuario.destroy({where:{ID:id}
	}).then(data=>{(data==0)?res.json({code:404}):res.json({code:201})
	}).catch(err=>{end(res,err,'DELETE',obj)})
})


module.exports=router