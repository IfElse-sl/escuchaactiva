const 	router=require('express').Router(),
		Sequelize=require('sequelize'),
		Op=Sequelize.Op,
		end=require('../../functions').end,
		obj='CATEGORIAS'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').model(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/',(req,res)=>{
   	const 	Categoria=req.models.Categoria

   	Categoria.findAll({
		attributes: ['ID','nombre'],
		where:{estado:{[Op.not]:'BAJA'}},
		order:['nombre']
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Categoria=req.models.Categoria

	Categoria.findOne({
		attributes: ['ID','nombre','estado','createdAt'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router