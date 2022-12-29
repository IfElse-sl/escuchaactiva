const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../functions').end,
		obj='PROFESIONAL-HORARIO'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/profesionalID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			ProfesionalHorario=req.models.ProfesionalHorario

	ProfesionalHorario.findAll({
		attributes:['ID','dia','hora_desde','hora_hasta','estado'],
		where:{
			profesionalID:id,
			estado:{[Op.not]:'BAJA'}
		},
		order:[Sequelize.literal("CASE WHEN dia='Lunes' THEN 1 WHEN dia='Martes' THEN 2 WHEN dia='Miercoles' THEN 3 WHEN dia='Jueves' THEN 4 WHEN dia='Viernes' THEN 5 END")]
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/agenda/profesionalID/:id/f/:f/t/:t',(req,res)=>{
	const 	id=String(req.params.id),f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			ProfesionalHorario=req.models.ProfesionalHorario,
			Sesion=req.models.Sesion,
			Pago=req.models.Pago,
			Paciente=req.models.Paciente

	ProfesionalHorario.findAll({
		attributes:['ID','dia','hora_desde','hora_hasta','estado'],
		where:{
			profesionalID:id,
			estado:{[Op.not]:'BAJA'}
		},
		include:{
			model:Sesion,as:'sesiones',
			attributes:['ID','estado'],
			where:{
				fecha:{[Op.between]:[f,t]},
				estado:{[Op.not]:'BAJA'}
			},
			required:false,
			include:[{
				model:Pago,as:'pago',
				attributes:['ID','estado'],
				where:{estado:'PAGADO'},
				required:false
			},{
				model:Paciente,
				attributes:['ID','nombre'],
				required:false
			}]
		},
		order:[Sequelize.literal("CASE WHEN dia='Lunes' THEN 1 WHEN dia='Martes' THEN 2 WHEN dia='Miercoles' THEN 3 WHEN dia='Jueves' THEN 4 WHEN dia='Viernes' THEN 5 END")]
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/agenda-for-reserva/profesionalID/:id/f/:f/t/:t',(req,res)=>{
	const 	id=String(req.params.id),f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			ProfesionalHorario=req.models.ProfesionalHorario,
			Sesion=req.models.Sesion,
			Pago=req.models.Pago

	ProfesionalHorario.findAll({
		attributes:['ID','dia','hora_desde','hora_hasta'],
		where:{
			profesionalID:id,
			estado:'ACTIVO'
		},
		include:{
			model:Sesion,as:'sesion',
			attributes:['ID',[Sequelize.literal('IF(fecha<NOW(),"INACTIVO",sesion.estado)'),'estado']],
			where:{
				fecha:{[Op.between]:[f,t]},
				estado:{[Op.in]:['PENDIENTE','EN CURSO']}
			},
			required:false,
			include:{
				model:Pago,as:'pago',
				attributes:['ID','estado'],
				where:{estado:'PAGADO'}
			}
		},
		order:[Sequelize.literal("CASE WHEN dia='Lunes' THEN 1 WHEN dia='Martes' THEN 2 WHEN dia='Miercoles' THEN 3 WHEN dia='Jueves' THEN 4 WHEN dia='Viernes' THEN 5 END")]
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			ProfesionalHorario=req.models.ProfesionalHorario

	res.locals.conn.transaction().then(tr=>{
		ProfesionalHorario.bulkCreate(body,{transaction:tr
		}).then(data=>{
			tr.commit()
			res.sendStatus(201)
		}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})


/*------------------------DELETE------------------------*/
router.delete('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			ProfesionalHorario=req.models.ProfesionalHorario

	ProfesionalHorario.destroy({where:{ID:id}
	}).then(data=>{(data!=0)?res.sendStatus(201):res.sendStatus(204)
	}).catch(err=>{end(res,err,'DELETE',obj)})
})


module.exports=router