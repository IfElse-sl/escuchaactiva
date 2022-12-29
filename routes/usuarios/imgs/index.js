const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		Op=Sequelize.Op,
		fs=require('fs'),
		sharp=require('sharp'),
		upload=require('express-fileupload'),
		end=require('../../functions').end,
		obj='IMG-USUARIO'

router.use(upload())
router.all('/*',(req,res,next)=>{
	req.models=require('../orm').model(res.locals.conn)
	next()
})

/*------------------------POST--------------------------*/
router.post('/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Usuario=req.models.Usuario,
			body=req.body,
			date=new Date(),mls=date.getTime(),year=date.getFullYear(),
			namesm='/'+id+'-'+mls+"-sm", 	//600
			namexs='/'+id+'-'+mls+"-xs"		//50

	var dir="files/usuarios/"+id,
		ext='.jpg',
		img

	if(!fs.existsSync(dir)) fs.mkdirSync(dir)

	const	url=dir+'/'+id+'-'+mls
	img=sharp(new Buffer.from(body.base64.split(',')[1],'base64'),{failOnError:false}).jpeg({quality:80}).flatten({background:{r:255,g:255,b:255}})

	img.resize(600).toFile(dir+namesm+ext,(err,inf)=>{
		if(err) end(res,err,'POST-600',obj)
		else{
			img.resize(50).toFile(dir+namexs+ext,(err,inf)=>{
				if(err) end(res,err,'POST-50',obj)
				else{
					Usuario.update({img:url},{where:{ID:id,estado:{[Op.not]:'BAJA'}}
					}).then(data=>{res.json({code:201,data:{img:url}})
					}).catch(err=>{end(res,err,'POST-PUT',obj)})
				}
			})
		}
	})
})


/*------------------------DELETE------------------------*/
router.patch('/delete/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			Usuario=req.models.Usuario,
		 	url=req.body.img,ext='.jpg',
			namesm="-sm"+ext,namexs="-xs"+ext

	Usuario.update({
		img:'files/personas/default'
	},{
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(data==0){
			res.json({code:404})
			return false
		}
		fs.unlinkSync(url+namesm)
		fs.unlinkSync(url+namexs)
		res.json({code:200})
	}).catch(err=>{end(res,err,'GET',obj)})
})


module.exports=router;