const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		end=require('../functions').end,
		enviarEmail=require('../functions').enviarEmail,
		obj='OPINIONES'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/f/:f/t/:t/p/:p/l/:l',(req,res)=>{
	const  	f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			l=parseInt(req.params.l),p=parseInt(req.params.p)*l,
			Opinion=req.models.Opinion,
			Paciente=req.models.Paciente,
			Profesional=req.models.Profesional
	if(l>100) return res.status(400).send('Limit muy grande')

	Opinion.findAndCountAll({
		attributes:['ID','puntaje','comentarios'],
		where:{
			createdAt:{[Op.between]:[f,t]},
			estado:{[Op.not]:'BAJA'},
		},
		include:[{
			model:Profesional,as:'profesional',
			attributes:['ID','nombre']
		},{
			model:Paciente,
			attributes:['ID','nombre']
		}],
		limit:[p,l],
		order:['ID']
	}).then(data=>{(!data.count)?res.json({code:204}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/profesionalID/:id/f/:f/t/:t/p/:p/l/:l',(req,res)=>{
	const  	ID=Number.parseInt(req.params.id),f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			l=parseInt(req.params.l),p=parseInt(req.params.p)*l,
			Opinion=req.models.Opinion,
			Paciente=req.models.Paciente
	if(l>100) return res.status(400).send('Limit muy grande')

	Opinion.findAndCountAll({
		attributes:['ID','puntaje','comentarios'],
		where:{
			profesionalID:ID,
			createdAt:{[Op.between]:[f,t]},
			estado:{[Op.not]:'BAJA'},
		},
		include:{
			model:Paciente,
			attributes:['ID','nombre']
		},
		limit:[p,l],
		order:['ID']
	}).then(data=>{(!data.count)?res.json({code:204}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/pacienteID/:id/f/:f/t/:t/p/:p/l/:l',(req,res)=>{
	const  	ID=Number.parseInt(req.params.id),f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			l=parseInt(req.params.l),p=parseInt(req.params.p)*l,		
			Opinion=req.models.Opinion,
			Profesional=req.models.Profesional
	if(l>100) return res.status(400).send('Limit muy grande')

	Opinion.findAndCountAll({
		attributes:['ID','puntaje','comentarios'],
		where:{
			pacienteID:ID,
			estado:{[Op.not]:'BAJA'},
			createdAt:{[Op.between]:[f,t]}
		},include:{
			model:Profesional,as:'profesional',
			attributes:['ID','nombre']
		},
		limit:[p,l],
		order:['ID']
	}).then(data=>{(data.count==0)?res.json({code:204}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			Opinion=req.models.Opinion

	Opinion.create({
		profesionalID:body.profesionalID,
		pacienteID:body.pacienteID,
		puntaje:body.puntaje,
		comentarios:body.comentarios
	}).then(async data=>{
		let bodyMail={
				puntaje:body.puntaje,
				comentarios:body.comentarios,
				email:body.profesional.email,
				nombre:body.profesional.nombre
			}
		await enviarEmail(require('../emails/index').mailOpinion(bodyMail))
		res.json({code:201})
	}).catch(err=>{end(res,err,'POST',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Opinion=req.models.Opinion

	Opinion.update({
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