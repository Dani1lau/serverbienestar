import { Horario } from '../models/horario.model.js';

class HorarioController {
  // Método para cargar la imagen y crear un nuevo horario
  static async cargarImagenHorario(req, res) {
    try {
      const { fecha_fintrimestre_Horari, numero_FichaFK } = req.body;

      // Verificar si se cargó una imagen
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha cargado ninguna imagen' });
      }

      // Obtener la ruta o nombre del archivo de imagen
      const ruta_imagen_Horari = req.file.filename;

      // Crear el horario con la fecha final del trimestre, la ruta de la imagen y el número de ficha
      const nuevoHorario = await Horario.createHorario({
        fecha_fintrimestre_Horari,
        ruta_imagen_Horari,
        numero_FichaFK
      });

      res.status(201).json({ message: 'Horario creado con éxito', horario: nuevoHorario });
    } catch (error) {
      console.error(`Error al cargar imagen y crear horario: ${error}`);
      res.status(500).json({ message: 'Error interno al crear el horario' });
    }
  }
}

export default HorarioController;
