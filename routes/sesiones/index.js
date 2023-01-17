const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		PaymentController = require("./paypal/payment.controller"), 
		controller = new PaymentController(),
		end=require('../functions').end,
		enviarEmail=require('../functions').enviarEmail,
		obj='SESION'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/profesionalID/:id/f/:f/t/:t/p/:p/l/:l',(req,res)=>{
	const  	id=Number.parseInt(req.params.id),f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			l=parseInt(req.params.l),p=parseInt(req.params.p)*l,e=(req.query.estado)?(req.query.estado).split(','):null,
			Sesion=req.models.Sesion,
			Paciente=req.models.Paciente
	if(l>100) return res.status(400).send('Limit muy grande')

	Sesion.findAndCountAll({
		attributes:['ID','fecha','duracion','estado','resumen','createdAt'],
		where:{
			profesionalID:id,
			fecha:{[Op.between]:[f,t]},
			estado:(!e)?{[Op.not]:'BAJA'}:{[Op.in]:e}
		},
		include:{
			model:Paciente,
			attributes:['ID','nombre','apellido']
		},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(!data.count)?res.json({code:204}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/pacienteID/:id/f/:f/t/:t/p/:p/l/:l',(req,res)=>{
	const  	ID=Number.parseInt(req.params.id),f=String(req.params.f)+" 00:00:00",t=String(req.params.t)+" 23:59:59",
			l=parseInt(req.params.l),p=parseInt(req.params.p)*l,e=(req.query.estado)?(req.query.estado).split(','):null,
			Sesion=req.models.Sesion,
			Profesional=req.models.Profesional
	if(l>100) return res.status(400).send('Limit muy grande')

	Sesion.findAndCountAll({
		attributes:['ID','fecha','duracion','estado','resumen','createdAt'],
		where:{
			pacienteID:ID,
			fecha:{[Op.between]:[f,t]},
			estado:(!e)?{[Op.not]:'BAJA'}:{[Op.in]:e}
		},include:{
			model:Profesional,as:'profesional',
			attributes:['ID','nombre','apellido']
		},
		limit:[p,l],
		order:[['ID','DESC']]
	}).then(data=>{(data.count==0)?res.json({code:204}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})



/*------------------------POST--------------------------*/
router.post('/link-paypal',controller.crearOrden);
router.post('/devolucion',controller.devolucionOrden)
router.get('/capturar-orden',controller.capturarOrden);

router.post('/',(req,res)=>{
	const 	body=req.body,
			Sesion=req.models.Sesion,
			Pago=req.models.Pago

	res.locals.conn.transaction().then(tr=>{
		Sesion.create({
			profesionalID:body.profesional.ID,
			pacienteID:body.paciente.ID,
			horarioID:body.horarioID,
			fecha:body.fecha,
			pago:body.pago
		},{
			include:{model:Pago,as:'pago'},
			transaction:tr
		}).then(async data=>{
			//agregar logica paypal
			let bodyMail={
				ID:data.get('ID'),
				profesional:body.profesional,
				paciente:body.paciente,
				fecha:body.fecha
			}
			await enviarEmail(require('../emails/index').nuevaSesion_prof(bodyMail))
			await enviarEmail(require('../emails/index').nuevaSesion_pac(bodyMail))
			tr.commit()
			res.json({code:201})
		}).catch(err=>{end(res,err,'POST',obj,tr,body)})
	})
})


/*------------------------PUT---------------------------*/
router.put('/finalizar/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Sesion=req.models.Sesion

	Sesion.update({
		duracion:body.duracion,
		resumen:body.resumen,
		estado:'FINALIZADO'
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(async data=>{
		if(data==0){
			res.json({code:404})
			return false
		}
		var bodyMail={
			ID:id,
			paciente:body.paciente
		}
		await enviarEmail(require('../emails/index').finSesion(bodyMail))
		res.status(201).json({code:201})
    }).catch(err=>{end(res,err,'PATCH',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/ausente/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Sesion=req.models.Sesion

	Sesion.update({
		estado:'AUSENTE'
	},{
		where:{
			ID:id,
			fecha:{[Op.gt]:Sequelize.literal('DATE_ADD(NOW(),INTERVAL 15 MINUTE)')},
			estado:'PENDIENTE'
		}
	}).then(async data=>{
		if(data==0){
			res.json({code:404})
			return false
		}
		var bodyMail={
			ID:id,
			paciente:body.paciente
		}
		await enviarEmail(require('../emails/index').ausenteSesion(bodyMail))
		res.status(201).json({code:201})
    }).catch(err=>{end(res,err,'PATCH',obj)})
})

//se puede cancelar pero no pedir devolucion si es menos de 48hs antes.
router.patch('/cancelacion/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Sesion=req.models.Sesion

	Sesion.update({
		estado:'CANCELADA'
	},{
		where:{
			ID:id,
			fecha:{[Op.lt]:Sequelize.literal('DATE_ADD(NOW(),INTERVAL 48 HOUR)')},
			estado:'PENDIENTE'
		}
	}).then(async data=>{
		if(data==0){
			res.json({code:404})
			return false
		}
		var bodyMail={
			ID:id,
			fecha:body.fecha,
			paciente:body.paciente,
			profesional:body.profesional
		}
		await enviarEmail(require('../emails/index').cancelSesion_pac(bodyMail))
		await enviarEmail(require('../emails/index').cancelSesion_prof(bodyMail))
		res.status(201).json({code:201})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})

//se puede cancelar y pedir la devolucion si es 48hs antes.
router.patch('/cancelacion-anticipada/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Sesion=req.models.Sesion,
			Pago=req.models.Pago

	res.locals.conn.transaction().then(tr=>{
		Sesion.update({
			estado:'CANCELADA'
		},{
			where:{
				ID:id,
				fecha:{[Op.gt]:Sequelize.literal('DATE_ADD(NOW(),INTERVAL 48 HOUR)')},
				estado:'PENDIENTE'
			},
			transaction:tr
		}).then(data=>{
			if(data==0){
				tr.rollback()
				res.json({code:404})
				return false
			}

			Pago.create({
				sesionID:id,
				monto:body.pago.monto,
				tipo:'DEVOLUCION'
			},{
				transaction:tr
			}).then(async data=>{
				//agregar logica paypal
				var bodyMail={
					ID:id,
					fecha:body.fecha,
					paciente:body.paciente,
					profesional:body.profesional
				}
				await enviarEmail(require('../emails/index').cancelSesion_previo_prof(bodyMail))
				await enviarEmail(require('../emails/index').cancelSesion_previo_pac(bodyMail))
				//await enviarEmail(require('../emails/index').devolucionPago(bodyMail_pac))
				tr.commit()
				res.status(201).json({code:201})
			}).catch(err=>{end(res,err,'PATCH-POST',obj,tr)})
		}).catch(err=>{end(res,err,'PATCH',obj,tr)})
	})
})

//se puede cambair de fecha antes de 48hs sin drama.
router.patch('/fecha-anticipada/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Sesion=req.models.Sesion

	Sesion.update({
		fecha:body.fecha
	},{
		where:{
			ID:id,
			fecha:{[Op.gt]:Sequelize.literal('DATE_ADD(NOW(),INTERVAL 48 HOUR)')},
			estado:'PENDIENTE'
		}
	}).then(async data=>{
		if(data==0){
			res.json({code:404})
			return false
		}
		var bodyMail={
			ID:id,
			fecha:body.fecha,
			profesional:body.profesional,
			paciente:body.paciente
		}
		await enviarEmail(require('../emails/index').putFechaSesion_pac(bodyMail))
		await enviarEmail(require('../emails/index').putFechaSesion_prof(bodyMail))
		res.status(201).json({code:201})
    }).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router