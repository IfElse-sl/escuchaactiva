const 	router=require('express').Router(),
		Sequelize = require('sequelize'),
		cryptojs = require('crypto-js'),
		Op=Sequelize.Op,
		fs=require('fs'),
		end=require('../functions').end,
		enviarEmail=require('../functions').enviarEmail,
		obj='CREDENCIALES'

router.all('/*',(req,res,next)=>{
	req.models=require('./orm').relations(res.locals.conn)
	next()
})

/*------------------------POST--------------------------*/
router.post('/login',(req,res)=>{
	const 	body=req.body,
			Credencial=req.models.Credencial

	Credencial.findOne({
		attributes:['ID','pacienteID','profesionalID','pass','email','estado'],
		where:{
			email:body.email,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(!data||data.get('ID')==null){
	    	res.json({code:404})
	    	return false
		}

		let hash=data.get('pass').substr(6),
			sal=data.get('pass').substr(0,6),
			estado=data.get('estado')

		if(cryptojs.SHA3(sal+body.pass).toString()!=hash){
	    	res.json({code:204,msg:'Sin datos'})
	    	return false
		}

		if(estado=='ACTIVO') res.json({code:201,data})
		else{
			var dataAux={
				ID: data.ID,
				email:data.email
			}
			res.json({code:202,data:dataAux,msg:estado})
		}
	}).catch(err=>{end(res,err,'POST-LOGIN',obj)})
})

router.post('/login/google',(req,res)=>{
	const 	body=req.body,
			Credencial=req.models.Credencial

	res.locals.conn.transaction().then(tr=>{
		Credencial.findOne({
			attributes:['ID','pacienteID','profesionalID','email','estado','token'],
			where:{
				email:body.email,
				estado:{[Op.not]:'BAJA'}
			},
			transaction:tr
		}).then(data=>{
			if(!data){
		    	res.json({code:404})
		    	return false
			}
			var token=data.get('token'),
				ID=data.get('ID')
				dato=data

			if(body.token==token){
				res.json({code:201,data})
				return true
			}
			
			if(token==null){
				Credencial.update({
					token:body.token
				},{
					where:{
						ID:ID,
						estado:{[Op.not]:'BAJA'}
					},
					transaction:tr
				}).then(data=>{
					if(!data){
						tr.rollback()
						res.json({code:404,msg:'No se pudo actualizar el token enviado',data:{put:data}})
					}else{
						tr.commit()
						res.json({code:201,msg:'token actualizado',data:dato})
					}
    			}).catch(err=>{end(res,err,'POST-LOGIN',obj,tr)})
			}else{
				tr.rollback()
				res.json({code:401,msg:'token invalido'})
			}
    	}).catch(err=>{end(res,err,'POST-LOGIN',obj,tr)})
	})
})

/*-------------------------PATCH--------------------------*/
router.patch('/pass/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Credencial=req.models.Credencial

	Credencial.findOne({
		attributes:['pass'],
		where:{
			ID:id,
			estado:{[Op.not]:'BAJA'}
		}
	}).then(data=>{
		if(!data){
			res.json({code:204})
			return false
		}

		let hash=data.get('pass').substr(6),
			sal=data.get('pass').substr(0,6)

		if(cryptojs.SHA3(sal+body.pass).toString()!=hash){
	    	res.json({code:401,msg:'password incorrecta'})
	    	return false
		}

		Credencial.update({
			pass:body.passNew
		},{
			where:{
				ID:id,
				estado:{[Op.not]:'BAJA'}
			}
		}).then(data=>{(data==0)?res.json({code:404}):res.status(201).json({code:201})
    	}).catch(err=>{end(res,err,'PATCH',obj)})
    }).catch(err=>{end(res,err,'PATCH-GET',obj)})
})

router.patch('/generar-codigo/id/(:id)?',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
			Credencial=req.models.Credencial

	var where={
			email:body.email,
			estado:{[Op.not]:'BAJA'}
		}
	if(id!='undefined') where.ID=id
	res.locals.conn.transaction().then(tr=>{
		Credencial.findOne({
			attributes:['ID','profesionalID','pacienteID','nombre','codigo'],
			where:where,
			transaction:tr
		}).then(data=>{
			if(!data){
				res.json({code:403,msg:'Código existente'})
				return false
			}

			if((data.get('codigo')==""||data.get('codigo')==null)){
				var codigo=String(Math.random()).slice(-5),
					dato={
						motivo:body.motivo,
						credencial:{
							nombre:data.get('nombre'),
						}
					}
				where.ID=data.get('ID')

				switch(body.motivo){
					case 'email':
						codigo = 'M-'+codigo
						dato.codigo=codigo
						dato.credencial.email=body.newMail
						break;
					case 'pass':
						codigo = 'P-'+codigo
						dato.codigo=codigo
						dato.credencial.email=body.email
						break;
					default:
						res.json({code:400,msg:'Motivo no valido'})
						return false
				}

				var query="CREATE EVENT codigo_"+codigo.replace('-','')+where.ID+" ON SCHEDULE AT DATE_ADD(NOW(),INTERVAL 1 HOUR) DO "
				query+="UPDATE credenciales SET codigo=null WHERE ID="+where.ID+" AND codigo='"+codigo+"'"
				
				Credencial.update({
					codigo:codigo
				},{
					where:where,
					transaction:tr
				}).then(data=>{
					if(data==0){
						tr.rollback()
						res.json({code:404,data:{patch:data}})
						return false
					}
					res.locals.conn.query(query,{transaction:tr}).then(data1=>{
						mails.newCodigo(dato)
						tr.commit()
						res.status(201).json({code:201,data:{patch:data}})	
    				}).catch(err=>{end(res,err,'PATCH-EVENT',obj,tr)})
    			}).catch(err=>{end(res,err,'PATCH',obj,tr)})
			}else{
				tr.rollback()
				res.json({code:403,msg:'Código existente'})
			}
    	}).catch(err=>{end(res,err,'PATCH-GET',obj,tr)})
	})
})

router.patch('/cambiar-pass',(req,res)=>{
	const 	body=req.body,
			Credencial=req.models.Credencial

	res.locals.conn.transaction().then(tr=>{
		Credencial.findOne({
			attributes:['ID'],
			where:{
				email:body.email,
				codigo:body.codigo,
				estado:{[Op.not]:'BAJA'}
			}
		}).then(data=>{
			if(!data){
				tr.rollback()
				res.json({code:404})
				return false
			}

			const 	idN= data.get('ID'),
					ncodigo = body.codigo.replace('-',''),
					query = 'DROP EVENT IF EXISTS codigo_'+idN+'_'+ncodigo

			Credencial.update({
				password:body.password,
				codigo:null
			},{
				where:{
					email:body.email,
					codigo:body.codigo,
					estado:{[Op.not]:'BAJA'}
				},
				transaction:tr
			}).then(data=>{
				if(data==0){
					tr.rollback()
					res.json({code:404})
					return false
				}
				res.locals.conn.query(query,{transaction:tr}).then(data1=>{
					tr.commit()
					res.json({code:201})
    			}).catch(err=>{end(res,err,'PATCH-EVENT',obj,tr)})
    		}).catch(err=>{end(res,err,'PATCH',obj,tr)})
    	}).catch(err=>{end(res,err,'PATCH-GET',obj,tr)})
 	})
})

router.patch('/confirmar-email/id/:id',(req,res)=>{
	const 	id=String(req.params.id),
			body=req.body,
		 	ncodigo=body.codigo.replace('-',''),
			query='DROP EVENT IF EXISTS codigo_'+id+'_'+ncodigo,
			Credencial=req.models.Credencial

	res.locals.conn.transaction().then(tr=>{
		Credencial.update({
			email:body.email,
			estado:'ACTIVO',
			codigo:null
		},{
			where:{
				ID:id,
				codigo:body.codigo,
				estado:{[Op.or]:['ACTIVO','PENDIENTE']}
			},
			transaction:tr
		}).then(data=>{
			if(data==0){
				tr.rollback()
				res.json({code:404})
				return false
			}

			res.locals.conn.query(query,{transaction:tr}).then(data1=>{
				tr.commit()
				res.json({code:201})
    		}).catch(err=>{end(res,err,'PATCH-EVENT',obj,tr)})
    	}).catch(err=>{end(res,err,'PATCH',obj,tr)})
 	})
})

module.exports=router
