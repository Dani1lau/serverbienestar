import { Taller } from "../models/taller.model.js";

class TallerController {
    static async getTalleres(req, res){
        try {
            const talleres = await Taller.getTalleres();
            res.status( 200  ).json( talleres );
        } catch (error) {
            res.status( 500  ).json( { message: "Error al obtener talleres" +  error } );
        }
    }   

    static async getTiposDeTalleres(req, res) {
        try {
            // Llamada al método que usa el procedimiento almacenado
            const tiposDeTalleres = await Taller.getTiposDeTalleres();
            res.status(200).json(tiposDeTalleres);
        } catch (error) {
            // Enviar el error detallado en la respuesta
            res.status(500).json({ message: "Error al obtener tipos de talleres: " + error.message });
        }
    }

    static async getTaller(req, res){
        try {
            const id = req.params.id;
            const  taller = await Taller.getTaller(id);
            if  ( taller ) {
                res.status( 200  ).json( taller );
            } else {
                res.status( 404  ).json( { message: "Taller no encontrado" } );
            }
        } catch (error) {
            res.status( 500  ).json( { message: "Error al obtener el taller" +  error } );
        }
    }

    static async getTaller(req, res) {
        try {
            const nombreTaller = req.params.nombre; // Cambia 'id' por 'nombre' para buscar por nombre
            const taller = await Taller.getTallerPorNombre(nombreTaller);
            if (taller && taller.length > 0) {
                res.status(200).json(taller);
            } else {
                res.status(404).json({ message: "Taller no encontrado" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el taller: " + error });
        }
    }


    static async putTaller(req, res){
        try {
            const update_taller = {
                nombre_Taller: req.body.nombre_Taller,
                tipo_Taller:  req.body.tipo_Taller,
            }
            const id = req.params.id;
            await Taller.updateTaller(id, update_taller);
            res.status( 200  ).json( { message: "Taller actualizado con éxito"} );
        } catch (error) {
            res.status( 500  ).json( { message: "Error al actualizar el taller" +  error } );
        }
    }

    static  async postTaller(req, res){
        try {
            const tll = {
                nombre_Taller: req.body.nombre_Taller,
                tipo_Taller:  req.body.tipo_Taller,
             }
            await  Taller.createTaller(tll);
            res.status( 201 ).json( { message: "Taller creado con exito" } );
        } catch (error) {
            res.status( 500  ).json( { message: "Error al crear taller" + error } );
        }
    }

    static async deleteTaller(req, res) {
        try {
            const { id_Taller } = req.params;
            console.log('id_Taller:', id_Taller);
            const result = await Taller.eliminarTaller(id_Taller);
            if (result) {
                res.status(200).json({ message: 'Taller eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Taller no encontrado' });
            }
        } catch (error) {
            console.error(`Error al eliminar el taller: ${error.message}`);
            res.status(500).json({ message: 'Error al eliminar el taller' });
        }
    }

}

export default TallerController;