import { Horario } from "../models/horario.model.js";

class HorarioController {
  static async cargarImagenHorario (req, res) {
    try {
      const { fecha_fintrimestre_Horari, numero_FichaFK } = req.body;
  
      // Verificar que el archivo haya sido subido
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha cargado ninguna imagen' });
      }
  
      // Obtener la URL de la imagen subida en Cloudinary
      const ruta_imagen_Horari = req.file.path; // Esta es la URL de la imagen en Cloudinary
  
      // Crear el horario en la base de datos
      const nuevoHorario = await Horario.create({
        fecha_fintrimestre_Horari,
        ruta_imagen_Horari,  // Guardar la URL de Cloudinary
        numero_FichaFK,
      });
  
      res.status(201).json({ message: 'Horario creado con éxito', horario: nuevoHorario });
    } catch (error) {
      console.error(`Error al crear el horario: ${error}`);
      res.status(500).json({ message: 'Error interno al crear el horario', error: error.message });
    }
  };


  static async obtenerHorarios(req, res) {
    const { numero_Ficha, cordinacion_Ficha } = req.params;

    try {
      // Verificar los parámetros
      if (!numero_Ficha || !cordinacion_Ficha) {
        return res
          .status(400)
          .json({ message: "Número de ficha y coordinación son requeridos." });
      }

      // Llamar al modelo para obtener los horarios
      const horario = await Horario.obtenerHorariosPorFichaYCoordinacion(
        numero_Ficha,
        cordinacion_Ficha
      );

      // Verificar si se encontró un horario
      if (!horario) {
        return res
          .status(404)
          .json({
            message:
              "No se encontraron horarios para la ficha y coordinación especificadas.",
          });
      }

      // Enviar solo los datos relevantes (el primer objeto con los datos del horario)
      return res.status(200).json(horario);
    } catch (error) {
      console.error(`Error al obtener horarios: ${error}`);
      return res
        .status(500)
        .json({
          message: "Ocurrió un error al obtener los horarios.",
          error: error.message,
        });
    }
  }
}

export default HorarioController;
