var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    //validacion de tipo de tabla
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Error tipo de coleccion no es valido'            
        });
    }

    if(!req.files ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al cargar imagen'            
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencion = nombreCortado [nombreCortado.length -1];
    // solo las extenciones aceptadas
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extencionesValidas.indexOf( extencion ) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extencion invalida'            
        });
    }
    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`;

    //Mover el archivo a una carpeta
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, err => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo (tipo, id, nombreArchivo, res);
    })

});

function subirPorTipo (tipo, id, nombreArchivo, res){
    if ( tipo === 'usuarios'){
        Usuario.findById(id, (err, usuario) => {
            var pathViejo = './uploads/usuarios/'+ usuario.img;
            //Elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink( pathViejo);            
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'archivo movido realizada correctamente',
                    usuario: usuarioActualizado
                });
            });

        });
        return
    }
    if ( tipo === 'medicos'){
        Medico.findById(id, (err, medico) => {
            var pathViejo = './uploads/medicos/'+ medico.img;
            //Elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink( pathViejo);            
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'archivo movido realizada correctamente',
                    medico: medicoActualizado
                });
            });

        });
        return
    }
    if ( tipo === 'hospitales'){
        Hospital.findById(id, (err, _hospital) => {
            var pathViejo = './uploads/hospitales/'+ _hospital.img;
            //Elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink( pathViejo);            
            }
            _hospital.img = nombreArchivo;
            _hospital.save((err, hospitalActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'archivo movido realizada correctamente',
                    Hospital: hospitalActualizado
                });
            });

        });
        return
    }
}



module.exports = app;