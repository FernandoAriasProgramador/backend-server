
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var Ususario = require('../models/usuario');

// Rutas
app.get('/', (req, res, next) => {
    // esto es para la paginacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Ususario.find({ }, 'nombre email')
        //para la paginacion
        .skip(desde)
        .limit(3)
        .exec(
        ( err, usuarios ) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        // para contar la cantidad de elementos
        Ususario.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                usuarios,
                Total: conteo
            });
        });

    });

    
});






// Actualizar un Usuario

app.put('/:id', mdAutenticacion.verificaToken , (req, res) => {

    var id = req.params.id;

    Ususario.findById( id, (err, usuario) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuarios con id',
                errors: {mensaje: 'no existe un usuario'}
            });
        }
        var body = req.body;

        usuario.nombre = body.nombre,
        usuario.email = body.email,    
        usuario.role = body.role

        usuario.save((err, usuarioGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardar usuarios',
                    errors: err
                });
            }
    
            res.status(200).json({
                ok: true,
                usuarios: usuarioGuardado
            });
        });
    });
});

// Crear un nuevo Usuario

app.post('/', mdAutenticacion.verificaToken ,(req, res) => {

    var body = req.body;

    var usuario = new Ususario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardar usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuarios: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

// borrado de usuario

app.delete('/:_id', mdAutenticacion.verificaToken , (req, res) =>{
    var id= req._id;
    Ususario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuarios',
                errors: err
            });
        }
        if( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un usuarios con ese id',
                errors: {mensaje: 'no existe un usuarios con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarioBorrado
        });
    });
});

module.exports = app;