// Modelo para Bolsa
class BolsaModel {
  constructor(id, codigo, empresa, nombre, url_imagen, precio, variacionPrecio, createdAt, updatedAt) {
    this.id = id;
    this.codigo = codigo;
    this.empresa = empresa;
    this.nombre = nombre;
    this.url_imagen = url_imagen;
    this.precio = precio;
    this.variacionPrecio = variacionPrecio;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      codigo: this.codigo,
      empresa: this.empresa,
      nombre: this.nombre,
      url_imagen: this.url_imagen,
      precio: this.precio,
      variacionPrecio: this.variacionPrecio,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = BolsaModel;
