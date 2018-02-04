

var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Rutas
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');   //Para q no tenga en cuanta las mayusculas o minusculas

    Promise.all( [
        buscarHospitales(busqueda, regex),
        buscarMedico(busqueda, regex),
        buscarUsuario(busqueda, regex)
    ])
    .then( respuestas => {
        res.status(200).json({
            ok: true,
            Hospitales: respuestas[0],
            Medicos: respuestas[1],
            Usuarios: respuestas[2]
        });
    });
});

function buscarHospitales( busqueda, regex ) {
    return new Promise((resolve, reject) => {
        Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')                // Para hacer innerJoin en la tabla
            .exec((err, _hospital) => {
                if(err){
                    reject('Error al cargar hospital', err);
                }else{
                    resolve(_hospital);
                }
        });
    })
}

function buscarMedico( busqueda, regex ) {
    return new Promise((resolve, reject) => {
        Medico.find({nombre: regex}, (err, _medico) => {
            if(err){
                reject('Error al cargar Medicos', err);
            }else{
                resolve(_medico);
            }
        });
    })
}

function buscarUsuario( busqueda, regex ) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')                // para filtrar los resultados
                .or([ {'nombre': regex}, {'email': regex} ])  // Para buscar en 2 columnas en la misma tabla                 
                .exec((err, _usuario) => {                    // a la vez
            if(err){
                reject('Error al cargar Medicos', err);
            }else{
                resolve(_usuario);
            }
        });
    })
}


// busqueda por coleccion

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i'); 

    var coleccion = req.params.tabla;

    var promesa;
    switch (coleccion){
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedico(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar ',
                errors: {mensaje: 'no existe el parametro'}
            }); 
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [coleccion]: data
        });
    });
});

module.exports = app;