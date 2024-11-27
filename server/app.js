import express from 'express';
import cors from 'cors';
import path from 'path';
import UsuarioRoutes  from './routes/usuario.routes.js';
import AdministradorRoutes from  './routes/administrador.routes.js';
import InstructorRoutes from './routes/instructor.routes.js';
import CapacitadorRoutes  from './routes/capacitador.routes.js';
import HorarioRoutes  from './routes/horario.routes.js';
import FichaRouter  from './routes/ficha.routes.js';
import RolRouter  from './routes/rol.routes.js';
import TallerRoutes   from './routes/taller.routes.js';
import DisponibilidadBienestarRoutes  from './routes/disponibilidad_bienestar.routes.js';
import ProgramacionCapaTallerRoutes from './routes/programacion_capa_taller.routes.js';
import ExcelRoutes from './routes/excelImg.routes.js';
import AutenticacionRoutes from './routes/autenticacion.routes.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


dotenv.config();

// Crear __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();

app.use(express.json());
app.use(cors());

// Servir la carpeta 'uploads' como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/img', express.static(path.join(__dirname, 'img')));

// Usar las rutas de la aplicación
app.use(UsuarioRoutes);
app.use(AdministradorRoutes);
app.use(InstructorRoutes);
app.use(CapacitadorRoutes);
app.use(HorarioRoutes);
app.use(FichaRouter);
app.use(RolRouter);
app.use(TallerRoutes);
app.use(DisponibilidadBienestarRoutes);
app.use(ProgramacionCapaTallerRoutes);
app.use(ExcelRoutes);
app.use(AutenticacionRoutes);

export default app;