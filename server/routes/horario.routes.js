import { Router } from "express";
import HorarioController from "../controllers/horario.controller.js";
import imageUpload from '../middlewares/upload.images.middleware.js';

const router = Router();

// Ruta para actualizar un horario por su ID (incluyendo imagen)
router.put('/api/horarios/:id_Horari', imageUpload.single('imagen'), HorarioController.actualizarHorario);
router.get('/api/horarios', HorarioController.obtenerTodosLosHorarios);
router.delete('/api/horarios/:id_Horari', HorarioController.eliminarHorario);
router.get('/api/horarios/:numero_Ficha/:cordinacion_Ficha', HorarioController.obtenerHorarios);

// En la ruta para subir imágenes
router.post('/api/horarios/upload-image', imageUpload.single('imagen'), HorarioController.cargarImagenHorario);


export default router;