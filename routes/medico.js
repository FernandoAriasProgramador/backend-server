
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

// Rutas
app.get('/', (req, res, next) => {
    // esto es para la paginacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({ })
        // para la paginacion
        .skip(desde)
        .limit(3)
        // para filtrar la consulta
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
        ( err, _medico ) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando Medicos',
                errors: err
            });
        }

        // para contar la cantidad de elementos
        Medico.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                medico: _medico,
                Total: conteo
            });
        });
    }); 
});

// Actualizar un Usuario

app.put('/:id', mdAutenticacion.verificaToken , (req, res) => {

    var id = req.params.id;

    Medico.findById( id, (err, _medico) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Medico',
                errors: err
            });
        }
        if(!_medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar medico con id',
                errors: {mensaje: 'no existe un medico'}
            });
        }
        var body = req.body;

        _medico.nombre = body.nombre

        _medico.save((err, medicoGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardar medico',
                    errors: err
                });
            }
    
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// Crear un nuevo Usuario

app.post('/', mdAutenticacion.verificaToken ,(req, res) => {

    var body = req.body;

    var _medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital        
    });

    _medico.save((err, medicoGuardado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardar medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    });

});

// borrado de Hospital

app.delete('/:_id', mdAutenticacion.verificaToken , (req, res) =>{
    var id= req._id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Medico',
                errors: err
            });
        }
        if( !medicoBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe medico con ese id',
                errors: {mensaje: 'no existe un medico con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;