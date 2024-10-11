import { Router } from "express";
import TallerController from "../controllers/taller.controller.js";


const router = Router();

router.get( '/api/taller', TallerController.getTalleres )
router.get( '/api/taller/:id', TallerController.getTaller )
router.get('/api/taller/:nombre', TallerController.getTaller)
router.get('/api/tipos-talleres', TallerController.getTiposDeTalleres)
router.put( '/api/taller/:id', TallerController.putTaller )
router.post( '/api/taller', TallerController.postTaller )
router.delete( '/api/taller/:id_Taller', TallerController.deleteTaller )

export default router;