const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../functions').end,
		obj='MENSAJE'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/sessionID/:sesID/selectedID/:selID/pendientes/:p',(req,res)=>{
   	const	sesID=String(req.params.sesID),selID=String(req.params.selID),
   			p=parseInt(req.params.p)+150,
   		 	Mensaje=req.models.Mensaje

   	Mensaje.findAll({
		attributes: ['ID','talkerID','receiverID','message','estado','readAt','createdAt'],
		where:{
			estado: {[Op.not]:'BAJA'},
			talkerID : {[Op.or]: [sesID,selID]},
			receiverID : {[Op.or]: [sesID,selID]}
		},
		limit:[p],
		order:[['ID','ASC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/sessionID/:sesID/selectedID/:selID/ltID/:id',(req,res)=>{
   	const	sesID=String(req.params.sesID),selID=String(req.params.selID),
   			id=String(req.params.id),
   		 	Mensaje=req.models.Mensaje

   	Mensaje.findAll({
		attributes: ['ID','talkerID','receiverID','message','estado','readAt','createdAt'],
		where:{
			ID:{[Op.lt]:id},
			estado:{[Op.not]:'BAJA'},
			talkerID:{[Op.or]:[sesID,selID]},
			receiverID:{[Op.or]:[sesID,selID]}
		},
		limit:[50],
		order:[['ID','DESC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/sessionID/:sesID/pendientes',(req,res)=>{
	const	sesID=String(req.params.sesID),
		 	Mensaje=req.models.Mensaje

	Mensaje.findAll({
		attributes:['ID','talkerID','receiverID','message','estado','readAt','createdAt'],
		where:{
			estado:'PENDIENTE',
			receiverID : sesID
		},
		order:[['ID','ASC']]
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			Mensaje=req.models.Mensaje

	Mensaje.create({
		talkerID:body.talkerID,
		receiverID:body.receiverID,
		message:body.message
	}).then(data=>{
		const id=data.get('ID')
		res.json({code:201,data:{id}})
	}).catch(err=>{end(res,err,'POST',obj)})
})


/*------------------------PATCH-------------------------*/
router.patch('/leidos/sessionID/:sesID/selectedID/:selID',(req,res)=>{
	const 	sesID=String(req.params.sesID),selID=String(req.params.selID),
			body=req.body,
			Mensaje=req.models.Mensaje

	Mensaje.update({
		readAt:Sequelize.fn('NOW'),
		estado:body.estado
	},{
		where:{
			receiverID:sesID,
			talkerID:selID,
			estado:'PENDIENTE'
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})

router.patch('/borrar/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Mensaje=req.models.Mensaje

	Mensaje.update({
		estado:'BAJA'
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(data!=0)?res.json({code:201}):res.json({code:404})
	}).catch(err=>{end(res,err,'PATCH',obj)})
})


module.exports=router