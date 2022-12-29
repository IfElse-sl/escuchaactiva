const 	router=require('express').Router(),
		Sequelize=require('sequelize'),
		Op=Sequelize.Op,
        end=require('../functions').end,
		obj='BLOG'

router.all('/*',(req,res,next)=>{
	const modulo=req.originalUrl.split('/')
	switch(modulo[3]){
		case 'categorias':
		case 'estadisticas':
		case 'temas':
		case 'imgs':
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
router.get('/page/:p',(req,res)=>{
   	const 	p=parseInt(req.params.p)*4,
			Blog=req.models.Blog,
   			Categoria=req.models.Categoria

   	Blog.findAndCountAll({
		attributes:['ID','titulo','estado','views','imgPortada',[Sequelize.literal('DATE_FORMAT(createdAt,"%d de %b de %Y")'),'fecha']],
		where:{estado:{[Op.not]:'BAJA'}},
		order:[['ID','DESC']],
		limit:[p,4]
	}).then(data=>{(!data.rows.length)?res.status(404).json({code:404}):res.status(200).json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/page/:p/limit/:l',(req,res)=>{
   	const 	l=parseInt(req.params.l),p=parseInt(req.params.p)*l,
			Blog=req.models.Blog,
   			Categoria=req.models.Categoria
	if(l>100) return res.status(400).json({code:400,msg:'Limit muy grande'})

	Blog.findAndCountAll({
		attributes:['ID','titulo','estado','prioridad','imgPortada','views',[Sequelize.literal('DATE_FORMAT(blogs.createdAt,"%d de %b de %Y")'),'fecha']],
		where:{estado:{[Op.not]:'BAJA'}},
		order:[['ID','DESC']],
		limit:[p,l],
		include:{
			model:Categoria,
			attributes:['ID','nombre']
		}
	}).then(data=>{(!data.rows.length)?res.status(404).json({code:404}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/destacadas',(req,res)=>{
	const 	Blog=req.models.Blog

	Blog.findAll({
		attributes: ['ID','titulo','imgPortada','prioridad'],
		where:{
			prioridad: {[Op.in]:['1','2','3','4','5','6','7','8']},
			estado: {[Op.not]:'BAJA'}
		},
		limit:8,
		order:['prioridad']
	}).then(data=>{(!data.length)?res.status(404).json({code:404}):res.status(200).json({code:200,data})
	}).catch(err=>{end(res,err,'GET',obj)})
})

router.get('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Blog=req.models.Blog,
			Usuario=req.models.Usuario,
			Tema=req.models.Tema,
			TemasBlog=req.models.TemasBlog,
			BlogFile=req.models.BlogFile,
			Categoria=req.models.Categoria,
			Materia = req.models.Materia

	Blog.findOne({
		attributes:['ID','categoriaID','imgPortada','titulo','introduccion','desarrollo','views','prioridad','estado',
			[Sequelize.literal('DATE_FORMAT(blogs.createdAt,"%d/%m/%Y")'),'createdAt']],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		},
		include:[{
			model:Tema,
			attributes:['ID','nombre'],
			required:false,
			through:{
				attributes:[]
			}
		},{
			model:BlogFile,as:'files',
			attributes:['ID','titulo','url','createdAt'],
			where:{estado:'ACTIVO'},
			required:false
		},{
			model:Usuario,
			attributes:['ID','nombre']
		},{
			model:Categoria,
			attributes:['ID','nombre']
		},{
			model:Materia,
			attributes:['ID','nombre']
		}]
	}).then(data=>{(!data)?res.status(404).json({code:404}):res.status(200).json({code:200,data})
    }).catch(err=>{end(res,err,'GET',obj)})
})

/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	const 	body=req.body,
			temas=body.temas,
			Blog=req.models.Blog,
			TemasBlog=req.models.TemasBlog,
			BlogFile=req.models.BlogFile

	var include=[{model:TemasBlog,as:'blog_temas'}]
	if(body.snFile==1) include.push({model:BlogFile,as:'files'})
	temas.forEach(e=>{
		e.temaID=e.ID
		delete e.ID
	})

	res.locals.conn.transaction().then(tr=>{
		Blog.create({
			categoriaID:body.categoriaID,
			materiaID:body.materiaID,
			createdID:body.createdID,
			imgPortada:body.imgPortada,
			titulo:body.titulo,
			introduccion:body.introduccion,
			desarrollo:body.desarrollo,
			prioridad:body.destacada.prioridad,
			estado:body.estado,
			files:body.files,
			blog_temas:temas
		},{
			include:include,
			transaction:tr
		}).then(data=>{
			const ID=data.dataValues.ID
			if(body.destacada.prioridad==0){
				tr.commit()
				res.status(201).json({code:201,data:{ID}})
				return true
			}

			Blog.update({prioridad:0},{where:{ID:body.destacada.ID},transaction:tr}).then(data=>{
				tr.commit()
				res.status(201).json({code:201,data:{ID}})
    		}).catch(err=>{end(res,err,'POST',obj,tr)})
    	}).catch(err=>{end(res,err,'POST',obj,tr)})
	})
})

router.post('/search/page/:p/limit/:l',(req,res)=>{
	const 	body=req.body,
			like='%'+body.like+'%',
			l= parseInt(req.params.l),p=(req.params.p)*l,
			Blog=req.models.Blog,
			Categoria=req.models.Categoria
	
	if(like.length<5||l>100) return res.status(400).json({code:400,msg:'Longitud o limit incorrectos'})

	Blog.findAndCountAll({
		attributes:['ID','titulo','estado','prioridad','views',[Sequelize.literal('DATE_FORMAT(blogs.createdAt,"%d de %b de %Y")'),'fecha']],
		where:{
			[Op.or]:[{
				titulo:{[Op.like]:like}
			},{
				introduccion:{[Op.like]:like}
			}],
			estado:{[Op.not]:'BAJA'}
		},
		limit:[p,l],
		order:[['ID','DESC']],
		include:{
			model:Categoria,
			attributes:['ID','nombre']
		}
	}).then(data=>{(!data.rows.length)?res.status(404).json({code:404}):res.status(201).json({code:201,data})
    }).catch(err=>{end(res,err,'POST-SEARCH',obj)})
})

/*------------------------PUT---------------------------*/
router.put('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			files=body.files,
			Blog=req.models.Blog,
			BlogFile=req.models.BlogFile

	res.locals.conn.transaction().then(tr=>{
		Blog.update({
			categoriaID:body.categoriaID,
			materiaID:body.materiaID,
			titulo:body.titulo,
			introduccion:body.introduccion,
			desarrollo:body.desarrollo,
			imgPortada:body.imgPortada,
			estado:body.estado,
			temas_blog:body.temas
		},{
			where:{
				ID:id,
				estado:{[Op.not]:'BAJA'}
			},
			transaction:tr
		}).then(async data=>{
			if(data==0){
				tr.rollback()
				res.status(404).json({code:404,msg:'No se pudo encontrar el id enviado'})
				return false
			}
			if(files!=null){
				files.forEach(e=>{e.blogID=id})
				try{
					let upf=await BlogFile.bulkCreate(files,{
							fields:['ID','blogID','titulo','url'],
							updateOnDuplicate:['titulo','url'],
							transaction:tr
						})
				}catch(err){
					end(res,err,'PUT-FILE',obj,tr)
					return false
				}
			}

			tr.commit()
			res.status(201).json({code:201})
    	}).catch(err=>{end(res,err,'PUT',obj,tr)})
	})
})

/*------------------------PATCH-------------------------*/
router.patch('/estado/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Blog=req.models.Blog
	var where={ID:id,estado:{[Op.not]:'BAJA'}}
	if(body.estado=='BAJA') where.prioridad=0

	Blog.update({
		estado:body.estado
	},{
		where:where
	}).then(data=>{(data==0)?res.status(404).json({code:404}):res.status(201).json({code:201})
    }).catch(err=>{end(res,err,'PATCH',obj)})
})

router.patch('/prioridad/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Blog=req.models.Blog

	res.locals.conn.transaction().then(tr=>{
		Blog.update({
			prioridad:body.blog_a_reemplazar.prioridad
		},{
			where:{
				ID:id,
				prioridad:{[Op.not]:body.blog_a_reemplazar.prioridad},
				estado:'ACTIVO'
			}
		}).then(data=>{
			if(data==0){
				tr.rollback()
				res.status(404).json({code:404})
				return false
			}

			Blog.update({
				prioridad:body.prioridad_this
			},{
				where:{
					ID:body.blog_a_reemplazar.ID,
					estado:'ACTIVO'
				},
				transaction:tr
			}).then(data=>{
				tr.commit()
				res.status(201).json({code:201})
    		}).catch(err=>{end(res,err,'PATCH',obj,tr)})
    	}).catch(err=>{end(res,err,'PATCH',obj,tr)})
	})
})

router.patch('/temas-blog/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			temas=body.temas,
			TemasBlog=req.models.TemasBlog
	body.forEach(e=>{
		e.temaID=e.ID
		e.blogID=id
		delete e.ID
	})

	res.locals.conn.transaction().then(tr=>{
		TemasBlog.destroy({where:{blogID:id},transaction:tr}).then(data=>{
			TemasBlog.bulkCreate(body,{transaction:tr}).then(data=>{
				tr.commit()
				res.status(201).json({code:201})
			}).catch(err=>{end(res,err,'GET',obj,tr)})
		}).catch(err=>{end(res,err,'GET',obj,tr)})
	})
})

module.exports=router