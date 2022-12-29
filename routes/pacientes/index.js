const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		end=require('../functions').end,
		enviarEmail=require('../functions').enviarEmail,
		obj='PACIENTE'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'files':
			router.use('/'+modulo[3],require('./'+modulo[3]))
			break;
		default:
			req.models=require('./orm').relations(res.locals.conn)
			break;
	}
	next()
})


/*------------------------GET---------------------------*/
router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Paciente=req.models.Paciente,
			Pais=req.models.Pais,
			Provincia=req.models.Provincia,
			Localidad=req.models.Localidad

	Paciente.findOne({
		attributes:['ID','foto','nombre','telefono','genero','estado'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		},
		include:[{
			model:Pais,as:'pais',attributes:['ID','nombre']
		},{
			model:Provincia,attributes:['ID','nombre']
		},{
			model:Localidad,as:'localidad',attributes:['ID','nombre']
		}]
	}).then(data=>{(!data)?res.json({code:404}):res.status(200).json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/p/:p/l/:l',(req,res)=>{
	const 	l=parseInt(req.params.l,10),p=parseInt(req.params.p)*l,
			paisID=req.query.paisID,provinciaID=req.query.provinciaID,localidadID=req.query.localidadID,
			Paciente=req.models.Paciente
	var where={estado:{[Op.not]:'BAJA'}}
	if(paisID)where.paisID=paisID
	if(provinciaID)where.provinciaID=provinciaID
	if(localidadID)where.localidadID=localidadID

	Paciente.findOne({
		attributes:['ID','foto','nombre','telefono','genero','estado'],
		where
	}).then(data=>{(!data)?res.json({code:404}):res.status(200).json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/cant',(req,res)=>{
	const 	id=String(req.params.id),
			Paciente=req.models.Paciente

	Paciente.count({where:{estado:'ACTIVO'}
	}).then(data=>{(!data)?res.json({code:404}):res.status(200).json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/mas-concurrentes/f/:f/t/:t/l/:l',(req,res)=>{
	const  	f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",l=parseInt(req.params.l),
			Paciente=req.models.Paciente,
			Sesion=req.models.Sesion
	if(l>10) return res.status(400).send('Limit muy grande')

	Paciente.findAll({
		attributes:['ID','nombre','apellido',[Sequelize.literal('COUNT(sesion.ID)'),'cant_sesiones']],
		where:{estado:{[Op.not]:'BAJA'}},
		group:'pacientes.ID',
		limit:l,
		order:[['cant_sesiones','DESC']],
		include:{
			model:Sesion,as:'sesion',
			attributes:[],
			where:{
				estado:{[Op.not]:'BAJA'},
				createdAt:{[Op.between]:[f,t]}
			}
		}
	}).then(data=>{(!data.length)?res.json({code:204}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			Paciente=req.models.Paciente,
			Credencial=req.models.Credencial
	body.credencial.codigo='U-'+String(Math.random()).slice(-5)

	res.locals.conn.transaction().then(tr=>{
		Paciente.create({
			paisID:body.paisID,
			provinciaID:body.provinciaID,
			localidadID:body.localidadID,
			nombre:body.nombre,
			apellido:body.apellido,
			fecha_nac:body.fecha_nac,
			genero:body.genero,
			telefono:body.telefono,
			informacion:body.informacion,
			credencial:body.credencial
		},{
			include:{model:Credencial,as:'credencial'},
			transaction:tr
		}).then(data=>{
			const ID= data.get('ID')
			//EVENT
			var query="CREATE EVENT codigo_paciente_"+ID+" ON SCHEDULE AT DATE_ADD(NOW(),INTERVAL 1 HOUR) DO "
			query+="UPDATE credenciales SET codigo=null WHERE pacienteID="+ID+" AND codigo='"+body.credencial.codigo+"'"

			res.locals.conn.query(query,{transaction:tr}).then(async data1=>{		
				if(data||data.get('email')!=null){
					var bodyMail={
						ID:ID,
						nombre:body.nombre,
						estado:'PENDIENTE',
						credencial:{
							codigo:body.credencial.codigo,
							email:body.credencial.email
						}
					}
					await enviarEmail(require('../emails/index').mailCofirmacion(bodyMail))
				}
				tr.commit()
				res.json({code:201,data:{ID}})
			}).catch(err=>{end(res,err,'POST-EVENT',obj,tr,body)})
		}).catch(err=>{end(res,err,'POST',obj,tr,body)})
	})
})

router.post('/search/p/:p/l/:l',(req,res)=>{
	const   like='%'+req.body.like+'%',
			l=parseInt(req.params.l,10),p=parseInt(req.params.p)*l,
			paisID=req.query.paisID,provinciaID=req.query.provinciaID,localidadID=req.query.localidadID,
			Paciente=req.models.Paciente
	var like_aux=req.body.like.split(' '),lit=''

	if(l>200)return res.status(400).send('Limit muy grande')
	if(like.length<3) return res.status(400).send('Longitud muy corta')
	like_aux.forEach(e=>{if(e.length>2)lit+='(nombre LIKE "%'+e+'%" OR apellido LIKE "%'+e+'%") AND '})
	var where={[Op.and]:Sequelize.literal(lit.slice(0,-5)),estado:{[Op.not]:'BAJA'}}
	if(paisID)where.paisID=paisID
	if(provinciaID)where.provinciaID=provinciaID
	if(localidadID)where.localidadID=localidadID

	Paciente.findAndCountAll({
		attributes:['ID','foto','nombre','telefono','genero','estado'],
		where,
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.rows.length)?res.json({code:404}):res.status(201).json(data)
	}).catch(err=>{end(res,err,'POST-GET',obj)})
})


/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Paciente=req.models.Paciente

	Paciente.update({
		paisID:body.paisID,
		provinciaID:body.provinciaID,
		localidadID:body.localidadID,
		nombre:body.nombre,
		apellido:body.apellido,
		fecha_nac:body.fecha_nac,
		genero:body.genero,
		telefono:body.telefono,
		informacion:body.informacion
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data==0)?res.json({code:404}):res.status(201).json({code:201})
	}).catch(err=>{end(res,err,'PUT',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Paciente=req.models.Paciente

	Paciente.update({
		estado:body.estado
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data==0)?res.json({code:404}):res.status(201).json({code:201})
    }).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router