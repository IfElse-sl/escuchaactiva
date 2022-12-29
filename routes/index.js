const express = require('express'),
	app = express(),
	router=require('express').Router()

router.use('/*',(req,res,next)=>{
	
	//conexion para la api en produccion o en test
	if(res.locals.prod) 
		res.locals.conn=require('./connect').conn('repo.ifelse.com.ar','ifelse','escuchaactiva','ifelse_repo')
	else 
		res.locals.conn=require('./connect').conn('repo.ifelse.com.ar','ifelse','escuchaactiva','ifelse_repo')

	//Ruteo de modulo correspondiente en la api
	const modulo=req.originalUrl.split('/')
	router.use('/'+modulo[2],require('./'+modulo[2]))
	next()
})

module.exports=router
