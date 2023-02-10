const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		end=require('../functions').end,
		jwt=require('jsonwebtoken'),
		secret=require('./../secret.json')
		obj='USUARIO'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'mensajes':
		case 'imgs':
			router.use('/'+modulo[3],require('./'+modulo[3]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})


/*------------------------GET---------------------------*/
router.get('/',(req,res)=>{
   	const 	Usuario=req.models.Usuario,
			Perfil=req.models.Perfil
   	
   	Usuario.findAll({
		attributes:['ID','user','nombre','telefono','lastSesion','estado','img','conexion'],
		where:{estado: {[Op.not]:'BAJA'}},
		order:[['ID','DESC']],
		include:{
			model:Perfil,as:'perfil',
			attributes:['nombre']
		}
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Usuario=req.models.Usuario

	Usuario.findOne({
		attributes: ['ID','perfilID','user','password','nombre','direccion','telefono',
			'genero','img','estado'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			Usuario=req.models.Usuario

	Usuario.create({
		perfilID:body.perfilID,
		user:body.user,
		password:body.password,
		nombre:body.nombre,
		direccion:body.direccion,
		telefono:body.telefono,
		genero:body.genero
	}).then(data=>{
		const id=data.get('ID')
		res.json({code:201,data:{id}})
	}).catch(err=>{end(res,err,'POST',obj)})
})

router.post('/login',(req,res)=>{
	const body=req.body,
		Usuario=req.models.Usuario,
		Perfil=req.models.Perfil,
		Permiso=req.models.Permiso,
		Modulo=req.models.Modulo,
		Accion=req.models.Accion,
		Permiso_Accion=req.models.Permiso_Accion,
		code=201
	var msg=''

	Usuario.findOne({
		attributes:['ID','perfilID','nombre','img','estado'],
		where:{
			user:body.user,
			password:body.password,
			estado:{[Op.or]:['ACTIVO','ESPECIAL']}
		},
		include:{
			model:Perfil,as:'perfil',
			attributes:['nombre'],
			where:{estado:'ACTIVO'},
			include:{
				model:Modulo,
				attributes:['ID','parentID','title','routerLink','icon','hasSubMenu','target','href','estado'],
				where:{estado:{[Op.or]:['ACTIVO','NUEVO','EN PROCESO','PREMIUM']}},
				through:{model:Permiso,attributes:[]},
				include:{
					model:Accion,
					attributes:['ID','htmlID','title','icon','href','url','type','position','comentarios',
						[Sequelize.literal('IF(`perfil->modulos->permisos`.ID=`perfil->modulos->modulos_acciones->permisos_acciones`.permisoID,true,false)'),'checked']],
					where:{estado:{[Op.not]:'BAJA'}},
					required:false,
					include:{
						model:Permiso_Accion,
						attributes:[],
						required:false,
						where:{
							[Op.and]:[Sequelize.literal('`perfil->modulos->permisos`.ID=`perfil->modulos->modulos_acciones->permisos_acciones`.permisoID')],
							estado:{[Op.not]:'BAJA'}
						}
					}
				}
			}
		}
	}).then(data=>{
		if(!data){
			res.sendStatus(204)
			return false
		}
		usuario=data
		if(data.get('estado')=='ESPECIAL'){
			msg='ESPECIAL'
			code=202
		}
		Usuario.update({
			lastSesion:Sequelize.fn('NOW'),
			conexion:'CONECTADO'
		},{
			where:{ID:data.get('ID')}
		}).then(dataUpdate=>{
			//atributos para generar el token
			let userID=data.get('ID');
			//generar web json token
			const token=jwt.sign({sub:userID},secret.secret,{expiresIn:'14d'})
			//return user, empresa y token
			res.status(code).json({msg,data:{usuario,token}})
		}).catch(err=>{end(res,err,'POST-LOGIN-PUT',obj)})
	}).catch(err=>{end(res,err,'POST-LOGIN',obj)})
})

router.post('/search',(req,res)=>{
	const 	like='%'+req.body.like+'%',
			Usuario=req.models.Usuario

	if(like.length<4) return res.json({code:400,msg:'Peticion incorrecta: Longitud minima 2 caracteres'})
	Usuario.findAll({
		attributes: ['ID','nombre','user','estado'],
		where: {
			[Op.or]:[{
				user:{[Op.like]:like}
			},{
				nombre:{[Op.like]:like}
			}],
			estado:{[Op.not]:'BAJA'}
		},
		order:['nombre']
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:201,data})
	}).catch(err=>{end(res,err,'POST-SEARCH',obj)})
})


/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Usuario=req.models.Usuario

	Usuario.update({
		perfilID:body.perfilID,
		user:body.user,
		password:body.password,
		nombre:body.nombre,
		direccion:body.direccion,
		telefono:body.telefono,
		genero:body.genero
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data==0)?res.json({code:404}):res.json({code:201})
	}).catch(err=>{end(res,err,'PUT',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Usuario=req.models.Usuario

	Usuario.update({
		estado:body.estado
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
	}).catch(err=>{end(res,err,'PUT',obj)})
})

router.patch('/conexion/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Usuario=req.models.Usuario

	Usuario.update({
		conexion:body.conexion
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router