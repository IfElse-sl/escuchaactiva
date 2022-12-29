const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		end=require('../functions').end,
		obj='PREGUNTA'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/numero/:n/numero-riesgo/:nr',(req,res)=>{
	const 	n=String(req.params.n),nr=String(req.params.nr), //enviar nr=0 hasta que se necesite
			Pregunta=req.models.Pregunta,
			Respuesta=req.models.Respuesta
	var t=(!nr)?'NORMAL':(Math.random()<0.5)?'NORMAL':'RIESGO'

	Pregunta.count({
		where:{
			numero:(t=='NORMAL')?n:nr,
			tipo:t,
			estado:'ACTIVO'
		}
	}).then(data=>{
		if(!data)t=((t=='NORMAL')?'RIESGO':'NORMAL')

		Pregunta.findOne({
			attributes:['ID','numero','titulo','tipo','snMultiple'],
			where:{
				numero:(t=='NORMAL')?n:nr,
				tipo:t,
				estado:'ACTIVO'
			},
			order:[[{Respuesta,'numero'},'ASC']],
			include:{
				model:Respuesta,
				attributes:['ID','numero','titulo','riesgo'],
				where:{estado:'ACTIVO'}
			}
		}).then(data=>{(!data)?res.json({code:204}):res.json({code:200,data})
		}).catch(err=>{end(res,err,'GET',obj)})
	})
})

router.get('/',(req,res)=>{
	const 	Pregunta=req.models.Pregunta

	Pregunta.findAll({
		attributes:['ID','titulo','tipo','snMultiple'],
		where:{
			numero:n,
			estado:'ACTIVO'
		},
		order:['numero']
	}).then(data=>{(!data)?res.json({code:204}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/ID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Pregunta=req.models.Pregunta,
			Respuesta=req.models.Respuesta

	Pregunta.findAll({
		attributes:['ID','titulo','tipo','snMultiple','estado'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		},
		order:['numero'],
		include:{
			model:Respuesta,
			attributes:['ID','numero','titulo','riesgo','estado'],
			where:{estado:{[Op.not]:'BAJA'}}
		}
	}).then(data=>{(!data)?res.json({code:204}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router