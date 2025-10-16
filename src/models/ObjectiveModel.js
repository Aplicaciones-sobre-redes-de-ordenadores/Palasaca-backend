// src/models/ObjectiveModel.js
class Objetivo {
  constructor(id, id_cuenta, Descripcion, PorcentajeAhorro, Cantidad_Objetivo, Cantidad_Actual, Fecha_Inicio, Fecha_Fin, imagenObjetivo, createdAt, updatedAt) {
    this.id = id;
    this.id_cuenta = id_cuenta;
    this.Descripcion = Descripcion;
    this.PorcentajeAhorro = PorcentajeAhorro;
    this.Cantidad_Objetivo = Cantidad_Objetivo;
    this.Cantidad_Actual = Cantidad_Actual;
    this.Fecha_Inicio = Fecha_Inicio;
    this.Fecha_Fin = Fecha_Fin;
    this.imagenObjetivo = imagenObjetivo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;//a
  }

    toJSON() {
    return {
        id: this.id,
        id_cuenta: this.id_cuenta,
        Descripcion: this.Descripcion,
        PorcentajeAhorro: this.PorcentajeAhorro,
        Cantidad_Objetivo: this.Cantidad_Objetivo,
        Cantidad_Actual: this.Cantidad_Actual,
        Fecha_Inicio: this.Fecha_Inicio,
        Fecha_Fin: this.Fecha_Fin,
        imagenObjetivo: this.imagenObjetivo,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
  }
}

module.exports = Objetivo;  
