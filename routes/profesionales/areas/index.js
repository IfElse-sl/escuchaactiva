const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../../functions').end,
		obj='PROFESIONAL-AREA'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/profesionalID/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Area=req.models.Area,
			ProfesionalArea=req.models.ProfesionalArea

	Area.findAll({
		attributes:['ID','nombre'],
		where:{estado:{[Op.not]:'BAJA'}},
		order:['nombre'],
		include:{
			model:ProfesionalArea,
			attributes:['ID'],
			where:{
				profesionalID:id,
				estado: {[Op.not]:'BAJA'}
			}
		}
	}).then(data=>{(!data.length)?res.sendStatus(204):res.status(200).json(data)
	}).catch(err=>{end(res,err,'GET',obj)})
})


/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			ProfesionalArea=req.models.ProfesionalArea

	res.locals.conn.transaction().then(tr=>{
		ProfesionalArea.bulkCreate(body,{transaction:tr
		}).then(data=>{
			tr.commit()
			res.sendStatus(201)
		}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})


/*------------------------DELETE------------------------*/
router.delete('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			ProfesionalArea=req.models.ProfesionalArea

	ProfesionalArea.destroy({where:{ID:id}
	}).then(data=>{(data!=0)?res.sendStatus(201):res.sendStatus(204)
	}).catch(err=>{end(res,err,'DELETE',obj)})
})


module.exports=router