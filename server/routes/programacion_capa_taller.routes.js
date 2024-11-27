import { Router } from "express";
import ProgramacionCapaTallerController  from "../controllers/programacion_capa_taller.controller.js";


const router = Router();

router.get( '/api/programacion',  ProgramacionCapaTallerController.getProgramacionesCT )
router.get( '/api/programacion/:id',  ProgramacionCapaTallerController.getProgramacionCT )
router.get('/api/programaciones/:sede', ProgramacionCapaTallerController.getProgramacionesPorSede)
router.get('/api/programacion/ficha/:ficha', ProgramacionCapaTallerController.getProgramacionesPorFicha)
router.put('/api/programacion/:id', ProgramacionCapaTallerController.putProgramacionCT)
router.post('/api/programacion', ProgramacionCapaTallerController.postProgramacionCT)
router.delete( '/api/programacion/:id_procaptall',  ProgramacionCapaTallerController.deleteProgramacionCT )

router.get('/api/sede52', ProgramacionCapaTallerController.obtenerProgramacionesSede52);
router.get('/api/programaciones/sede64', ProgramacionCapaTallerController.obtenerProgramacionesSede64);
router.get('/api/programaciones/sedeFontibon', ProgramacionCapaTallerController.obtenerProgramacionesSedeFontibon);


// Ruta para obtener el informe
router.post('/api/obtenerInforme', ProgramacionCapaTallerController.postObtenerInforme);

// Ruta para generar el informe en PDF
router.post('/api/generarInformePDF', ProgramacionCapaTallerController.postGenerarInformePDF);

export default router;