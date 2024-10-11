import { Ficha } from "../models/ficha.model.js";

class FichaController {

  static async getFichas(req, res) {
    try {
      const fichas = await Ficha.getFichas();
      res.status(200).json(fichas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las fichas" + error });
    }
  }

  static async getFicha(req, res) {
    try {
      const numero_Ficha = req.params.id;
      const ficha = await Ficha.getFicha(numero_Ficha);
      if (Ficha) {
        res.status(200).json(ficha);
      } else {
        res.status(404).json({ message: "Ficha no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la ficha" + error });
    }
  }

  static async UpdateFicha(req, res) {
    try {
      const numero_Ficha = req.params.numero_Ficha; // Asumiendo que pasas el número de ficha en los parámetros
      const updateData = {
        cordinacion_Ficha: req.body.cordinacion_Ficha,
        especialidad_Ficha: req.body.especialidad_Ficha,
      };
  
      const updatedFicha = await Ficha.updateFicha(numero_Ficha, updateData);
      res.status(200).json({ message: "Ficha actualizada con éxito", updatedFicha });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la ficha: " + error.message });
    }
  }

  static async postFicha(req, res) {
    try {
      const fi = {
        numero_Ficha: req.body.numero_Ficha,
        cordinacion_Ficha: req.body.cordinacion_Ficha,
        especialidad_Ficha: req.body.especialidad_Ficha,
      };

      console.log(fi); // Para asegurarte de que los datos se están enviando correctamente

      // Llamar al modelo para crear la ficha usando el procedimiento almacenado
      const result = await Ficha.createFicha(fi);

      // Verifica el resultado y devuelve el mensaje adecuado
      res.status(201).json({ message: result });
    } catch (error) {
      console.error("Error al crear la ficha:", error);
      res
        .status(500)
        .json({ message: "Error al crear la ficha: " + error.message });
    }
  }

  static async deleteFicha(req, res) {
    try {
      const { numero_Ficha } = req.params;
      console.log("numero_Ficha:", numero_Ficha);
      const result = await Ficha.eliminarFicha(numero_Ficha);
      if (result) {
        res.status(200).json({ message: "Ficha eliminada exitosamente" });
      } else {
        res.status(404).json({ message: "Ficha no encontrada" });
      }
    } catch (error) {
      console.error(`Error al eliminar la ficha: ${error.message}`);
      res.status(500).json({ message: "Error al eliminar la ficha" });
    }
  }
}

export default FichaController;
