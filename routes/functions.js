const fs=require('fs'),nodemailer=require('nodemailer')
exports.end=(res,msg,type,obj,tr=null,body=null)=>{
    console.log('Error: ',type,obj,msg)
    let code=400,data={}
    if(tr) tr.rollback()
    if(body) body=JSON.stringify(body)
    if(msg.parent&&msg.parent.errno==1062){
        data.duplicate=msg.parent.sqlMessage.split("'")[3]
        code=409
    }
    fs.appendFile('error.txt','- '+new Date().toLocaleString()+','+type+','+obj+','+msg+','+body+'\n',(err)=>{})
    msg=String(msg)
    res.status(code).json({code,msg,data})
}

exports.notificacion=(body,prod)=>{
    var XMLHttpRequest=require("xmlhttprequest").XMLHttpRequest,
        xhr=new XMLHttpRequest()
    body=JSON.stringify(body)
    xhr.withCredentials=true

    xhr.addEventListener("readystatechange",()=>{
        if(xhr.readyState===4){
            try{
                var response=JSON.parse(xhr.responseText),data={}
                if(response.status==404) return{code:404}
                else return{code:200,data}
            }catch(err){
                console.log(err)
                return{code:400,msg:'Error: '+err}
            }
        }
    })

    var url=(prod)?"http://localhost:15000/api/notificaciones":"http://localhost:15000/api/notificaciones"
    xhr.open("POST",url)
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.send(body)
}

exports.enviarEmail=async(body)=>{
        let config={
            host:"smtp.zoho.com",
            port:587,
            secure:false,
            auth:{
                user:"contacto@ifelse.com.ar",
                pass:"Ifelse.123"
            }
        }
        const transporter=nodemailer.createTransport(config);
        const mailOptions={
            from:'Escucha Activa <'+config.auth.user+'>',
            to:body.to,
            subject:body.asunto,
            html:`<body style="margin: 0; padding: 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
                        <tr>
                            <td style="padding: 10px 0 30px 0;">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                                    <tr>
                                        <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="display:flex; flex-direction: column;justify-content: space-between;">
                                                <tr>
                                                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 18px;">
                                                    ${body.cuerpo}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        ${body.foot}
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>`
    };
        transporter.sendMail(mailOptions,function(error,info){error? console.log('Error al enviar mail: '+error):console.log("Se envio el mail")});
        // return new Promise((resolve,reject)=>{
        //     transporter.sendMail(mailOptions, (err,info,response)=>{
        //         if(err){
        //             console.error({code:400,msg:'Problema al enviar Email',err})
        //             reject(400)
        //         }else{
        //             console.log(info,response)
        //             resolve(200)
        //         }
        //     })
        // })
    }
