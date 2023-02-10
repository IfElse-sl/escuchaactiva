const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		io=require('socket.io-client'),
		config=require('../../../config'),
		end=require('../functions').end,
		obj='NOTIFICACION'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'usuarios':
			router.use('/'+modulo[3],require('./'+modulo[3]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})

/*------------------------FUNCTION---------------------------*/
const socketConnection=(body='')=>{
	//Se genera la conexion al puerto del socket
	let host=config.HOST_NOTIF
	console.log(host,config)
	socket=io.connect(host,{secure:true,rejectUnauthorized:false,query: {usuarioID: 0}})
	//nos conectamos al socket
	socket.on('connect',()=>{
		//Intentamos hacer la transaccion
		try{
			//emitimos el token al front
			socket.emit('notificar',body)
			socket.emit('disconnect')
		}catch(err){
			fs.appendFile('error.txt','- '+new Date().toLocaleString()+',POST,NOTIFICACION,socket\n',(err)=>{})
		}
	})
	//socket.emit('disconnect')
}

/*------------------------GET---------------------------*/
router.get('/p/:p/l/:l/e/(:e)?',(req,res)=>{
	const 	l=parseInt(req.params.l),p=parseInt(req.params.p)*l,e=String(req.params.e),
			Notificacion=req.models.Notificacion
	if(l>100) return res.status(400).json({code:400,msg:'Limit muy grande'})

	Notificacion.findAll({
		attributes: ['ID','titulo','tipo','estado','createdAt'],
		where:{estado:(e!='undefined')?e:{[Op.not]:'BAJA'}},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/p/:p/l/:l/t/:t',(req,res)=>{
	const 	l=parseInt(req.params.l),p=parseInt(req.params.p)*l,t=String(req.params.t),
			Notificacion=req.models.Notificacion
	if(l>100) return res.status(400).json({code:400,msg:'Limit muy grande'})

	Notificacion.findAll({
		attributes: ['ID','titulo','tipo','estado','createdAt'],
		where:{
			tipo:t,
			estado:{[Op.not]:'BAJA'}
		},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/usuarioID/:id/p/:p/l/:l',(req,res)=>{
	const 	l=parseInt(req.params.l),p=parseInt(req.params.p)*l,id=String(req.params.id),
			Notificacion=req.models.Notificacion,
			NotificacionUsuario=req.models.NotificacionUsuario
	if(l>50) return res.status(400).json({code:400,msg:'Limit muy grande'})

	Notificacion.findAll({
		attributes: ['ID','titulo','tipo','estado','descripcion','url','createdAt'],
		where:{estado:'ACTIVO'},
		limit:[p,l],
		order:[['ID','DESC']],
		include:{
			model:NotificacionUsuario,
			attributes:[],
			where:{usuarioID:id,estado:'ACTIVO'}
		}
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/no-leidas/usuarioID/:id/p/:p/l/:l',(req,res)=>{
	const 	l=parseInt(req.params.l),p=parseInt(req.params.p)*l,id=String(req.params.id),
			Notificacion=req.models.Notificacion,
			NotificacionUsuario=req.models.NotificacionUsuario
	if(l>50) return res.status(400).json({code:400,msg:'Limit muy grande'})

	Notificacion.findAll({
		attributes: ['ID','titulo','tipo','estado','descripcion','url','createdAt'],
		where:{estado:'ACTIVO'},
		limit:[p,l],
		order:[['ID','DESC']],
		include:{
			model:NotificacionUsuario,
			attributes:[],
			where:{usuarioID:id,snVisto:false,estado:'ACTIVO'}
		}
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Notificacion=req.models.Notificacion,
			NotificacionUsuario=req.models.NotificacionUsuario

	Notificacion.findOne({
		attributes: ['ID','titulo','tipo','descripcion','estado','createdAt'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		},
		group:'notificaciones_usuarios.snVisto',
		include:{
			model:NotificacionUsuario,
			//attributes:[[Sequelize.literal('COUNT(notificaciones_usuarios.ID)')]],
			required:false
		}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			Notificacion=req.models.Notificacion,
			NotificacionUsuario=req.models.NotificacionUsuario

	res.locals.conn.transaction().then(tr=>{
		Notificacion.create({
			titulo:body.titulo,
			descripcion:body.descripcion,
			url:body.url,
			tipo:body.tipo,
			notificaciones_usuarios:body.usuarios
		},{
			include:{
				model:NotificacionUsuario,
				required:false
			},
			transaction:tr
		}).then(data=>{
			const ID=data.get('ID')
			body.ID = ID
			tr.commit()
			socketConnection(body)
			res.json({code:201,data:{ID}})
		}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})


/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Notificacion=req.models.Notificacion

	Notificacion.update({
		titulo:body.titulo,
		descripcion:body.descripcion,
		tipo:body.tipo,
		url:body.url
	},{
		where:{
			ID:id,
			estado:'BORRADOR'
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
	}).catch(err=>{end(res,err,'PUT',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Notificacion=req.models.Notificacion

	Notificacion.update({
		estado:body.estado
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data==0)?res.json({code:404}):res.json({code:201})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})

router.patch('/snVisto',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			NotificacionUsuario=req.models.NotificacionUsuario

	NotificacionUsuario.update({
		snVisto:true
	},{
		where:{
			notificacionID:body.notificacionID,
			usuarioID:body.usuarioID,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data==0)?res.json({code:404}):res.json({code:201})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router