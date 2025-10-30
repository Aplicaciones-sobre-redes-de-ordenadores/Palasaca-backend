class PagoModel {
  constructor(
    id_pago,
    id_cuenta,
    nombre,
    importe,
    tipo,
    fecha_limite,
    estado,
    recordatorio, 
    Comentarios,
    createdAt,
    updatedAt
  ) {
    this.id_pago = id_pago; 
    this.id_cuenta = id_cuenta; 
    this.nombre = nombre;
    this.importe = importe;
    this.tipo = tipo;
    this.fecha_limite = fecha_limite;
    this.estado = estado;
    this.recordatorio = recordatorio;
    this.Comentarios = Comentarios;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id_pago: this.id_pago,
      id_cuenta: this.id_cuenta,
      nombre: this.nombre,
      importe: this.importe,
      tipo: this.tipo,
      fecha_limite: this.fecha_limite,
      estado: this.estado,
      recordatorio: this.recordatorio,
      Comentarios: this.Comentarios,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = PagoModel;