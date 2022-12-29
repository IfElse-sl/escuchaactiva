const 	router=require('express').Router(),
		fs=require('fs'),
		sharp=require('sharp'),
		upload=require('express-fileupload'),
		end=require('../../functions').end,
		obj='BLOG-IMG'

router.use(upload())

/*------------------------POST--------------------------*/
router.post('/',(req,res)=>{
	if(!req.files||!req.files.file){
		res.status(400).send('No estas enviando files.')
		return 400
	}

	const 	body=req.body,
			date=new Date(),
			mls=date.getTime(),year=date.getFullYear(),month=date.getMonth(),
			ext='.jpg',
			namelg='/'+mls+"-lg"+ext,namemd='/'+mls+"-md"+ext,
			namesm='/'+mls+"-sm"+ext,namexs='/'+mls+"-xs"+ext

	if(body.sizes.lg <10 ||body.sizes.md <10 || body.sizes.sm < 10){
		res.status(400).send('Peticion incorrecta: tamaños incorrectos')
		return false
	}

	var dir=req.urlfiles+"/"+year,
		dir_aux=req.urlfiles+"/"+year+"/"+month,
		data={simple:dir_aux+'/'+mls+'-p'},
		img

	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	dir+='/'+month
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)

	img=sharp(req.files.file.data).jpeg({quality:60}).flatten({background:{r:255,g:255,b:255}})

	img.resize(body.sizes.lg).toFile(dir+namelg,(err,inf)=>{
		if(err) end(res,err,'POST-LG',obj)
		else{
			data.lg=dir_aux+namelg
			img.resize(body.sizes.md).toFile(dir+namemd,(err,inf)=>{
				if(err) end(res,err,'POST-MD',obj)
				else{
					data.md=dir_aux+namemd
					img.resize(body.sizes.sm).toFile(dir+namesm,(err,inf)=>{
						if(err) end(res,err,'POST-SM',obj)
						else{
							data.sm=dir_aux+namesm
							if(body.sizes.xs==null) res.status(201).json(data)
							else{
								img.resize(body.sizes.xs).toFile(dir+namexs,(err,inf)=>{
									if(err) end(res,err,'POST-XS',obj)
									else{
										data.xs=dir_aux+namexs
										res.status(201).json(data)
									}
								})
							}
						}
					})
				}
			})
		}
	})
})

router.post('/portada',(req,res)=>{
	const 	body=req.body,
			date=new Date(),mls=date.getTime(),year=date.getFullYear(),month=date.getMonth(),
			ext='.jpg',
			namelg='/'+mls+"-p-lg"+ext,namemd='/'+mls+"-p-md"+ext,
			namesm='/'+mls+"-p-sm"+ext,namexs='/'+mls+"-p-xs"+ext


	if(body.sizes.lg<10||body.sizes.md<10||body.sizes.sm<10){
		res.status(400).send('Peticion incorrecta: tamaños incorrectos')
		return false
	}


	var dir=req.urlfiles+"/"+year,
		dir_aux=req.urlfiles+"/"+year+"/"+month,
		data={simple:dir_aux+'/'+mls+'-p'},
		img

	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	dir+='/'+month
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)

	img=sharp(new Buffer.from(body.base64.split(',')[1],'base64'),{failOnError:false}).jpeg({quality:70}).flatten({background:{r:255,g:255,b:255}})

	img.resize(body.sizes.lg).toFile(dir+namelg,(err,inf)=>{
		if(err) end(res,err,'POST-LG',obj)
	    else{
			data.lg=dir_aux+namelg

			img.resize(body.sizes.md).toFile(dir+namemd,(err,inf)=>{
				if(err) end(res,err,'POST-MD',obj)
				else{
					data.md=dir_aux+namemd
					img.resize(body.sizes.sm).toFile(dir+namesm,(err,inf)=>{
						if(err) end(res,err,'POST-SM',obj)
						else{
							data.sm=dir_aux+namesm
							if(body.sizes.xs==null) res.status(201).json(data)
							else{
								img.resize(body.sizes.xs).toFile(dir+namexs,(err,inf)=>{
									if(err) end(res,err,'POST-XS',obj)
									else{
										data.xs=dir_aux+namexs
										res.status(201).json({code:201,data:data})
									}
								})
							}
						}
					})
				}
			})
		}
	})
})

router.post('/galeria',(req,res)=>{
	const 	body=req.body,
			date=new Date(),mls=date.getTime(),year=date.getFullYear(),month=date.getMonth(),
			ext='.jpg',
			namelg='/'+mls+"-g-lg"+ext,namemd='/'+mls+"-g-md"+ext,
			namesm='/'+mls+"-g-sm"+ext,namexs='/'+mls+"-g-xs"+ext

	if(body.sizes.lg<10||body.sizes.md<10||body.sizes.sm<10){
		res.status(400).json('Peticion incorrecta: tamaños incorrectos')
		return false
	}

	var dir=req.urlfiles+"/"+year,
		dir_aux=req.urlfiles+"/"+year+"/"+month,
		data={simple:dir_aux+'/'+mls+'-p'},
		img

	if(!fs.existsSync(dir)) fs.mkdirSync(dir)
	dir+='/'+month
	if(!fs.existsSync(dir)) fs.mkdirSync(dir)

	img=sharp(new Buffer.from(body.base64.split(',')[1],'base64'),{failOnError:false}).jpeg({quality:70}).flatten({background:{r:255,g:255,b:255}})

	img.resize(body.sizes.lg).toFile(dir+namelg,(err,inf)=>{
		if(err) end(res,err,'POST-LG',obj)
	    else{
			data.lg=dir_aux+namelg
			img.resize(body.sizes.md).toFile(dir+namemd,(err,inf)=>{
				if(err) end(res,err,'POST-MD',obj)
				else{
					data.md=dir_aux+namemd
					img.resize(body.sizes.sm).toFile(dir+namesm,(err,inf)=>{
						if(err) end(res,err,'POST-LG',obj)
						else{
							data.sm=dir_aux+namesm
							if(body.sizes.xs==null) res.status(201).json(data)
							else{
								img.resize(body.sizes.xs).toFile(dir+namexs,(err,inf)=>{
									if(err) end(res,err,'POST-XS',obj)
									else{
										data.xs=dir_aux+namexs
										res.status(201).json(data)
									}
								})
							}
						}
					})
				}
			})
		}
	})
})


/*------------------------PATCH-------------------------*/
router.patch('/portada',(req,res)=>{
	const 	body=req.body,
			namew1300="-w1300",namew600="-w600",namew300="-w300",namew130="-w130",
			ext='.jpg'
	var	img=sharp(new Buffer.from(body.base64.split(',')[1], 'base64')).jpeg({quality:60})

	img.resize(1300).toFile(dir+namew1300+ext,(err,inf)=>{
		if(err) end(res,err,'PATCH-LG',obj)
	    else{
			img.resize(600).toFile(dir+namew600+ext,(err,inf)=>{
				if(err) end(res,err,'PATCH-MD',obj)
				else{
					img.resize(300).toFile(dir+namew300+ext,(err,inf)=>{
						if(err) end(res,err,'PATCH-SM',obj)
						else{
							img.resize(130).toFile(dir+namew130+ext,(err,inf)=>{
								(err)?end(res,err,'PATCH-XS',obj):res.status(201).json({data:imgdir})
							})
						}
					})
				}
			})
		}
	})
})


/*------------------------DELETE------------------------*/
router.delete('/portada',(req,res)=>{
	const 	namew1300="-w1300",namew600="-w600",namew300="-w300",namew130="-w130",ext='.jpg'

	fs.unlinkSync(dir+namew1300+ext)
	fs.unlinkSync(dir+namew600+ext)
	fs.unlinkSync(dir+namew300+ext)
	fs.unlinkSync(dir+namew130+ext)
	res.json({code:200})
})


module.exports=router