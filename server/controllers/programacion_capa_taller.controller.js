import { ProgramacionCapaTaller } from "../models/programacion_capa_taller.model.js";

class ProgramacionCapaTallerController {
  // Obtener programaciones por ficha
  static async getProgramacionesPorFicha(req, res) {
    try {
      const ficha = parseInt(req.params.ficha, 10);
      const cordinacion = req.params.cordinacion;

      if (!ficha || !cordinacion) {
        return res.status(400).json({ message: "Parámetros inválidos" });
      }

      // Llama al método del modelo
      const programaciones =
        await ProgramacionCapaTaller.getProgramacionPorFicha(
          ficha,
          cordinacion
        );

      // Filtrar duplicados basado en 'fecha_procaptall' y 'horaInicio_procaptall'
      const uniqueProgramaciones = programaciones.filter(
        (programacion, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.fecha_procaptall === programacion.fecha_procaptall &&
              p.horaInicio_procaptall === programacion.horaInicio_procaptall
          )
      );

      res.status(200).json(uniqueProgramaciones);
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por ficha (${req.params.ficha}):`,
        error
      );
      res.status(500).json({
        message: `Error al obtener las programaciones: ${error.message}`,
      });
    }
  }

  static async getProgramacionesPorSede(req, res) {
    const { sede } = req.params;
    try {
      const result = await ProgramacionCapaTaller.getProgramacionesBySede(sede);
      res.status(200).json(result);
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por sede (${sede}): `,
        error
      );
      res
        .status(500)
        .json({ message: "Error al obtener las programaciones por sede" });
    }
  }

  // controller.js
  static async getProgramacionesCT(req, res) {
    try {
      const results = await ProgramacionCapaTaller.getProgramacionesCT();
      console.log(
        "Resultados del procedimiento:",
        JSON.stringify(results, null, 2)
      ); // Detalle de resultados

      // Convertir el objeto en un array
      const programacionesCT = Object.values(results[0]); // Asumiendo que el primer elemento es el objeto que contiene las programaciones

      if (Array.isArray(programacionesCT) && programacionesCT.length > 0) {
        res.status(200).json(programacionesCT);
      } else {
        res.status(404).json({ message: "No se encontraron programaciones." });
      }
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener las programaciones: " + error.message,
      });
    }
  }

  static async getProgramacionCT(req, res) {
    try {
      const id_procaptall = req.params.id;
      const programacionCT = await ProgramacionCapaTaller.getProgramacionCT(
        id_procaptall
      );
      if (programacionCT) {
        res.status(200).json(programacionCT);
      } else {
        res.status(404).json({ message: "Programacion no encontrada" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener la programacion" + error });
    }
  }

  static async putProgramacionCT(req, res) {
    try {
      const update_programacionCT = {
        sede_procaptall: req.body.sede_procaptall,
        descripcion_procaptall: req.body.descripcion_procaptall,
        ambiente_procaptall: req.body.ambiente_procaptall,
        fecha_procaptall: req.body.fecha_procaptall,
        horaInicio_procaptall: req.body.horaInicio_procaptall,
        horaFin_procaptall: req.body.horaFin_procaptall,
        nombreTaller: req.body.nombreTaller,
        nombreCapacitador: req.body.nombreCapacitador,
        numero_FichaFK: req.body.numero_FichaFK,
      };

      // Validación de datos
      for (const key in update_programacionCT) {
        if (!update_programacionCT[key]) {
          return res
            .status(400)
            .json({ message: "Todos los campos son obligatorios." });
        }
      }

      const id_procaptall = req.params.id;

      // Actualizar la programación
      await ProgramacionCapaTaller.updateProgramacionCT(
        id_procaptall,
        update_programacionCT
      );
      res.status(200).json({ message: "Programación actualizada con éxito" });
    } catch (error) {
      console.error(`Error al actualizar la programación: ${error.message}`);
      res.status(500).json({
        message: "Error al actualizar la programación: " + error.message,
      });
    }
  }

  static async postProgramacionCT(req, res) {
    try {
      // Aquí obtenemos los datos que vienen desde el cuerpo de la solicitud
      const pct = {
        sede_procaptall: req.body.sede_procaptall,
        descripcion_procaptall: req.body.descripcion_procaptall,
        ambiente_procaptall: req.body.ambiente_procaptall,
        fecha_procaptall: req.body.fecha_procaptall,
        horaInicio_procaptall: req.body.horaInicio_procaptall,
        horaFin_procaptall: req.body.horaFin_procaptall,
        nombreTaller: req.body.nombreTaller, // Nombre del taller
        nombreCapacitador: req.body.nombreCapacitador, // Nombre completo del capacitador
        numero_FichaFK: req.body.numero_FichaFK,
        nombreInstructor: req.body.nombreInstructor // Nombre completo del instructor
      };
  
      // Validación de datos (opcional)
      if (
        !pct.sede_procaptall ||
        !pct.descripcion_procaptall ||
        !pct.ambiente_procaptall ||
        !pct.fecha_procaptall ||
        !pct.horaInicio_procaptall ||
        !pct.horaFin_procaptall ||
        !pct.nombreTaller ||
        !pct.nombreCapacitador ||
        !pct.numero_FichaFK ||
        !pct.nombreInstructor // Se agrega la validación del nombre del instructor
      ) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios." });
      }
  
      // Llamamos al modelo para crear la programación
      await ProgramacionCapaTaller.createProgramacionCT(pct);
  
      // Respuesta exitosa
      res.status(201).json({ message: "Programación creada con éxito" });
    } catch (error) {
      // En caso de error, devolvemos el mensaje de error
      console.error(`Error al crear la programación: ${error.message}`);
      res
        .status(500)
        .json({ message: "Error al crear la programación: " + error.message });
    }
  }


  static async deleteProgramacionCT(req, res) {
    try {
      const { id_procaptall } = req.params;
      console.log("id_procaptall:", id_procaptall);
      const result = await ProgramacionCapaTaller.eliminarProgramacionCT(
        id_procaptall
      );
      if (result) {
        res
          .status(200)
          .json({ message: "Programacion eliminada exitosamente" });
      } else {
        res.status(404).json({ message: "Programacion no encontrada" });
      }
    } catch (error) {
      console.error(`Error al eliminar la programacion: ${error.message}`);
      res.status(500).json({ message: "Error al eliminar la programacion" });
    }
  }
}

export default ProgramacionCapaTallerController;
