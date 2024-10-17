import { Router } from "express";
import HorarioController from "../controllers/horario.controller.js";
import imageUpload from '../middlewares/upload.images.middleware.js';

const router = Router();
/* 
router.get( '/api/horario', HorarioController.getHorarios )
router.get( '/api/horario/:id',HorarioController.getHorario )
router.put( '/api/horario/:id', HorarioController.putHorario )
router.post( '/api/horario', HorarioController.postHorario )
router.delete( '/api/horario/:id', HorarioController.deleteHorario )

 */

router.get('/api/horarios/:numero_Ficha/:cordinacion_Ficha', HorarioController.obtenerHorarios);

// En la ruta para subir imágenes
router.post('/api/horarios/upload-image', imageUpload.single('imagen'), HorarioController.cargarImagenHorario);


export default router;