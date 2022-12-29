const router=require('express').Router(),
		Sequelize=require('sequelize'),
		Op=Sequelize.Op,
		end=require('../../functions').end,
		obj='ESTADISTICA'

router.all('/*',(req,res,next)=>{
	req.models=require('../orm').relations(res.locals.conn)
	next()
})


/*------------------------GET---------------------------*/
router.get('/blogs-cant-views/days/:d',(req,res)=>{
	const	d=String(req.params.d),
			Blog=req.models.Blog
	var where={estado:'ACTIVO'}
	if(d!='all') where.createdAt={[Op.between]:[Sequelize.literal('NOW() - INTERVAL '+d+' DAY'),Sequelize.literal('NOW()')]}

	Blog.findAll({
		attributes:['ID','titulo','views'],
		where:where,
		order:[['views','DESC'],['ID','DESC']],
		limit:8
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/categorias-cant-blogs/days/:d',(req,res)=>{
	const	d=String(req.params.d),
			Categoria=req.models.Categoria,
			Blog=req.models.Blog
	var where={estado:"ACTIVO"}
	if(d!='all') where.createdAt={[Op.between]: [Sequelize.literal('NOW() - INTERVAL '+d+' DAY'),Sequelize.literal('NOW()')]}

	Blog.findAll({
		attributes:[[Sequelize.fn('COUNT','ID'),'cant']],
		where:where,
		limit:8,
		order:[[Sequelize.literal('cant'),'DESC']],
		group:['categoriaID'],
		include:{
			model:Categoria,
			attributes:['nombre']
		}
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/categorias-cant-views/days/:d',(req,res)=>{
	const d=String(req.params.d),
			Categoria=req.models.Categoria,
			Blog=req.models.Blog
	var where={estado:"ACTIVO"}
	if(d!='all') where.createdAt={[Op.between]:[Sequelize.literal('NOW() - INTERVAL '+d+' DAY'),Sequelize.literal('NOW()')]}

	Blog.findAll({
		attributes:[[Sequelize.fn('SUM',Sequelize.col('views')), 'views']],
		where:where,
		limit:8,
		order:[[Sequelize.literal('views'),'DESC']],
		group:['categoriaID'],
		include:{
			model:Categoria,
			attributes:['ID','nombre']
		}
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/destacadas-cant-views',(req,res)=>{
	const	Blog=req.models.Blog

	Blog.findAll({
		attributes:['ID','titulo','views'],
		where:{
			prioridad:{[Op.in]:[1,2,3,4,5,6,7,8]},
			estado:'ACTIVO'
		},
		order:[['prioridad','ASC']],
		limit: 8
	}).then(data=>{(!data.length)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/cant-blogs',(req,res)=>{
	const	Blog=req.models.Blog

	Blog.findOne({
		attributes:[[Sequelize.fn('COUNT','ID'),'cant']],
		where:{estado:'ACTIVO'}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/blogs-cant-views',(req,res)=>{
	const	Blog=req.models.Blog

	Blog.sum('views',{where:{estado:'ACTIVO'}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data:{cant:data}})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/cant-temas',(req,res)=>{
	const	Tema=req.models.Tema

	Tema.findOne({
		attributes:[[Sequelize.fn('COUNT','ID'), 'cant']],
		where:{estado:'ACTIVO'}
	}).then(data=>{(!data)?res.json({code:404}):res.json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router