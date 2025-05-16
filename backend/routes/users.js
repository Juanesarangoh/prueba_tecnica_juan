const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();


const userValidations = [
    // Validaciones de campos obligatorios
    body('nombres').trim().notEmpty().withMessage('El nombre es requerido'),
    body('apellidos').trim().notEmpty().withMessage('Los apellidos son requeridos'),
    body('tipoDocumento').trim().notEmpty().withMessage('El tipo de documento es requerido'),
    body('numeroDocumento').trim().notEmpty().withMessage('El número de documento es requerido'),
    body('celular')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('El número de celular debe ser numérico')
        .isLength({ min: 10, max: 10 }).withMessage('El número de celular debe tener 10 dígitos')
];


 // Obtiene todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});


//Crea un nuevo usuario
router.post('/', userValidations, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Verificar si el usuario ya existe por documento
        const existingUser = await User.findByDocument(req.body.tipoDocumento, req.body.numeroDocumento);
        if (existingUser) {
            return res.status(400).json({ error: 'Usuario ya existe con este documento' });
        }

        const userData = {
            ...req.body
        };

        const user = new User(userData);
        const savedUser = await user.save();


        res.status(201).json(savedUser);

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message || 'Error al crear usuario' });
    }
});


 // Elimina un usuario por su tipo y número de documento
router.delete('/:tipoDocumento/:numeroDocumento', async (req, res) => {
    try {
        const { tipoDocumento, numeroDocumento } = req.params;
        const deleted = await User.deleteUser(tipoDocumento, numeroDocumento);
        
        if (deleted) {
            res.json({ message: 'Usuario eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;