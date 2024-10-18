import { Horario } from "../models/horario.model.js";

class HorarioController {
  static async cargarImagenHorario(req, res) {
    try {
      const { fecha_fintrimestre_Horari, numero_FichaFK } = req.body;

      // Verificar que el archivo haya sido subido
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No se ha cargado ninguna imagen" });
      }

      // Obtener la URL de la imagen subida en Cloudinary
      const ruta_imagen_Horari = req.file.path; // Esta es la URL de la imagen en Cloudinary

      // Crear el horario en la base de datos
      const nuevoHorario = await Horario.create({
        fecha_fintrimestre_Horari,
        ruta_imagen_Horari, // Guardar la URL de Cloudinary
        numero_FichaFK,
      });

      res
        .status(201)
        .json({ message: "Horario creado con éxito", horario: nuevoHorario });
    } catch (error) {
      console.error(`Error al crear el horario: ${error}`);
      res
        .status(500)
        .json({
          message: "Error interno al crear el horario",
          error: error.message,
        });
    }
  }

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
        return res.status(404).json({
          message:
            "No se encontraron horarios para la ficha y coordinación especificadas.",
        });
      }

      // Enviar solo los datos relevantes (el primer objeto con los datos del horario)
      return res.status(200).json(horario);
    } catch (error) {
      console.error(`Error al obtener horarios: ${error}`);
      return res.status(500).json({
        message: "Ocurrió un error al obtener los horarios.",
        error: error.message,
      });
    }
  }

  static async eliminarHorario(req, res) {
    try {
      const { id_Horari } = req.params;

      // Verificar si el horario existe antes de eliminarlo
      const horarioExistente = await Horario.findByPk(id_Horari);
      if (!horarioExistente) {
        return res
          .status(404)
          .json({ message: `Horario con id ${id_Horari} no encontrado` });
      }

      // Eliminar el horario
      await Horario.eliminarHorario(id_Horari);

      res
        .status(200)
        .json({ message: `Horario con id ${id_Horari} eliminado con éxito` });
    } catch (error) {
      console.error(`Error al eliminar el horario: ${error}`);
      res
        .status(500)
        .json({
          message: "Error interno al eliminar el horario",
          error: error.message,
        });
    }
  }

  static async actualizarHorario(req, res) {
    try {
      const { id_Horari } = req.params;
      const { fecha_fintrimestre_Horari, numero_FichaFK } = req.body;
      let ruta_imagen_Horari = null;
  
      // Verificar si el horario existe antes de actualizarlo
      const horarioExistente = await Horario.findByPk(id_Horari);
      if (!horarioExistente) {
        return res.status(404).json({ message: `Horario con id ${id_Horari} no encontrado` });
      }
  
      // Si se carga una nueva imagen, obtener la URL de la imagen en Cloudinary
      if (req.file) {
        ruta_imagen_Horari = req.file.path; // Esta es la nueva URL de la imagen en Cloudinary
      }
  
      // Crear un objeto con los datos que pueden ser actualizados
      const datosActualizados = {
        fecha_fintrimestre_Horari: fecha_fintrimestre_Horari || horarioExistente.fecha_fintrimestre_Horari,
        numero_FichaFK: numero_FichaFK || horarioExistente.numero_FichaFK,
        ruta_imagen_Horari: ruta_imagen_Horari || horarioExistente.ruta_imagen_Horari,
      };
  
      // Actualizar el horario
      await Horario.actualizarHorario(id_Horari, datosActualizados);
  
      res.status(200).json({ message: `Horario con id ${id_Horari} actualizado con éxito` });
    } catch (error) {
      console.error(`Error al actualizar el horario: ${error}`);
      res.status(500).json({ message: 'Error interno al actualizar el horario', error: error.message });
    }
  }

  static async obtenerTodosLosHorarios(req, res) {
    try {
      // Llama al método en el modelo para obtener todos los horarios
      const horarios = await Horario.obtenerTodosLosHorarios();
      
      // Verifica si hay horarios
      if (horarios.length === 0) {
        return res.status(404).json({ message: "No se encontraron horarios." });
      }

      // Respuesta con los horarios obtenidos
      return res.status(200).json(horarios);
    } catch (error) {
      console.error(`Error al obtener todos los horarios: ${error.message}`);
      return res.status(500).json({ message: "Error al obtener los horarios", error: error.message });
    }
  }

}

export default HorarioController;
